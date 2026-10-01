export const TOTAL_CASES = 59;
export const IMPLEMENTED_CASES = 22;

export function parseCaseNumber(caseId: string | null | undefined): number | null {
  if (!caseId) return null;

  const match = caseId.match(/case(\d+)/i);
  if (!match) return null;

  const parsed = Number.parseInt(match[1], 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function formatCaseOrdinal(caseNumber: number | null): string {
  if (caseNumber === null) {
    return 'غير محددة';
  }

  return caseNumber.toString().padStart(2, '0');
}

export function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

export function getTrustMeta(trustScore: number): {
  color: string;
  label: string;
  description: string;
} {
  if (trustScore >= 85) {
    return {
      color: 'var(--state-success)',
      label: 'ثقة قوية',
      description: 'جميع الصلاحيات متاحة. لا توجد قيود على التحقيق.',
    };
  }

  if (trustScore >= 65) {
    return {
      color: '#84cc16',
      label: 'ثقة مستقرة',
      description: 'انتبه: الأخطاء العشوائية ستؤدي لخصم الثقة تدريجياً.',
    };
  }

  if (trustScore >= 45) {
    return {
      color: '#f59e0b',
      label: 'ثقة حذرة',
      description: 'تحذير: استمرار انخفاض الثقة سيؤدي لتأخير التقارير.',
    };
  }

  if (trustScore >= 25) {
    return {
      color: '#f97316',
      label: 'ثقة متراجعة',
      description: 'خطر: تأخير في الإجراءات. النيابة تراقب أخطاءك.',
    };
  }

  return {
    color: '#ef4444',
    label: 'ثقة حرجة',
    description: 'حرج جداً: قد يتم إغلاق مسارات تحقيق أو تجميد أدواتك.',
  };
}
