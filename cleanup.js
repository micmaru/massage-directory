'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('./massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function main() {
  const snapshot = await db.collection('suppliers').get();
  const seedDocs = snapshot.docs.filter(doc => doc.id.startsWith('seed_'));

  if (seedDocs.length === 0) {
    console.log('Deleted 0 ghost seed documents and their subcollections');
    process.exit(0);
  }

  // Delete changeLogs subcollection for each seed document
  for (const doc of seedDocs) {
    const logsSnap = await doc.ref.collection('changeLogs').get();
    if (!logsSnap.empty) {
      for (let i = 0; i < logsSnap.docs.length; i += 500) {
        const batch = db.batch();
        logsSnap.docs.slice(i, i + 500).forEach(logDoc => batch.delete(logDoc.ref));
        await batch.commit();
      }
    }
  }

  // Delete the parent seed documents
  for (let i = 0; i < seedDocs.length; i += 500) {
    const batch = db.batch();
    seedDocs.slice(i, i + 500).forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }

  console.log(`Deleted ${seedDocs.length} ghost seed documents and their subcollections`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
