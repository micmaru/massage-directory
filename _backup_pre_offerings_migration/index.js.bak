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
  .onCreate(async (snap, context) => {
    const admin = require("firebase-admin");
    if (!admin.apps.length) { admin.initializeApp(); }
    const db = admin.firestore();

    const { displayName, firstName, lastName, supplierType, cellNumber, email, supplierNumber, province, area } = snap.data();

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
        to: "hjcilliers@gmail.com",
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
