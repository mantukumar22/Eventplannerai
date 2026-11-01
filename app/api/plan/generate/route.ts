/**
 * @file app/api/plan/generate/route.ts
 * @description Single responsibility: Thin route handler delegating event plan creation to planService.
 */

import { IntakeFormSchema, type EventPlan, type IntakeFormData } from '@/lib/schemas';
import { createApiHandler } from '@/lib/api/handler';
import { planService } from '@/lib/services/plan-service';

export const POST = createApiHandler<IntakeFormData, EventPlan>({
  schema: IntakeFormSchema,
  handler: async (validatedData): Promise<EventPlan> => {
    return planService.generatePlan(validatedData);
  },
});
