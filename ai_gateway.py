import time
import hmac
import hashlib
import json

class CobraAIEngine:
    def __init__(self, secret_key: str):
        self.secret_key = secret_key.encode()
        # أسعار مرجعية ثابتة ومحاكاة لـ AMM (Pi GCV = $314159, YER = $0.004)
        self.pi_gcv_usd = 314159.0
        self.yer_peg_usd = 0.004 # فرضية سعر صرف الريال اليمني التجاري مقارنة بالدولار
        
    def predict_slippage_and_validate(self, package_cost_usd: float, pool_liquidity_usd: float, profit_margin: float) -> dict:
        """
        توقع الانزلاق السعري في مجمع السيولة وحماية هامش الربح في أقل من ثانية
        """
        start_time = time.time()
        
        # 1. محاكاة حساب تأثير السعر (Price Impact) بناءً على حجم المعاملة مقارنة بالسيولة
        # معادلة مجمع السيولة الثابت: x * y = k
        price_impact = (package_cost_usd / pool_liquidity_usd) * 100
        
        # 2. فحص قيد حماية الأرباح (Profit Guard)
        # إذا كان الانزلاق السعري يلتهم الهامش أو يقلل الربح عن 5% يتم رفض المعاملة
        effective_margin = profit_margin - price_impact
        
        if effective_margin < 5.0:
            return {
                "status": "REJECTED",
                "reason": f"AMM Price impact ({price_impact:.2f}%) exceeds profit guard threshold. Effective margin: {effective_margin:.2f}%",
                "latency_ms": (time.time() - start_time) * 1000
            }
            
        # 3. حساب الكميات الصحيحة بالدقة الرقمية (Zero-Floating BigInt Numbers)
        # الحصة المقسمة 50% لكل عملة بالدولار شاملة هامش الربح
        total_user_price_usd = package_cost_usd * (1 + (profit_margin / 100))
        half_share_usd = total_user_price_usd / 2.0
        
        # تحويل القيم إلى أعداد صحيحة متوافقة مع العقد الذكي (Integer-only math)
        pi_amount_raw = int((half_share_usd / self.pi_gcv_usd) * (10**7))
        yer_amount_raw = int((half_share_usd / self.yer_peg_usd) * (10**10))
        
        # 4. إنشاء توقيع أمني رقمي مشفر للمعاملة المقبولة من الذكاء الاصطناعي ليمر عبر العقد الذكي
        payload = f"{pi_amount_raw}:{yer_amount_raw}:{int(time.time())}"
        signature = hmac.new(self.secret_key, payload.encode(), hashlib.sha256).hexdigest()
        
        return {
            "status": "APPROVED",
            "pi_amount_raw": pi_amount_raw,
            "yer_amount_raw": yer_amount_raw,
            "ai_signature": signature,
            "latency_ms": (time.time() - start_time) * 1000
        }

# --- تشغيل تجريبي للمحرك وسرعة الاستجابة ---
if __name__ == "__main__":
    ai_engine = CobraAIEngine(secret_key="COBRA_SUPER_SECRET_KEY")
    
    # تجربة 1: باقة بـ 15 دولار في مجمع سيولة مستقر وعميق
    result = ai_engine.predict_slippage_and_validate(
        package_cost_usd=15.0, 
        pool_liquidity_usd=50000.0, 
        profit_margin=10.0
    )
    print("--- معاملة مقبولة ---")
    print(json.dumps(result, indent=2))
    
    # تجربة 2: باقة بـ 100 دولار في مجمع سيولة ضئيل وضخم الانزلاق
    result_rejected = ai_engine.predict_slippage_and_validate(
        package_cost_usd=100.0, 
        pool_liquidity_usd=1200.0, 
        profit_margin=8.0
    )
    print("\n--- معاملة مرفوضة بسبب قيد حماية الأرباح ---")
    print(json.dumps(result_rejected, indent=2))
