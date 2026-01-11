export default async function sendSms(request, context) {
  try {
    const accountSid = context.secrets.TWILIO_ACCOUNT_SID;
    const authToken = context.secrets.TWILIO_AUTH_TOKEN;
    const fromNumber = context.secrets.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      return { 
        statusCode: 500,
        body: { error: "Twilio credentials are not configured in workspace secrets." }
      };
    }

    const { to, message } = request.body;
    if (!to || !message) {
      return { 
        statusCode: 400,
        body: { error: "Missing 'to' or 'message' in request body" }
      };
    }

    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;

    const body = new URLSearchParams();
    body.append('To', to);
    body.append('Body', message);
    body.append('From', fromNumber);

    const twilioResponse = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${accountSid}:${authToken}`),
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const responseData = await twilioResponse.json();

    if (twilioResponse.ok) {
      // Store message in database
      await context.entities.TwilioMessage.create({
        user_email: context.user.email,
        to_number: to,
        from_number: fromNumber,
        message: message,
        twilio_sid: responseData.sid,
        status: 'sent'
      });

      return {
        statusCode: 200,
        body: {
          status: "success",
          twilio_sid: responseData.sid,
        }
      };
    } else {
      return {
        statusCode: 200,
        body: {
          status: "error",
          error_message: responseData.message || "Failed to send message via Twilio.",
        }
      };
    }

  } catch (error) {
    return {
      statusCode: 500,
      body: { error: error.message }
    };
  }
}