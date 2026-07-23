# PAYMENTS — LOCKED

Status: locked

91. PayFast signature generation: NEVER client-side — always via Cloud Function
92. Parameter order is FIXED — any deviation breaks the signature
93. Prices always read from `settings/config` — never hardcoded. `priceIndividual` = 299, `priceSpa` = 999
94. Therapist subscription: R299/month. Spa subscription: R999/month.
95. Manual EFT option in scope for launch — FNB bank account, proof of payment upload, admin approval
