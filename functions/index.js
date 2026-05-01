const functions = require("firebase-functions");
const crypto = require("crypto");

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
