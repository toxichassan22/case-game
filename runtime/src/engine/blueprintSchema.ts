import { z } from 'zod';
import { SOURCE_TYPE } from './constants.js';

export const blueprintItemSchema = z.object({
  source_ref: z.string().min(1),
  source_type: z.nativeEnum(SOURCE_TYPE),
  interaction_id: z.string().min(1),
  required_result: z.string().min(1),
  verifies_evidence: z.boolean().optional(),
});

export const blueprintConfigSchema = z.object({
  closureCatalog: z.object({
    suspect_ids: z.array(z.string()),
    method_ids: z.array(z.string()),
  }),
  openableSources: z.array(z.string()),
  blueprints: z.object({
    review: z.array(blueprintItemSchema),
  }),
});

export type ValidatedBlueprintConfig = z.infer<typeof blueprintConfigSchema>;
