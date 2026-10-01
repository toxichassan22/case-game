export const CLOSURE_REASON_LABELS = {
  missing_culprit: "لم يتم تحديد الجاني الصحيح.",
  missing_motive: "الدافع المذكور غير دقيق.",
  missing_method: "طريقة التنفيذ غير صحيحة.",
  insufficient_evidence_count: "عدد الأدلة المرفقة لا يكفي لإغلاق القضية.",
  missing_behavioral_chain: "نقص في تحليل السلسلة السلوكية للمشتبه به.",
  missing_cross_route_evidence: "نقص في الربط العابر بين الأدلة الموثقة.",
  shared_evidence_used_twice: "تم استخدام نفس الدليل في أكثر من مسار إغلاق بشكل غير مسموح.",
  missing_clockmaker_link: "الرابط الحاسم بخيط صانع الساعات ما زال ناقصًا.",
  missing_chemical_evidence: "الدليل الكيميائي الحاسم ما زال ناقصًا.",
  missing_forgery_evidence: "لم يكتمل إثبات التزوير المرتبط بالقضية.",
  missing_murder_weapon: "سلاح الجريمة أو أثره المباشر ما زال غير مثبت.",
  missing_behavioral_manipulation_link: "رابط التلاعب السلوكي لم يثبت بعد.",
  missing_forgery_link: "الرابط بين المستندات المزورة وباقي الخيوط ما زال ناقصًا.",
  missing_clockmaker_pattern: "النمط المتكرر لصانع الساعات لم يتأكد بعد.",
  missing_network_link: "الرابط الشبكي بين الأطراف أو الوقائع ما زال غير مكتمل.",
  missing_silencing_motive: "دافع إسكات الضحية لم يثبت بما يكفي.",
  missing_external_manipulator: "وجود طرف خارجي محرّك للأحداث لم يُثبت بعد.",
  missing_trinity_method_proof: "إثبات طريقة تنفيذ الثالوث ما زال ناقصًا.",
  missing_alchemist_signature: "بصمة الخيميائي لم تُثبت في الأدلة الحالية.",
  missing_trinity_link: "حلقة الربط مع خيط الثالوث ما زالت ناقصة.",
  missing_trinity_play_link: "الربط بين مسرحية الثالوث ومسار الجريمة لم يكتمل.",
  missing_trinity_financial_link: "الأثر المالي المرتبط بالثالوث لم يثبت بعد.",
  missing_trinity_lair_validation: "لم يتم التحقق بما يكفي من وكر الثالوث أو أثره.",
  missing_alchemist_link: "الرابط المباشر بالخيميائي ما زال ناقصًا.",
  missing_orchestra_link: "الرابط الحاسم بخيط الأوركسترا لم يثبت بعد.",
} as const;

export function getClosureReasonLabel(code: string): string {
  return CLOSURE_REASON_LABELS[code as keyof typeof CLOSURE_REASON_LABELS] ?? code;
}
