/**
 * @file app/api/plan/trim-budget/route.ts
 * @description Single responsibility: Thin route handler delegating budget rebalancing to planService.
 */

import { TrimBudgetSchema, type TrimBudgetRequest } from '@/lib/schemas';
import { createApiHandler } from '@/lib/api/handler';
import { planService, type TrimResponse } from '@/lib/services/plan-service';

export const POST = createApiHandler<TrimBudgetRequest, TrimResponse>({
  schema: TrimBudgetSchema,
  handler: async (validatedData): Promise<TrimResponse> => {
    return planService.trimBudget(
      validatedData.currentPlan,
      validatedData.targetBudget,
      validatedData.priorities
    );
  },
});
