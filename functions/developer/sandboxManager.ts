import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await req.json();

    if (action === 'create_sandbox') {
      const { environment_name, integration_id } = await req.json();

      // Generate mock test data
      const mockData = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate realistic test data for sandbox environment testing a third-party integration. Include 3 mock agents with different personalities, 2 mock augmentations, and 2 simulated users with varying cognitive profiles.`,
        response_json_schema: {
          type: 'object',
          properties: {
            mock_agents: { type: 'array', items: { type: 'object' } },
            mock_augmentations: { type: 'array', items: { type: 'object' } },
            simulated_users: { type: 'array', items: { type: 'object' } }
          }
        }
      });

      const sandbox = await base44.entities.SandboxEnvironment.create({
        developer_id: user.id,
        environment_name: environment_name,
        integration_under_test: integration_id,
        test_data: mockData,
        test_results: [],
        resource_limits: {
          max_api_calls: 1000,
          max_compute_seconds: 300,
          max_storage_mb: 100
        },
        isolation_level: 'full',
        auto_cleanup_hours: 24,
        sandbox_status: 'active'
      });

      return Response.json({
        success: true,
        sandbox: sandbox,
        sandbox_url: `/sandbox/${sandbox.sandbox_id}`,
        test_data_count: {
          agents: mockData.mock_agents.length,
          augmentations: mockData.mock_augmentations.length,
          users: mockData.simulated_users.length
        }
      });
    }

    if (action === 'run_test') {
      const { sandbox_id, test_name, test_payload } = await req.json();

      const sandboxes = await base44.entities.SandboxEnvironment.filter({ sandbox_id });
      const sandbox = sandboxes[0];

      if (!sandbox) {
        return Response.json({ error: 'Sandbox not found' }, { status: 404 });
      }

      const startTime = Date.now();

      try {
        // Execute test (placeholder - would call actual integration)
        const testResult = {
          test_name: test_name,
          passed: true,
          execution_time_ms: Date.now() - startTime,
          error_log: null
        };

        await base44.entities.SandboxEnvironment.update(sandbox.id, {
          test_results: [...(sandbox.test_results || []), testResult]
        });

        return Response.json({
          success: true,
          test_result: testResult
        });

      } catch (error) {
        const testResult = {
          test_name: test_name,
          passed: false,
          execution_time_ms: Date.now() - startTime,
          error_log: error.message
        };

        await base44.entities.SandboxEnvironment.update(sandbox.id, {
          test_results: [...(sandbox.test_results || []), testResult]
        });

        return Response.json({
          success: false,
          test_result: testResult
        });
      }
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});