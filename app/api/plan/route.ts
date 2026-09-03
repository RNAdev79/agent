import { orchestrateTravelPlan } from '../../../lib/services/planOrchestrator';
import { UserInputPlanRequest } from '../../../types/index';

/**
 * Next.js App Router compatible Route Handler
 * POST /api/plan
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json()) as UserInputPlanRequest;
    const plan = await orchestrateTravelPlan(body);

    return new Response(JSON.stringify({ success: true, plan }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in /api/plan route:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Failed to generate travel plan',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
