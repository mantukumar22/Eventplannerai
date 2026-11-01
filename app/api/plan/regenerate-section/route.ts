/**
 * @file app/api/plan/regenerate-section/route.ts
 * @description Single responsibility: Thin route handler delegating section revision to planService.
 */

import {
  RegenerateSectionSchema,
  type RegenerateSectionRequest,
} from '@/lib/schemas';
import { createApiHandler } from '@/lib/api/handler';
import { planService, type RegeneratedSectionResult } from '@/lib/services/plan-service';

export const POST = createApiHandler<RegenerateSectionRequest, RegeneratedSectionResult>({
  schema: RegenerateSectionSchema,
  handler: async (validatedData): Promise<RegeneratedSectionResult> => {
    return planService.regenerateSection(
      validatedData.section,
      validatedData.instruction,
      validatedData.currentPlan
    );
  },
});
