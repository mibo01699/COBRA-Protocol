# يتم تحديث كود ratio_calculator.py في مجلد الذكاء الاصطناعي محلياً

class CobraTieredRatioCalculator:
    def __init__(self):
        self.PI_FACTOR = 10**7       
        self.YER_FACTOR = 10**10     
        self.PI_GCV_RATE = 314159    

    def generate_tiered_payload(self, package_id, wholesale_cost_usd, tier_type):
        """
        توليد حزم البيانات بالأرقام الصحيحة بناءً على نوع الاستخدام: فردي (Individual) أو شركات (Enterprise)
        """
        # ضبط هامش الربح ديناميكياً: 8% للأفراد، و 5% للشركات والموزعين لتمكينهم من ضرب الأسعار الاحتكارية
        margin = 0.08 if tier_type == "INDIVIDUAL" else 0.05
        
        total_required_usd = wholesale_cost_usd * (1 + margin)
        
        # تقسيم المقاصة الهجينة (50% Pi و 50% YER)
        pi_share_usd = total_required_usd * 0.50
        yer_share_usd = total_required_usd * 0.50

        # تحويل القيم إلى أرقام صحيحة صارمة (BigInt Casting) لحظر الكسور العائمة
        pi_stroops = int((pi_share_usd * self.PI_FACTOR) / self.PI_GCV_RATE)
        yer_sub_units = int(yer_share_usd * self.YER_FACTOR)

        payload = {
            "transactionMetadata": {
                "cobraTxId": f"COBRA-{int(time.time()):X}-TIER-{tier_type[:3].upper()}",
                "targetProfitMarginPercent": int(margin * 100),
                "userTierClassification": tier_type
            },
            "soverignClearingValues": {
                "piStroopsAmount": pi_stroops,
                "yerSubUnitsAmount": yer_sub_units,
                "gcvReferenceRateUsedUSD": self.PI_GCV_RATE
            },
            "telecomProviderRoute": {
                "targetPackageId": str(package_id),
                "wholesaleCostUSD": float(wholesale_cost_usd),
                "deploymentInfrastructure": "SINGLE_DEVICE_PUSH" if tier_type == "INDIVIDUAL" else "BULK_ROUTER_INJECTION"
            }
        }
        return payload

if __name__ == "__main__":
    calc = CobraTieredRatioCalculator()
    
    # 1. محاكاة طلب باقة فردية (10 جيجابايت للهاتف الشخصي)
    print("\n--- [توليد باقة استخدام فردي] ---")
    print(calc.generate_tiered_payload("individual_10gb", 9.25, "INDIVIDUAL")["transactionMetadata"])
    
    # 2. محاكاة طلب باقة شركات ضخمة (500 جيجابايت لموزع محلي لشبكة واي فاي شوارع)
    print("\n--- [توليد باقة شركات وموزعين ضخمة لكسر الاحتكار] ---")
    print(calc.generate_tiered_payload("bulk_corporate_500gb", 350.00, "ENTERPRISE_DISTRIBUTOR")["transactionMetadata"])
