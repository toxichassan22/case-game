/**
 * Content Validation Pipeline
 * Validates and sanitizes all user-facing content
 */

export interface ContentValidationResult {
  valid: boolean;
  sanitized: string;
  issues: string[];
}

export class ContentValidator {
  /**
   * Validate and sanitize text content
   */
  static validateText(content: string, maxLength: number = 1000): ContentValidationResult {
    const issues: string[] = [];
    let sanitized = content;

    // Check length
    if (content.length > maxLength) {
      issues.push(`Content exceeds maximum length (${maxLength} characters)`);
      sanitized = content.substring(0, maxLength);
    }

    // Remove potentially dangerous HTML tags
    sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    sanitized = sanitized.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '');
    sanitized = sanitized.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '');

    // Check for XSS patterns
    const xssPatterns = [
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\(/i,
      /document\./i,
      /window\./i
    ];

    xssPatterns.forEach(pattern => {
      if (pattern.test(content)) {
        issues.push('Potentially dangerous content detected');
      }
    });

    return {
      valid: issues.length === 0,
      sanitized,
      issues
    };
  }

  /**
   * Validate case title
   */
  static validateTitle(title: string): ContentValidationResult {
    return this.validateText(title, 100);
  }

  /**
   * Validate description
   */
  static validateDescription(description: string): ContentValidationResult {
    return this.validateText(description, 5000);
  }

  /**
   * Validate chat message
   */
  static validateChatMessage(message: string): ContentValidationResult {
    return this.validateText(message, 2000);
  }

  /**
   * Validate evidence data
   */
  static validateEvidence(evidence: any): ContentValidationResult {
    const issues: string[] = [];

    if (!evidence.id) {
      issues.push('Evidence ID is required');
    }

    if (!evidence.title || evidence.title.length < 3) {
      issues.push('Evidence title must be at least 3 characters');
    }

    const titleResult = this.validateTitle(evidence.title || '');
    issues.push(...titleResult.issues);

    if (evidence.description) {
      const descResult = this.validateDescription(evidence.description);
      issues.push(...descResult.issues);
    }

    return {
      valid: issues.length === 0,
      sanitized: evidence.title || '',
      issues
    };
  }
}
