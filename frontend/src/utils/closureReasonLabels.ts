export const CLOSURE_REASON_LABELS = {
  missing_culprit: "لم يتم تحديد الجاني الصحيح.",
  missing_motive: "الدافع المذكور غير دقيق.",
  missing_method: "طريقة التنفيذ غير صحيحة.",
  insufficient_evidence_count: "عدد الأدلة المرفقة لا يكفي لإغلاق القضية.",
  missing_behavioral_chain: "نقص في تحليل السلسلة السلوكية للمشتبه به.",
  missing_cross_route_evidence: "نقص في الربط العابر بين الأدلة الموثقة.",
  shared_evidence_used_twice: "تم استخدام نفس الدليل في أكثر من مسار إغلاق بشكل غير مسموح.",
  incomplete_evidence_pair: "الحجة الأساسية مقسومة على سجلّين — ارفقهما معًا أو اتركهما.",
} as const;

export function getClosureReasonLabel(code: string): string {
  return CLOSURE_REASON_LABELS[code as keyof typeof CLOSURE_REASON_LABELS] ?? code;
}