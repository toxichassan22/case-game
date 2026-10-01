/**
 * Runtime Case Validator
 * Validates case files at runtime before loading
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export class CaseValidator {
  /**
   * Validate a complete case file
   */
  static validateCase(caseData: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Required fields
    const requiredFields = ['case_id', 'title', 'maxPhsLevels', 'phs_hints', 'suspects', 'evidence_list'];
    for (const field of requiredFields) {
      if (!(field in caseData)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // If missing required fields, return early
    if (errors.length > 0) {
      return { valid: false, errors, warnings };
    }

    // Validate case_id format
    if (!/^case\d+$/.test(caseData.case_id)) {
      errors.push(`Invalid case_id format: ${caseData.case_id}`);
    }

    // Validate title
    if (caseData.title.length < 5) {
      errors.push('Title is too short (min 5 characters)');
    }

    // Validate maxPhsLevels
    if (typeof caseData.maxPhsLevels !== 'number' || caseData.maxPhsLevels < 1) {
      errors.push('maxPhsLevels must be a positive number');
    }

    // Validate phs_hints
    if (!Array.isArray(caseData.phs_hints)) {
      errors.push('phs_hints must be an array');
    } else {
      caseData.phs_hints.forEach((hint: any, index: number) => {
        if (!hint.level || !hint.type || !hint.payload) {
          errors.push(`phs_hints[${index}] missing required fields`);
        }
      });
    }

    // Validate suspects
    if (Array.isArray(caseData.suspects)) {
      const suspectIds = caseData.suspects.map((s: any) => s.id);
      const duplicates = suspectIds.filter((id: any, idx: number) => suspectIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        errors.push(`Duplicate suspect IDs: ${duplicates.join(', ')}`);
      }

      caseData.suspects.forEach((suspect: any, index: number) => {
        if (!suspect.id || !suspect.name) {
          errors.push(`suspects[${index}] missing id or name`);
        }
        if (suspect.description && suspect.description.length < 10) {
          warnings.push(`suspects[${index}] has a very short description`);
        }
      });
    }

    // Validate evidence_list
    if (Array.isArray(caseData.evidence_list)) {
      const evidenceIds = caseData.evidence_list.map((e: any) => e.id);
      const duplicates = evidenceIds.filter((id: any, idx: number) => evidenceIds.indexOf(id) !== idx);
      if (duplicates.length > 0) {
        errors.push(`Duplicate evidence IDs: ${duplicates.join(', ')}`);
      }

      caseData.evidence_list.forEach((evidence: any, index: number) => {
        if (!evidence.id || !evidence.title) {
          errors.push(`evidence_list[${index}] missing id or title`);
        }
        if (!evidence.description || evidence.description.length < 10) {
          warnings.push(`evidence_list[${index}] missing or short description`);
        }
      });
    }

    // Validate timeline if exists
    if (caseData.timeline && Array.isArray(caseData.timeline)) {
      caseData.timeline.forEach((event: any, index: number) => {
        if (!event.timestamp || !event.description) {
          errors.push(`timeline[${index}] missing timestamp or description`);
        }
      });
    }

    // Check for inconsistent naming conventions
    if (caseData.evidence_list) {
      const hasMixedNaming = caseData.evidence_list.some((e: any) => 
        e.id && !/^[A-Z]{2,4}-\d+$/.test(e.id)
      );
      if (hasMixedNaming) {
        warnings.push('Evidence IDs use inconsistent naming convention (expected: XXX-NNN)');
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate multiple cases
   */
  static validateCases(cases: any[]): ValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    cases.forEach((caseData, index) => {
      const result = this.validateCase(caseData);
      if (!result.valid) {
        allErrors.push(`Case ${index}: ${result.errors.join(', ')}`);
      }
      allWarnings.push(...result.warnings.map(w => `Case ${index}: ${w}`));
    });

    return {
      valid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}
