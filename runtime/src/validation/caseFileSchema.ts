/**
 * JSON Schema Validation for Case Files
 * Ensures case data integrity before loading
 */
import { z } from 'zod';

// Evidence schema
const evidenceSchema = z.object({
  id: z.string().min(1, 'Evidence ID is required'),
  type: z.enum(['document', 'object', 'audio', 'image', 'video']),
  title: z.string().min(1, 'Evidence title is required'),
  description: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  audio_url: z.string().url().optional().or(z.literal('')),
  content: z.string().optional(),
  route_weight: z.number().min(0).max(1).optional(),
  completion_triggers: z.array(z.string()).optional(),
});

// Suspect schema
const suspectSchema = z.object({
  id: z.string().min(1, 'Suspect ID is required'),
  name: z.string().min(1, 'Suspect name is required'),
  role: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal('')),
  interrogation: z.object({
    phases: z.array(z.object({
      phase: z.number(),
      dialog: z.array(z.object({
        speaker: z.string(),
        text: z.string(),
      })),
    })),
  }).optional(),
});

// Dialog blueprint schema
const dialogBlueprintSchema = z.object({
  source_ref: z.string().min(1),
  character_id: z.string().min(1),
  phases: z.array(z.object({
    phase: z.number(),
    dialog: z.array(z.object({
      speaker: z.string(),
      text: z.string(),
    })),
  })),
});

// Review blueprint schema
const reviewBlueprintSchema = z.object({
  source_ref: z.string().min(1),
  content: z.string().min(1),
  context_summary: z.string().optional(),
});

// Timeline blueprint schema
const timelineBlueprintSchema = z.object({
  source_ref: z.string().min(1),
  timestamp: z.string().min(1),
  content: z.string().min(1),
});

// Main case file schema
export const caseFileSchema = z.object({
  case_id: z.string().min(1, 'Case ID is required'),
  case_number: z.string().min(1, 'Case number is required'),
  title: z.string().min(1, 'Case title is required'),
  description: z.string().optional(),
  suspects: z.array(suspectSchema),
  evidence: z.array(evidenceSchema),
  blueprints: z.object({
    dialog: z.array(dialogBlueprintSchema).optional(),
    review: z.array(reviewBlueprintSchema).optional(),
    inspect: z.array(reviewBlueprintSchema).optional(),
    timeline: z.array(timelineBlueprintSchema).optional(),
  }).optional(),
  closure_rules: z.array(z.object({
    required_suspect: z.string().optional(),
    required_motive: z.string().optional(),
    required_method: z.string().optional(),
    required_evidence: z.array(z.string()).optional(),
  })).optional(),
});

// Validation function
export function validateCaseFile(data: unknown): { valid: boolean; errors?: string[] } {
  try {
    caseFileSchema.parse(data);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

// Validate evidence array
export function validateEvidence(evidence: unknown): { valid: boolean; errors?: string[] } {
  try {
    z.array(evidenceSchema).parse(evidence);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

// Validate suspects array
export function validateSuspects(suspects: unknown): { valid: boolean; errors?: string[] } {
  try {
    z.array(suspectSchema).parse(suspects);
    return { valid: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.issues.map((e: any) => `${e.path.join('.')}: ${e.message}`),
      };
    }
    return { valid: false, errors: ['Unknown validation error'] };
  }
}

// Check for duplicate IDs in evidence
export function checkDuplicateEvidenceIds(evidence: Array<{id: string}>): { valid: boolean; duplicates?: string[] } {
  const ids = evidence.map(e => e.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];
  
  if (uniqueDuplicates.length > 0) {
    return { valid: false, duplicates: uniqueDuplicates };
  }
  return { valid: true };
}

// Check for duplicate suspect IDs
export function checkDuplicateSuspectIds(suspects: Array<{id: string}>): { valid: boolean; duplicates?: string[] } {
  const ids = suspects.map(s => s.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  const uniqueDuplicates = [...new Set(duplicates)];
  
  if (uniqueDuplicates.length > 0) {
    return { valid: false, duplicates: uniqueDuplicates };
  }
  return { valid: true };
}

// Comprehensive validation with duplicate checking
export function validateCaseFileComplete(data: unknown): { valid: boolean; errors?: string[] } {
  const validationResult = validateCaseFile(data);
  
  if (!validationResult.valid) {
    return validationResult;
  }
  
  // Check for duplicates
  const caseData = data as any;
  const evidenceCheck = checkDuplicateEvidenceIds(caseData.evidence || []);
  const suspectCheck = checkDuplicateSuspectIds(caseData.suspects || []);
  
  const errors: string[] = [];
  
  if (!evidenceCheck.valid && evidenceCheck.duplicates) {
    errors.push(`Duplicate evidence IDs: ${evidenceCheck.duplicates.join(', ')}`);
  }
  
  if (!suspectCheck.valid && suspectCheck.duplicates) {
    errors.push(`Duplicate suspect IDs: ${suspectCheck.duplicates.join(', ')}`);
  }
  
  if (errors.length > 0) {
    return { valid: false, errors };
  }
  
  return { valid: true };
}
