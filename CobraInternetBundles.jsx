// COBRA Protocol - Internet Bundles & Retail Matrix Dashboard
// واجهة عرض واختيار حزم الإنترنت والبيانات المشفرة للشرائح السيادية
import React, { useState, useEffect } from 'react';
import { CobraInternetRotationEngine } from './CobraInternetRotationEngine';

const rotationEngine = new CobraInternetRotationEngine();

export default function CobraInternetBundles() {
    // تصنيع الباقات وتركيب الخدمات آلياً حسب الشرائح والمستويات الاقتصادية والفاخرة
    const [internetBundles, setInternetBundles] = useState([
        { id: "INT-ECONOMY", name: "باقة الإنترنت الاقتصادية (للموظفين والأفراد)", dataQuota: "20 GB", wholesaleUSD: 5.00, displayYER: "0" },
        { id: "INT-MEDIUM", name: "الباقة السحابية المتوسطة (للتجار والأعمال)", dataQuota: "100 GB", wholesaleUSD: 15.00, displayYER: "0" },
        { id: "INT-PREMIUM", name: "باقة الـ Premium الفاخرة (للمدراء والشركات)", dataQuota: "Unlimited Unlimited", wholesaleUSD: 50.00, displayYER: "0" }
    ]);

    const [loading, setLoading] = useState(false);
    const [activatedBundle, setActivatedBundle] = useState("");

    useEffect(() => {
        // محاكاة استدعاء مجمع السيولة المباشر Pi/YER لتسعير الباقات ديناميكياً فور فتح الواجهة
        const mockYerToPi = "0.000025";
        const mockPiToUsdt = "1.20";

        const updatedBundles = internetBundles.map(bundle => {
            const pricing = rotationEngine.calculateInternetBundlePricing(bundle.wholesaleUSD, mockYerToPi, mockPiToUsdt);
            return { ...bundle, displayYER: pricing.userDisplayCostYER };
        });
        setInternetBundles(updatedBundles);
    }, []);

    const handlePurchase = (bundleName) => {
        setLoading(true);
        setTimeout(() => {
            setActivatedBundle(bundleName);
            setLoading(false);
        }, 800); // محاكاة سرعة المقاصة الهجينة عبر البلوكشين
    };

    return (
        <div style={{ padding: '25px', fontFamily: 'Cairo, sans-serif', direction: 'rtl', textAlign: 'center', backgroundColor: '#0a0f1d', color: '#fff', minHeight: '100vh' }}>
            <h1 style={{ color: '#00ffcc' }}>🐍 بروتوكول كوبرا | بوابة الإنترنت السيادي</h1>
            <p style={{ opacity: 0.8 }}>منصة توزيع الباقات وحزم البيانات الرقمية - منظومة النسر العربي</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '600px', margin: '30px auto' }}>
                {internetBundles.map(bundle => (
                    <div key={bundle.id} style={{ border: '2px solid #1e293b', background: '#111827', padding: '20px', borderRadius: '12px', textAlign: 'right', transition: '0.3s', boxShadow: '0 4px 6px rgba(0,0,0,0.3)' }}>
                        <h3 style={{ color: '#00ffcc', marginTop: 0 }}>{bundle.name}</h3>
                        <p style={{ margin: '5px 0' }}>سعة البيانات المتاحة: <strong style={{ color: '#fff' }}>{bundle.dataQuota}</strong></p>
                        <p style={{ margin: '5px 0' }}>إجمالي الرسوم التشغيلية لتنشيط الباقة: <strong style={{ color: '#d4af37', fontSize: '18px' }}>{bundle.displayYER} YER</strong></p>
                        <small style={{ color: '#9ca3af', display: 'block', marginBottom: '10px' }}>* السعر شامل كافة رسوم السحب والتحويل لضمان استمرارية بث خوادم الإنترنت وصفر خسائر.</small>
                        
                        <button onClick={() => handlePurchase(bundle.name)} disabled={loading} style={{ background: '#00ffcc', color: '#000', border: 'none', padding: '10px 20px', fontSize: '15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', width: '100%' }}>
                            {loading ? "جاري معالجة بروتوكول المقاصة المزدوج..." : "تنشيط واستلام حزمة البيانات الفورية"}
                        </button>
                    </div>
                ))}
            </div>

            {activatedBundle && (
                <div style={{ marginTop: '20px', padding: '15px', background: '#065f46', borderRadius: '8px', maxWidth: '600px', margin: '20px auto', border: '1px solid #10b981' }}>
                    <h3 style={{ margin: 0 }}>🎉 تم تفعيل [{activatedBundle}] بنظام الدفع الهجين بنجاح!</h3>
                    <p style={{ margin: '5px 0 0 0', fontSize: '14px' }}>تم تدوير رأس مال المزود بالكامل، وتأمين استمرار البث الشبكي لحسابك دون انقطاع.</p>
                </div>
            )}
        </div>
    );
}
