import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';
import { decodeBase64, encodeBase64 } from "https://deno.land/std@0.224.0/encoding/base64.ts";

function cleanBase64String(base64String) {
  return base64String.replace(/[\s\n\r\t]/g, '');
}

async function loadPrivateKeyAndFingerprint() {
  const pem = Deno.env.get("SNOWFLAKE_PRIVATE_KEY")?.trim();
  if (!pem) throw new Error("SNOWFLAKE_PRIVATE_KEY env var is required (PEM PKCS#8)");

  try {
    const body = pem.replace(/-----BEGIN (ENCRYPTED )?PRIVATE KEY-----/g, '')
                    .replace(/-----END (ENCRYPTED )?PRIVATE KEY-----/g, '')
                    .replace(/\s+/g, '');
    const cleanBody = cleanBase64String(body);
    const pkcs8 = decodeBase64(cleanBody);

    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      pkcs8,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["sign"],
    );

    const jwk = await crypto.subtle.exportKey("jwk", privateKey);
    
    const publicJwk = {
      kty: jwk.kty,
      n: jwk.n,
      e: jwk.e,
      alg: "RS256",
      use: "sig"
    };

    const publicKey = await crypto.subtle.importKey(
      "jwk",
      publicJwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      true,
      ["verify"],
    );

    const spki = await crypto.subtle.exportKey("spki", publicKey);
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", spki));
    const fingerprint = "SHA256:" + encodeBase64(digest);

    return { privateKey, publicKey, fingerprint };
  } catch (error) {
    throw new Error(`Failed to load private key: ${error.message}`);
  }
}

async function createSnowflakeJwt() {
  const accountRaw = Deno.env.get("SNOWFLAKE_ACCOUNT") || "";
  const accountForJwt = accountRaw.toUpperCase().replaceAll(".", "-");
  const user = (Deno.env.get("SNOWFLAKE_USER") || "").toUpperCase();
  
  if (!accountRaw || !user) {
    throw new Error("SNOWFLAKE_ACCOUNT and SNOWFLAKE_USER env vars are required");
  }

  const { privateKey, fingerprint } = await loadPrivateKeyAndFingerprint();

  const header = {
    alg: "RS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const exp = now + 59 * 60;

  const qualified = `${accountForJwt}.${user}`;
  const payload = {
    iss: `${qualified}.${fingerprint}`,
    sub: qualified,
    iat: now,
    exp,
  };

  const enc = (obj) => encodeBase64(new TextEncoder().encode(JSON.stringify(obj))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  const signingInput = `${enc(header)}.${enc(payload)}`;

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    privateKey,
    new TextEncoder().encode(signingInput),
  );
  const sigB64 = encodeBase64(new Uint8Array(signature)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

  return `${signingInput}.${sigB64}`;
}

function buildSnowflakeUrl(accountIdentifier) {
  const account = accountIdentifier.toLowerCase().trim().replace(/\./g, '-');
  
  if (account.includes('snowflakecomputing.com')) {
    return `https://${account}`;
  }
  
  return `https://${account}.snowflakecomputing.com`;
}

async function snowflakeSqlApi(statement, opts = {}) {
  const account = Deno.env.get("SNOWFLAKE_ACCOUNT");
  if (!account) {
    throw new Error("SNOWFLAKE_ACCOUNT environment variable is required");
  }
  
  const jwt = await createSnowflakeJwt();
  const baseUrl = buildSnowflakeUrl(account);
  const endpoint = `${baseUrl}/api/v2/statements`;
  
  const body = {
    statement,
    timeout: opts.timeout ?? 60,
    resultSetMetaData: { format: "json" },
  };

  const wh = opts.warehouse || Deno.env.get("SNOWFLAKE_WAREHOUSE") || undefined;
  const db = opts.database || Deno.env.get("SNOWFLAKE_DATABASE") || undefined;
  const sch = opts.schema || Deno.env.get("SNOWFLAKE_SCHEMA") || undefined;
  const role = opts.role || Deno.env.get("SNOWFLAKE_ROLE") || undefined;

  if (wh) body.warehouse = wh;
  if (db) body.database = db;
  if (sch) body.schema = sch;
  if (role) body.role = role;
  if (opts.bindings) body.bindings = opts.bindings;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Authorization": `Bearer ${jwt}`,
      "X-Snowflake-Authorization-Token-Type": "KEYPAIR_JWT",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Snowflake SQL API error (${res.status}): ${text}`);
  }

  return await res.json();
}

function rowsToObjects(apiResponse) {
  const cols = apiResponse.resultSetMetaData?.rowType?.map((c) => c.name) || [];
  const rows = apiResponse.data || apiResponse.resultSet?.data || [];
  return rows.map((arr) => {
    const obj = {};
    cols.forEach((name, i) => { obj[name] = arr[i]; });
    return obj;
  });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, warehouse, database, schema, role } = await req.json();

    if (!query || !query.trim()) {
      return Response.json({ error: 'SQL query is required' }, { status: 400 });
    }

    const startTime = Date.now();
    const result = await snowflakeSqlApi(query.trim(), {
      warehouse,
      database,
      schema,
      role,
      timeout: 300
    });

    const executionTime = Date.now() - startTime;
    const rows = rowsToObjects(result);

    return Response.json({
      success: true,
      data: rows,
      metadata: {
        rowCount: rows.length,
        executionTime,
        columns: result.resultSetMetaData?.rowType || [],
        statementHandle: result.statementHandle
      }
    });

  } catch (error) {
    return Response.json({ 
      success: false, 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});