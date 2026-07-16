const functions = require("firebase-functions");
const crypto = require("crypto");
const admin = require("firebase-admin");
if (!admin.apps.length) { admin.initializeApp(); }

exports.helloMassageMap = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    res.json({ status: "ok", message: "Cloud Functions working" });
  });

exports.createPayfastPayment = functions
  .region("us-central1")
  .https.onRequest((req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.set("Access-Control-Allow-Headers", "Content-Type");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const merchantId = process.env.PAYFAST_MERCHANT_ID;
    const merchantKey = process.env.PAYFAST_MERCHANT_KEY;
    const passphrase = process.env.PAYFAST_PASSPHRASE;

    const { amount, supplierId, termMonths, nameFirst, nameLast, emailAddress } = req.body;

    const params = {
      merchant_id: merchantId,
      merchant_key: merchantKey,
      return_url: "https://micmaru.github.io/massage-directory/payment.html?status=success",
      cancel_url: "https://micmaru.github.io/massage-directory/payment.html?status=cancelled",
      notify_url: "https://us-central1-massage-directory-57e19.cloudfunctions.net/payfastNotify",
      name_first: nameFirst || "",
      name_last: nameLast || "",
      email_address: emailAddress || "",
      m_payment_id: supplierId,
      amount: parseFloat(amount).toFixed(2),
      item_name: `MassageMap ${termMonths} month`,
    };

    const sortedKeys = ['merchant_id','merchant_key','return_url','cancel_url','notify_url','name_first','name_last','email_address','m_payment_id','amount','item_name'];
    const paramString = sortedKeys
      .map(k => `${k}=${encodeURIComponent(params[k]).replace(/%20/g, "+")}`)
      .join("&");
    const signatureString = passphrase
      ? `${paramString}&passphrase=${encodeURIComponent(passphrase).replace(/%20/g, "+")}`
      : paramString;
    const signature = crypto.createHash("md5").update(signatureString).digest("hex");

    const payfastUrl = "https://sandbox.payfast.co.za/eng/process";
    const allParams = { ...params, signature };
    const formHtml = `<!DOCTYPE html><html><body>
<form id="pf" action="${payfastUrl}" method="post">
${Object.keys(allParams).map(k => `<input type="hidden" name="${k}" value="${allParams[k]}">`).join("\n")}
</form>
<script>document.getElementById("pf").submit();</script>
</body></html>`;

    res.send(formHtml);
  });

exports.payfastNotify = functions
  .region("us-central1")
  .https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", "*");
    if (req.method === "OPTIONS") { res.status(204).send(""); return; }

    const admin = require("firebase-admin");
    if (!admin.apps.length) { admin.initializeApp(); }
    const db = admin.firestore();

    const data = req.body;
    if (data.payment_status !== "COMPLETE") { res.status(200).send("not complete"); return; }

    const supplierId = data.m_payment_id;
    const amount = parseFloat(data.amount_gross);

    const supplierRef = db.collection("suppliers").doc(supplierId);
    const supplierSnap = await supplierRef.get();
    if (!supplierSnap.exists) { res.status(200).send("supplier not found"); return; }

    const termMonths = parseInt(data.item_name.match(/(\d+) month/)?.[1] || "1");
    const startDate = new Date();
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + termMonths);

    await db.collection("subscriptions").add({
      supplierId,
      monthlyRate: supplierSnap.data().supplierType === "spa" ? 999 : 299,
      termMonths,
      totalAmountPaid: amount,
      startDate: admin.firestore.Timestamp.fromDate(startDate),
      expiryDate: admin.firestore.Timestamp.fromDate(expiryDate),
      reminderSent3Days: false,
      status: "active",
      payfastRef: data.pf_payment_id || "",
    });

    await supplierRef.update({ status: "active" });

    res.status(200).send("ok");
  });

exports.onSupplierRegistered = functions
  .region("us-central1")
  .firestore
  .document("suppliers/{supplierId}")
  .onUpdate(async (change, context) => {
    const admin = require("firebase-admin");
    if (!admin.apps.length) { admin.initializeApp(); }
    const db = admin.firestore();

    const after = change.after.data();
    const before = change.before.data();
    if (!after.registrationComplete || before.registrationComplete === true) {
      console.log("onSupplierRegistered: skipping — not a registrationComplete transition");
      return null;
    }

    const { displayName, firstName, lastName, supplierType, cellNumber, email, supplierNumber, province, area } = after;

    function formatPhone(phone) {
      if (!phone) return null;
      if (phone.startsWith("+27")) return phone;
      if (phone.startsWith("0")) return "+27" + phone.slice(1);
      return phone;
    }

    const { Resend } = require("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    const supplierName = supplierType === "individual" ? `${firstName} ${lastName} (${displayName})` : displayName;

    // Step 1 — Telegram
    try {
      await fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: process.env.TELEGRAM_CHAT_ID,
          text: `New MassageMap Registration\nName: ${supplierName}\nType: ${supplierType === 'individual' ? 'Individual Therapist' : 'Spa'}\nNumber: ${supplierNumber}\nArea: ${province}, ${area}\nCell: ${cellNumber}`,
        }),
      });
    } catch (err) {
      console.error("Telegram notification failed:", err);
    }

    // Step 2 — Admin email
    try {
      const typeLabel = supplierType === "spa" ? "Spa" : "Individual Therapist";
      const dateStr = new Date().toLocaleString("en-ZA", { timeZone: "Africa/Johannesburg" });
      const adminEmailText = [
        "New MassageMap Registration Received",
        "",
        `Supplier Name:   ${supplierName}`,
        `Type:            ${typeLabel}`,
        `Supplier Number: ${supplierNumber}`,
        `Province:        ${province}`,
        `Area:            ${area}`,
        `Cell Number:     ${cellNumber}`,
        `Registered:      ${dateStr}`,
        "",
        "View admin dashboard:",
        "  https://massagemap.co.za/admin.html",
        "",
        "— MassageMap Automated Notification",
      ].join("\n");
      await resend.emails.send({
        from: "MassageMap <onboarding@resend.dev>",
        to: "admin@massagemap.co.za",
        subject: "New MassageMap Registration Received",
        text: adminEmailText,
      });
    } catch (err) {
      console.error("Admin email failed:", err);
    }

    // Step 3 — BulkSMS to therapist
    if (supplierType === "individual" && cellNumber) {
      try {
        const smsResponse = await fetch("https://api.bulksms.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(process.env.BULKSMS_TOKEN_ID + ":" + process.env.BULKSMS_TOKEN_SECRET).toString("base64"),
          },
          body: JSON.stringify({
            to: formatPhone(cellNumber),
            body: "Welcome to MassageMap. Your registration is received. We will contact you shortly.",
          }),
        });
        const smsResult = await smsResponse.text();
        console.log("BulkSMS response status:", smsResponse.status);
        console.log("BulkSMS response body:", smsResult);
      } catch (err) {
        console.error("BulkSMS failed:", err);
      }
    }

    // Step 4 — Welcome email to therapist
    if (supplierType === "individual" && email) {
      try {
        const welcomeText = [
          `Hi ${displayName},`,
          "",
          `Welcome to MassageMap! Your therapist registration has been received.`,
          "",
          `Your membership number is:`,
          `  ${supplierNumber}`,
          "",
          "Please keep this number for your records — you will need it if you",
          "contact MassageMap support.",
          "",
          "What happens next:",
          "  1. Our team will review and verify your registration.",
          "  2. We will contact you to confirm details.",
          "  3. Once approved, your listing will appear in search results.",
          "",
          "Log in to your dashboard at any time to update your profile:",
          "  https://massagemap.co.za/dashboard.html",
          "",
          "— The MassageMap Team",
        ].join("\n");
        await resend.emails.send({
          from: "MassageMap <onboarding@resend.dev>",
          to: email,
          subject: `Welcome to MassageMap — your membership number is ${supplierNumber}`,
          text: welcomeText,
        });
      } catch (err) {
        console.error("Therapist welcome email failed:", err);
      }
    }

    // Step 5 — Welcome email to spa
    if (supplierType === "spa" && email) {
      try {
        const welcomeText = [
          `Hi ${displayName},`,
          "",
          `Welcome to MassageMap! Your spa registration has been received.`,
          "",
          `Your membership number is:`,
          `  ${supplierNumber}`,
          "",
          "Please keep this number for your records — you will need it if you",
          "contact MassageMap support.",
          "",
          "What happens next:",
          "  1. Our team will review and verify your registration.",
          "  2. We will contact you to confirm details.",
          "  3. Once approved, your listing will appear in search results.",
          "",
          "Log in to your dashboard at any time to update your profile:",
          "  https://massagemap.co.za/dashboard.html",
          "",
          "— The MassageMap Team",
        ].join("\n");
        await resend.emails.send({
          from: "MassageMap <onboarding@resend.dev>",
          to: email,
          subject: `Welcome to MassageMap — your membership number is ${supplierNumber}`,
          text: welcomeText,
        });
      } catch (err) {
        console.error("Spa welcome email failed:", err);
      }
    }

    // Step 6 — Audit log
    try {
      await db.collection("auditLog").add({
        supplierId: context.params.supplierId,
        action: "registration_received",
        actor: "system",
        supplierName: displayName,
        supplierType: supplierType,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("Audit log write failed:", err);
    }
  });

exports.checkIncompleteRegistrations = functions
  .region("us-central1")
  .pubsub.schedule("every 24 hours")
  .onRun(async () => {
    const db = admin.firestore();
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    function formatPhone(phone) {
      if (!phone) return null;
      if (phone.startsWith("+27")) return phone;
      if (phone.startsWith("0")) return "+27" + phone.slice(1);
      return phone;
    }

    let snap;
    try {
      snap = await db.collection("pending_registrations")
        .where("status", "==", "incomplete")
        .get();
    } catch (err) {
      console.error("checkIncompleteRegistrations: Firestore query failed:", err);
      return;
    }

    for (const docSnap of snap.docs) {
      const data = docSnap.data();
      if (data.smsSent === true) continue;

      const createdAt = data.createdAt?.toMillis?.() ?? 0;
      if (createdAt >= cutoff) continue;

      const to = formatPhone(data.cellNumber);
      if (!to) {
        console.warn(`checkIncompleteRegistrations: no cellNumber on doc ${docSnap.id}, skipping`);
        continue;
      }

      try {
        const smsResponse = await fetch("https://api.bulksms.com/v1/messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Basic " + Buffer.from(
              process.env.BULKSMS_TOKEN_ID + ":" + process.env.BULKSMS_TOKEN_SECRET
            ).toString("base64"),
          },
          body: JSON.stringify({
            to,
            body: "Hi! It looks like you started registering on MassageMap but didn't finish. Need help? WhatsApp us on 0842500422 and we'll get you listed.",
          }),
        });
        const smsResult = await smsResponse.text();
        console.log(`checkIncompleteRegistrations: SMS sent to ${to} — HTTP ${smsResponse.status} — ${smsResult}`);
        await docSnap.ref.update({ smsSent: true });
      } catch (err) {
        console.error(`checkIncompleteRegistrations: SMS failed for ${to}:`, err);
      }
    }
  });

exports.generateSupplierNumber = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Must be signed in.");
    }
    const phone = context.auth.token.phone_number;
    if (!phone) {
      throw new functions.https.HttpsError("failed-precondition", "No verified phone on token.");
    }
    const db = admin.firestore();
    const supplierRef = db.collection("suppliers").doc(phone);
    const existing = await supplierRef.get();
    if (existing.exists && existing.data().supplierNumber) {
      return { supplierNumber: existing.data().supplierNumber };
    }
    const pendRef = db.collection("pending_registrations").doc(phone);
    const pendSnap = await pendRef.get();
    const supplierType = pendSnap.exists ? (pendSnap.data().supplierType || "individual") : "individual";
    const counterField = supplierType === "spa" ? "counterSpa" : "counterIndividual";
    const prefix = supplierType === "spa" ? "S" : "T";
    const configRef = db.collection("settings").doc("config");

    let supplierNumber;
    await db.runTransaction(async tx => {
      const snap = await tx.get(configRef);
      const current = snap.exists ? (snap.data()[counterField] || 1000) : 1000;
      const next = Math.max(current + 1, 1001);
      const yy = String(new Date().getFullYear()).slice(-2);
      supplierNumber = `${prefix}-${yy}-${String(next).padStart(4, "0")}`;
      tx.set(configRef, { [counterField]: next }, { merge: true });
      tx.set(pendRef, { supplierNumber }, { merge: true });
      tx.set(supplierRef, {
        uid: context.auth.uid,
        cellNumber: phone,
        supplierNumber,
        supplierType,
        status: "pending",
        subscriptionStatus: "not_paid",
        subscriptionExpiry: null,
        registrationComplete: false,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    });

    return { supplierNumber };
  });

exports.recordOtpEvent = functions
  .region("us-central1")
  .https.onCall(async (data, context) => {
    const { phone, collection, action } = data;
    if (!phone || !collection || !action) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing phone, collection, or action.');
    }
    if (collection !== 'pending_registrations') {
      throw new functions.https.HttpsError('invalid-argument', 'Unsupported collection.');
    }
    const ref = admin.firestore().collection(collection).doc(phone);
    const snap = await ref.get();

    if (action === 'check') {
      if (!snap.exists) return { locked: false };
      const d = snap.data();
      if (d.otpLockedUntil && d.otpLockedUntil.toMillis() > Date.now()) {
        return { locked: true, lockedUntil: d.otpLockedUntil.toMillis() };
      }
      return { locked: false };
    }

    if (action === 'fail') {
      if (!snap.exists) return { locked: false, counted: false };
      const current = snap.data().otpFailedAttempts || 0;
      const next = current + 1;
      if (next < 3) {
        await ref.set({ otpFailedAttempts: next }, { merge: true });
        return { locked: false, counted: true, attempts: next };
      }
      const lockedUntil = admin.firestore.Timestamp.fromMillis(Date.now() + 15 * 60 * 1000);
      await ref.set({ otpFailedAttempts: 0, otpLockedUntil: lockedUntil }, { merge: true });
      return { locked: true, counted: true };
    }

    throw new functions.https.HttpsError('invalid-argument', 'Unknown action.');
  });
