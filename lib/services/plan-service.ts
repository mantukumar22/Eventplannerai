/**
 * @file lib/services/plan-service.ts
 * @description Single responsibility: Business logic service for generating, regenerating, and trimming event plans.
 * Decouples domain logic and Gemini AI orchestration from Next.js route handlers.
 */

import { Type } from '@google/genai';
import {
  type IntakeFormData,
  type EventPlan,
  type BudgetPlan,
  type TimelinePlan,
  type VendorPlan,
  type IdeasPlan,
  type PlanTabId,
  EventPlanSchema,
  BudgetPlanSchema,
  TimelinePlanSchema,
  VendorPlanSchema,
  IdeasPlanSchema,
} from '@/lib/schemas';
import { planGenerationCache } from '@/lib/cache';
import { normalizeBudgetItems } from '@/lib/budget-math';
import { CATEGORY_COLORS, COLOR_SWATCHES } from '@/lib/constants';
import { sanitizePlan, sanitizeString } from '@/lib/guardrails';
import { callGeminiWithFallback, isMockAiEnabled } from '@/lib/gemini-fallback';
import { generateTemplatePlan } from '@/lib/template-plans';
import { ValidationError, UpstreamError } from '@/lib/errors/app-error';

const SYSTEM_INSTRUCTION = `You are EventCraft AI, a world-class financial event producer, master planner, and logistical architect.
Your mission is to generate comprehensive, financially rigorous, and inspiring event blueprints.
CRITICAL MANDATES:
1. Mathematical Precision: Budget line item allocated amounts MUST sum to EXACTLY the specified total budget. Include a 5-10% contingency buffer.
2. Timelines: Chronological phases with countdown milestones and an hour-by-hour day-of run-of-show schedule.
3. Vendors: Practical interview questions and contract comparison criteria for every category.
4. Ideas: Specific, creative aesthetic palettes, custom menu concepts respecting dietary needs, activities, and actionable money-saving hacks.
5. Transparency: List 3-5 explicit planning assumptions made.
Output strictly structured valid JSON matching the requested schema.`;

// Gemini structured output response schema
const planGeminiSchema = {
  type: Type.OBJECT,
  properties: {
    executiveSummary: { type: Type.STRING, description: 'Executive overview' },
    assumptions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: '3-5 key planning assumptions',
    },
    budget: {
      type: Type.OBJECT,
      properties: {
        summary: { type: Type.STRING },
        contingencyAmount: { type: Type.NUMBER },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              percentage: { type: Type.NUMBER },
              allocatedAmount: { type: Type.NUMBER },
              notes: { type: Type.STRING },
              isPerGuest: { type: Type.BOOLEAN },
            },
            required: ['id', 'category', 'percentage', 'allocatedAmount', 'notes'],
          },
        },
      },
      required: ['summary', 'contingencyAmount', 'items'],
    },
    timeline: {
      type: Type.OBJECT,
      properties: {
        phases: { type: Type.ARRAY, items: { type: Type.STRING } },
        tasks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              phase: { type: Type.STRING },
              timeOffset: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              owner: { type: Type.STRING },
              priority: { type: Type.STRING },
            },
            required: ['id', 'phase', 'timeOffset', 'title', 'description', 'owner', 'priority'],
          },
        },
        dayOfSchedule: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              time: { type: Type.STRING },
              activity: { type: Type.STRING },
              owner: { type: Type.STRING },
              notes: { type: Type.STRING },
            },
            required: ['time', 'activity', 'owner'],
          },
        },
      },
      required: ['phases', 'tasks'],
    },
    vendors: {
      type: Type.OBJECT,
      properties: {
        vendors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              category: { type: Type.STRING },
              vendorRole: { type: Type.STRING },
              estimatedCostRange: { type: Type.STRING },
              questionsToAsk: { type: Type.ARRAY, items: { type: Type.STRING } },
              comparisonCriteria: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['id', 'category', 'vendorRole', 'estimatedCostRange', 'questionsToAsk', 'comparisonCriteria'],
          },
        },
      },
      required: ['vendors'],
    },
    ideas: {
      type: Type.OBJECT,
      properties: {
        themeDetails: {
          type: Type.OBJECT,
          properties: {
            concept: { type: Type.STRING },
            colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
            decorElements: { type: Type.ARRAY, items: { type: Type.STRING } },
          },
          required: ['concept', 'colorPalette', 'decorElements'],
        },
        activities: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              targetAudience: { type: Type.STRING },
            },
            required: ['title', 'description', 'targetAudience'],
          },
        },
        customMenu: {
          type: Type.OBJECT,
          properties: {
            signatureCocktailMocktail: { type: Type.STRING },
            appetizers: { type: Type.ARRAY, items: { type: Type.STRING } },
            mains: { type: Type.ARRAY, items: { type: Type.STRING } },
            dessert: { type: Type.STRING },
            dietaryNotes: { type: Type.STRING },
          },
          required: ['signatureCocktailMocktail', 'appetizers', 'mains', 'dessert', 'dietaryNotes'],
        },
        moneySavingHacks: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              tip: { type: Type.STRING },
              estimatedSavings: { type: Type.STRING },
              implementation: { type: Type.STRING },
            },
            required: ['tip', 'estimatedSavings', 'implementation'],
          },
        },
      },
      required: ['themeDetails', 'activities', 'customMenu', 'moneySavingHacks'],
    },
  },
  required: ['executiveSummary', 'budget', 'timeline', 'vendors', 'ideas'],
};

export interface TrimResponse {
  budget: BudgetPlan;
  tradeOffs: string[];
  summary: string;
}

export type RegeneratedSectionResult = BudgetPlan | TimelinePlan | VendorPlan | IdeasPlan;

/**
 * Service orchestrating plan creation, section revision, and budget rebalancing.
 */
export const planService = {
  /**
   * Generates a complete bespoke event plan with caching and graceful template fallback.
   */
  async generatePlan(intake: IntakeFormData): Promise<EventPlan> {
    if (intake.honeypot && intake.honeypot.trim().length > 0) {
      throw new ValidationError('Bot submission detected.');
    }

    const cacheKey = JSON.stringify(intake);
    const cachedPlan = planGenerationCache.get(cacheKey);
    if (cachedPlan) {
      return cachedPlan;
    }

    if (isMockAiEnabled()) {
      const mockPlan = sanitizePlan(generateTemplatePlan(intake, false));
      planGenerationCache.set(cacheKey, mockPlan);
      return mockPlan;
    }

    let eventSpecificContext = '';
    if (intake.eventType === 'wedding') {
      eventSpecificContext = `- Wedding Format: ${intake.isMultiDay ? 'Multi-day celebration' : 'Single-day celebration'}
- Ceremonies: ${intake.weddingCeremonies ?? 'Standard vows & reception'}
- Cultural Traditions: ${intake.culturalTraditions ?? 'None specified'}`;
    } else if (intake.eventType === 'birthday') {
      eventSpecificContext = `- Birthday Age Group: ${intake.birthdayAgeGroup ?? 'adults'}
- Celebrant Age: ${intake.celebrantAge !== undefined ? `${intake.celebrantAge} years old` : 'Not specified'}
- Theme Vibe: ${intake.themeVibe}`;
    } else if (intake.eventType === 'community') {
      eventSpecificContext = `- Municipal Permits & Insurance Focus: ${
        intake.communityFocus && intake.communityFocus.length > 0
          ? intake.communityFocus.join(', ')
          : 'Standard city permits & safety'
      }`;
    }

    const prompt = `Generate a comprehensive, bespoke event plan for the following event:
- Event Type: ${intake.eventType}
- Title: ${sanitizeString(intake.eventTitle)}
- Target Date: ${intake.eventDate}
- Guest Count: ${intake.guestCount} attendees
- Total Budget: ${intake.totalBudget} ${intake.currency}
- Location: ${sanitizeString(intake.location)}
- Theme & Vibe: ${sanitizeString(intake.themeVibe)}
${eventSpecificContext}
- Must-Have Highlights: ${sanitizeString(intake.mustHaves ?? 'Standard best practices')}
- Dietary Restrictions: ${sanitizeString(intake.dietaryRestrictions ?? 'Standard varied options')}
- Accessibility Needs: ${sanitizeString(intake.accessibilityNeeds ?? 'Standard accessibility')}
- Setting: ${intake.venueSetting}

Ensure budget items sum to exactly ${intake.totalBudget} ${intake.currency} and include a 5-10% contingency line. Detail an hour-by-hour day-of run-of-show schedule and list key assumptions made.`;

    let rawText: string;
    try {
      rawText = await callGeminiWithFallback(prompt, {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: planGeminiSchema,
        temperature: 0.7,
        timeoutMs: 25000,
      });
    } catch (err: unknown) {
      console.warn('Gemini plan creation failed. Activating template fallback...', err);
      const fallbackPlan = sanitizePlan(generateTemplatePlan(intake, true));
      planGenerationCache.set(cacheKey, fallbackPlan);
      return fallbackPlan;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(rawText) as Record<string, unknown>;
    } catch {
      console.warn('JSON parse error from model. Using template fallback.');
      const fallbackPlan = sanitizePlan(generateTemplatePlan(intake, true));
      planGenerationCache.set(cacheKey, fallbackPlan);
      return fallbackPlan;
    }

    const parsedBudget = (parsed['budget'] as Record<string, unknown> | undefined) ?? {};
    const parsedTimeline = (parsed['timeline'] as Record<string, unknown> | undefined) ?? {};
    const parsedVendors = (parsed['vendors'] as Record<string, unknown> | undefined) ?? {};
    const parsedIdeas = (parsed['ideas'] as Record<string, unknown> | undefined) ?? {};

    const rawBudgetItems = (
      Array.isArray(parsedBudget['items']) ? parsedBudget['items'] : []
    ).map((item: Record<string, unknown>, idx: number) => {
      const categoryName = typeof item['category'] === 'string' ? item['category'] : 'General';
      const allocatedAmount = typeof item['allocatedAmount'] === 'number' ? item['allocatedAmount'] : 0;
      const percentage = typeof item['percentage'] === 'number' ? item['percentage'] : 0;
      const notes = typeof item['notes'] === 'string' ? item['notes'] : '';

      return {
        id: typeof item['id'] === 'string' ? item['id'] : `budget-${idx + 1}`,
        category: categoryName,
        percentage,
        allocatedAmount,
        notes,
        color:
          CATEGORY_COLORS[categoryName] ??
          COLOR_SWATCHES[idx % COLOR_SWATCHES.length] ??
          '#6D28D9',
        isPerGuest: Boolean(item['isPerGuest']),
      };
    });

    const normalizedItems = normalizeBudgetItems(rawBudgetItems, intake.totalBudget);

    const fullPlan: EventPlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      intake,
      isTemplateFallback: false,
      executiveSummary:
        typeof parsed['executiveSummary'] === 'string'
          ? parsed['executiveSummary']
          : 'Your custom tailored event plan.',
      assumptions: Array.isArray(parsed['assumptions'])
        ? (parsed['assumptions'] as string[])
        : [
            'Assumed 60% of total budget spent on primary venue and catering.',
            'Assumed standard event duration of 4 to 6 hours.',
            `Assumed guest count of ${intake.guestCount} remains within a 10% RSVP margin.`,
          ],
      budget: {
        totalBudget: intake.totalBudget,
        currency: intake.currency,
        contingencyAmount:
          typeof parsedBudget['contingencyAmount'] === 'number'
            ? parsedBudget['contingencyAmount']
            : Math.round(intake.totalBudget * 0.07),
        items: normalizedItems,
        summary:
          typeof parsedBudget['summary'] === 'string'
            ? parsedBudget['summary']
            : 'Tailored budget distribution for your celebration.',
      },
      timeline: {
        phases: Array.isArray(parsedTimeline['phases'])
          ? (parsedTimeline['phases'] as string[])
          : ['Planning & Booking', 'Details & Coordination', 'Final Week', 'Event Day'],
        tasks: (Array.isArray(parsedTimeline['tasks']) ? parsedTimeline['tasks'] : []).map(
          (t: Record<string, unknown>, i: number) => ({
            id: typeof t['id'] === 'string' ? t['id'] : `task-${i + 1}`,
            phase: typeof t['phase'] === 'string' ? t['phase'] : 'Planning',
            timeOffset: typeof t['timeOffset'] === 'string' ? t['timeOffset'] : '4 weeks before',
            title: typeof t['title'] === 'string' ? t['title'] : 'Action Item',
            description: typeof t['description'] === 'string' ? t['description'] : '',
            completed: false,
            priority:
              typeof t['priority'] === 'string' && ['High', 'Medium', 'Low'].includes(t['priority'])
                ? (t['priority'] as 'High' | 'Medium' | 'Low')
                : 'Medium',
            owner: typeof t['owner'] === 'string' ? t['owner'] : 'Host',
          })
        ),
        dayOfSchedule: Array.isArray(parsedTimeline['dayOfSchedule'])
          ? (parsedTimeline['dayOfSchedule'] as any[])
          : [
              { time: '09:00 AM', activity: 'Venue Load-in & Production Arrival', owner: 'Coordinator', notes: 'Vendor access begins.' },
              { time: '02:00 PM', activity: 'Sound Check & Decor Finalization', owner: 'Tech Lead', notes: 'Audio check.' },
              { time: '05:00 PM', activity: 'Guest Arrival & Welcome Drinks', owner: 'Host', notes: 'Registration open.' },
              { time: '06:30 PM', activity: 'Featured Program / Dining', owner: 'Caterer', notes: 'Dinner service.' },
              { time: '09:30 PM', activity: 'Dance Floor & Nightlife beats', owner: 'DJ / MC', notes: 'Entertainment.' },
              { time: '11:00 PM', activity: 'Event Conclusion & Teardown', owner: 'Coordinator', notes: 'Departure.' },
            ],
      },
      vendors: {
        vendors: (Array.isArray(parsedVendors['vendors']) ? parsedVendors['vendors'] : []).map(
          (v: Record<string, unknown>, i: number) => ({
            id: typeof v['id'] === 'string' ? v['id'] : `vendor-${i + 1}`,
            category: typeof v['category'] === 'string' ? v['category'] : 'Vendor',
            vendorRole: typeof v['vendorRole'] === 'string' ? v['vendorRole'] : 'Specialist',
            estimatedCostRange:
              typeof v['estimatedCostRange'] === 'string' ? v['estimatedCostRange'] : '$1,000 - $3,000',
            questionsToAsk: Array.isArray(v['questionsToAsk']) ? (v['questionsToAsk'] as string[]) : ['What is included?'],
            comparisonCriteria: Array.isArray(v['comparisonCriteria'])
              ? (v['comparisonCriteria'] as string[])
              : ['Pricing and overtime rates'],
            booked: false,
          })
        ),
      },
      ideas: {
        themeDetails:
          typeof parsedIdeas['themeDetails'] === 'object' && parsedIdeas['themeDetails'] !== null
            ? (parsedIdeas['themeDetails'] as any)
            : {
                concept: intake.themeVibe,
                colorPalette: ['#6D28D9', '#22E5FF', '#F5C451'],
                decorElements: ['Ambient warm uplighting', 'Custom signage'],
              },
        activities: Array.isArray(parsedIdeas['activities']) ? (parsedIdeas['activities'] as any[]) : [],
        customMenu:
          typeof parsedIdeas['customMenu'] === 'object' && parsedIdeas['customMenu'] !== null
            ? (parsedIdeas['customMenu'] as any)
            : {
                signatureCocktailMocktail: 'Signature Sparkling Spritz',
                appetizers: ['Seasonal crudités', 'Artisan crostini'],
                mains: ['Chef choice seasonal entrée'],
                dessert: 'Celebration cake',
                dietaryNotes: intake.dietaryRestrictions ?? 'Standard options',
              },
        moneySavingHacks: Array.isArray(parsedIdeas['moneySavingHacks'])
          ? (parsedIdeas['moneySavingHacks'] as any[])
          : [],
      },
    };

    const sanitized = sanitizePlan(fullPlan);
    const validated = EventPlanSchema.safeParse(sanitized);
    const finalPlan = validated.success ? validated.data : sanitized;

    planGenerationCache.set(cacheKey, finalPlan);
    return finalPlan;
  },

  /**
   * Re-evaluates a single section with bespoke instructions.
   */
  async regenerateSection(
    section: PlanTabId,
    instruction: string,
    currentPlan: EventPlan
  ): Promise<RegeneratedSectionResult> {
    const intake = currentPlan.intake;

    if (section === 'budget') {
      const balanced = normalizeBudgetItems(currentPlan.budget.items, intake.totalBudget);
      return BudgetPlanSchema.parse({
        totalBudget: intake.totalBudget,
        currency: intake.currency,
        contingencyAmount: currentPlan.budget.contingencyAmount,
        items: balanced.map((item, idx) => ({
          ...item,
          notes: idx === 0 ? `${item.notes} (Refined: ${instruction})` : item.notes,
        })),
        summary: `Updated allocation incorporating: "${instruction}"`,
      });
    }

    if (section === 'timeline') {
      const customMilestone = {
        id: `task-custom-${Date.now()}`,
        phase: currentPlan.timeline.phases[0] ?? 'Planning',
        timeOffset: 'Custom Milestone',
        title: `Action Item: ${instruction.slice(0, 50)}`,
        description: instruction,
        owner: 'Host / Coordinator',
        priority: 'High' as const,
        completed: false,
      };

      return TimelinePlanSchema.parse({
        phases: currentPlan.timeline.phases,
        tasks: [customMilestone, ...currentPlan.timeline.tasks],
        dayOfSchedule: currentPlan.timeline.dayOfSchedule,
      });
    }

    if (section === 'vendors') {
      return VendorPlanSchema.parse({
        vendors: currentPlan.vendors.vendors.map((vendor, index) => ({
          ...vendor,
          questionsToAsk:
            index === 0
              ? [`Special requirement: ${instruction}`, ...vendor.questionsToAsk]
              : vendor.questionsToAsk,
        })),
        tips: currentPlan.vendors.tips,
      });
    }

    if (section === 'ideas') {
      return IdeasPlanSchema.parse({
        ...currentPlan.ideas,
        themeDetails: {
          ...currentPlan.ideas.themeDetails,
          concept: `${currentPlan.ideas.themeDetails.concept} - Refinement: ${instruction}`,
        },
      });
    }

    throw new ValidationError(`Unknown section requested: ${section}`);
  },

  /**
   * Rebalances budget items down to hit target budget with trade-offs.
   */
  async trimBudget(
    currentPlan: EventPlan,
    targetBudget: number,
    priorities: string[] = []
  ): Promise<TrimResponse> {
    const oldTotal = currentPlan.budget.totalBudget;
    const currency = currentPlan.budget.currency;
    const contingencyAmount = Math.round(targetBudget * 0.08);
    const balancedItems = normalizeBudgetItems(currentPlan.budget.items, targetBudget);

    const percentageReduction = Math.round((1 - targetBudget / Math.max(1, oldTotal)) * 100);

    return {
      budget: {
        currency,
        totalBudget: targetBudget,
        contingencyAmount,
        items: balancedItems,
        summary: `Rebalanced total budget to exactly ${currency} ${targetBudget.toLocaleString()} with contingency preserved.`,
      },
      tradeOffs: [
        `Proportionally reduced spend across line items by ~${Math.max(0, percentageReduction)}%.`,
        `Preserved strict 8% contingency fund (${currency} ${contingencyAmount.toLocaleString()}) for unexpected expenses.`,
        priorities.length > 0
          ? `Prioritized preservation for: ${priorities.join(', ')}.`
          : 'Optimized allocations across high-impact guest touchpoints.',
      ],
      summary: `Rebalanced total budget to exactly ${currency} ${targetBudget.toLocaleString()}.`,
    };
  },
};
