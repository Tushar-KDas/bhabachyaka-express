# PAYMENT GATEWAY INTEGRATION & ARCHITECTURE
## Bhabachyaka Express (ভ্যাবাচ্যাকা এক্সপ্রেস)

---

## 1. Supported Payment Modes

1. **Simulated DEMO Sandbox (Pre-configured):**
   - Active out-of-the-box for safe commercial demonstration, automated test runs, and user acceptance testing.
   - Generates simulated transaction references (e.g. `TRX-BKASH-XXXXXX`) and marks `isDemo: true` in the `Payment` ledger.
   - Fully exercises the end-to-end booking state machine, seat inventory reservation, PNR generation, and digital QR ticket issuance without deducting real funds.

2. **Counter Cash Collection:**
   - Designed for walk-in counter passengers and physical terminal cashiers.
   - Integrated into the active `CashShift` ledger to calculate collected cash, shift revenue, and cash reconciliation differences.

3. **Production Gateway Providers:**
   - Architecture adapters prepared for bKash Tokenized Checkout, Nagad Direct Payment, and SSLCommerz Payment Gateway.

---

## 2. Production Environment Configuration

To switch from DEMO mode to Live Production Payment Providers, configure the following environment keys in `.env`:

```env
# bKash Tokenized Merchant Credentials
BKASH_APP_KEY="your_bkash_app_key"
BKASH_APP_SECRET="your_bkash_app_secret"
BKASH_USERNAME="your_bkash_username"
BKASH_PASSWORD="your_bkash_password"
BKASH_IS_SANDBOX=false

# Nagad Merchant Credentials
NAGAD_MERCHANT_ID="your_nagad_merchant_id"
NAGAD_PUBLIC_KEY="your_nagad_public_key"
NAGAD_PRIVATE_KEY="your_nagad_private_key"

# SSLCommerz Payment Gateway
SSLCOMMERZ_STORE_ID="your_sslcommerz_store_id"
SSLCOMMERZ_STORE_PASS="your_sslcommerz_store_password"
SSLCOMMERZ_IS_SANDBOX=false
```

---

## 3. Server-Side Callback Verification & Security

- **Strict Server-Side Validation:** A client-side redirect or browser query param is **never** accepted as proof of successful payment.
- **Webhook & IPN Verification:** Payment status transitions occur exclusively after the backend confirms the cryptographic IPN callback with matching amount, currency (`BDT`), and transaction reference.
- **Zero Raw Credential Storage:** PINs, OTPs, and card CVVs are never processed through or stored on the application servers.
