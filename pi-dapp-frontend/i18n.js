/**
 * @file i18n.js
 * @desc محرك دمج وتدويل لغات العالم لبروتوكول Cobra eSIM
 */

const cobraTranslations = {
    "ar": {
        title: "نظام التوزيع اللامركزي السيادي",
        ind_tab: "👤 استخدام فردي (ربح 8%)",
        ent_tab: "🏢 شركات وموزعين (ربح 5%)",
        btn_buy: "شراء وتفعيل الإنترنت الفوري",
        securing: "⚡ جاري فحص الـ AMM اللحظي وضبط الحصص بالأرقام الصحيحة لمكافحة الخسائر..."
    },
    "en": {
        title: "Sovereign Decentered Distribution System",
        ind_tab: "👤 Individual Use (8% Profit)",
        ent_tab: "🏢 Enterprise & Distributors (5% Profit)",
        btn_buy: "Purchase & Instant Internet Activation",
        securing: "⚡ Auditing live AMM & mapping strict integer scales to eliminate capital loss risk..."
    },
    "zh": {
        title: "主权去中心化分配系统",
        ind_tab: "👤 个人使用 (8% 利润)",
        ent_tab: "🏢 企业与分销商 (5% 利润)",
        btn_buy: "购买并即时激活网络",
        securing: "⚡ 正在审计实时 AMM 并配置精确整数比例以实现零资金损失风险..."
    },
    "es": {
        title: "Sistema de Distribución Soberano Descentralizado",
        ind_tab: "👤 Uso Individual (8% Ganancia)",
        ent_tab: "🏢 Empresas y Distribuidores (5% Ganancia)",
        btn_buy: "Comprar y Activación Instantánea de Internet",
        securing: "⚡ Auditando AMM en vivo y mapeando enteros estrictos para eliminar riesgo de pérdida..."
    }
};

/**
 * @notice دالة دمج لغة الهاتف التلقائية في واجهة مستعرض Pi Browser
 */
function applyGlobalLocalization(userLanguage) {
    const lang = cobraTranslations[userLanguage] ? userLanguage : "en"; // التحويل التلقائي للإنجليزية كغطاء أمان عالمي
    const t = cobraTranslations[lang];

    // حقن الترجمات ديناميكياً داخل عناصر الواجهة الرسومية
    document.querySelector('h2').innerText = `🐍 COBRA eSIM - ${t.title}`;
    document.getElementById('tab-ind').innerText = t.ind_tab;
    document.getElementById('tab-ent').innerText = t.ent_tab;
    document.getElementById('btn-execute').innerText = t.btn_buy;
    
    console.log(`[Cobra i18n]: Multilingual integration established for language culture: ${lang}`);
}
