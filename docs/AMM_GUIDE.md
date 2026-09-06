# AMM Guide – COBRA Protocol (Sandbox/Testnet)

## 🧭 Overview

This document describes the Automated Market Maker (AMM) architecture used in the COBRA Protocol for eSIM billing and settlement.

> **⚠️ Important:** This is a **sandbox/testnet-only prototype**.  
> It does **NOT** claim official certification or funding from any organization.

---

## 📊 AMM Architecture

| Component | Description |
|-----------|-------------|
| **Global Pool (Pi/USD)** | Tracks Pi/USD market prices (simulated). |
| **Sovereign Pool (YER/Pi)** | Tracks YER/Pi exchange rates (simulated). |

---

## 🔄 Settlement Mechanics

- **Wholesale Cost:** Settled in YER tokens based on AMM depth.
- **GCV Protection:** Settled in Pi at the GCV reference rate.

---

## ⚠️ Disclaimer

All AMM operations are **simulated** in a sandbox environment. No real trading or settlements are executed.

---

**🦅 Developed by Arabian Eagle Technology Group (A.E.C.)**