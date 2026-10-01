/* eslint-disable */
const fs = require('fs');
const path = require('path');

const casesDir = 'd:/game/cases';

function updateCase(caseId, patch) {
    const file = path.join(casesDir, caseId, `${caseId}.json`);
    if (!fs.existsSync(file)) {
        console.log(`File not found: ${file}`);
        return;
    }
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    patch(data);
    fs.writeFileSync(file, JSON.stringify(data, null, 2) + '\n', 'utf8');
    console.log(`Updated ${caseId}`);
}

// Case 01: PHS Hints
updateCase('case01', (data) => {
    data.maxPhsLevels = 7;
    data.phs_hints = [
        {
            level: "L1",
            type: "note",
            payload: {
                text: "هناك تفاصيل صغيرة في مسرح الجريمة ربما لم تلاحظها بعد. راجع التقارير الجنائية بدقة.",
                source_ref: "generic"
            }
        },
        {
            level: "L2",
            type: "note",
            payload: {
                text: "تقرير منشأ الحريق (SCN-03) يثبت أن النار بدأت في المكتب وليس المخزن. لماذا كذب شريف بشأن ذلك؟",
                source_ref: "SCN-03"
            }
        },
        {
            level: "L3",
            type: "note",
            payload: {
                text: "ركز على أقوال شريف عادل السيوفي. هناك تناقض صارخ بين ما ادعاه وبين الحقائق الفنية.",
                metadata: { reason: "missing_behavioral_chain" }
            }
        },
        {
            level: "L4",
            type: "note",
            payload: {
                text: "تقرير السخام (SCN-04) يرجح أن الباب أُغلق من الخارج. هذا يعني أن الضحية لم يغلق الباب على نفسه.",
                source_ref: "SCN-04"
            }
        },
        {
            level: "L5",
            type: "note",
            payload: {
                text: "الدفتر الأسود الممزق (OBJ-01) هو المفتاح لفهم الدافع الحقيقي. ابحث عن العلاقة بين شريف وهذا الدفتر.",
                source_ref: "OBJ-01"
            }
        },
        {
            level: "L6",
            type: "note",
            payload: {
                text: "تحتاج للربط بين تقرير السخام، ومفاتيح ليلى، وسجل الجرد لتفهم كيف تم إغلاق مسرح الجريمة.",
                source_ref: "EVID-PARTIAL-LOCK"
            }
        },
        {
            level: "L7",
            type: "direct",
            payload: {
                text: "لا يمكنك إغلاق القضية بدون 'سلسلة سلوكية'. واجه شريف بزلة لسانه عن الدفتر ومكان الحريق."
            }
        }
    ];
});

// Case 02: Solution
updateCase('case02', (data) => {
    data.solution = {
        culprit: "char_ibrahim_giar",
        motive: "motive_insurance_fraud",
        method: "magnetic_pulse",
        explanation: "مالك المكتبة إبراهيم الجيار استخدم جهاز نبض مغناطيسي (Magnetic Pulse) لتعطيل تروس الساعة التاريخية وإحداث حريق متعمد لتفعيل بوليصة التأمين وسداد ديونه المتراكمة."
    };
});

// Case 03: Solution
updateCase('case03', (data) => {
    data.solution = {
        culprit: "SUSP-03-01",
        motive: "motive_adel_debts_extortion",
        method: "method_chemical_poisoning",
        explanation: "قام عادل المنصوري باستبدال دواء القلب الخاص بعمه بمركب كيميائي سام (Cyanide-Analog-B12) حصل عليه من 'الخيميائي'، بهدف التخلص من عمه والحصول على الميراث لسداد ديونه."
    };
});

// Case 10: Solution
updateCase('case10', (data) => {
    data.solution = {
        culprit: "SUSP-10-01",
        motive: "motive_trinity_liquidation",
        method: "method_syndicate_assassination",
        explanation: "قامت منظمة 'الثالوث' بتصفية هشام المغربي عبر التنسيق بين 'الخيميائي' لتوفير المادة المخدرة و'صانع الساعات' لتعطيل الكاميرات لحظة التنفيذ، وذلك لمنعه من الانسحاب من شبكة غسيل الأموال."
    };
});

// Case 22: Solution
updateCase('case22', (data) => {
    data.solution = {
        culprit: "SUSP-22-01",
        motive: "motive_syndicate_logistics",
        method: "method_syndicate_arson",
        explanation: "نفذت قيادة 'الثالوث' عملية لوجستية منسقة شملت سرقة مواد كيميائية، وحرق سجلات محاسبية، واختطاف موظف تموين، لضمان استمرارية خطوط الإمداد وتأمين المنظمة من أي تتبع مالي."
    };
});
