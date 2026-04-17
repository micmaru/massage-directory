/**
 * clear-seed.js — Delete all seed/fake records from the suppliers collection.
 *
 * Identifies seed records by the absence of the `idVerified` field.
 * Real registered therapists always have `idVerified` set during registration.
 *
 * Run:
 *   node clear-seed.js
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore }        = require('firebase-admin/firestore');
const path = require('path');

initializeApp({
  credential: cert(path.join(__dirname, 'serviceAccount.json')),
  projectId:  'massage-directory-57e19',
});

const db = getFirestore();

async function clearSeedData() {
  console.log('Fetching all suppliers…');
  const snap = await db.collection('suppliers').get();

  // Seed records have no `idVerified` field; real registrations always set it.
  const seedDocs = snap.docs.filter(d => !('idVerified' in d.data()));

  if (seedDocs.length === 0) {
    console.log('No seed records found — nothing to delete.');
    return;
  }

  const realCount = snap.size - seedDocs.length;
  console.log(`Found ${seedDocs.length} seed record(s) to delete (${realCount} real record(s) will be preserved).`);

  // Firestore batch limit is 500 writes per commit.
  const BATCH_SIZE = 500;
  let deleted = 0;

  for (let i = 0; i < seedDocs.length; i += BATCH_SIZE) {
    const batch = db.batch();
    seedDocs.slice(i, i + BATCH_SIZE).forEach(d => batch.delete(d.ref));
    await batch.commit();
    deleted += Math.min(BATCH_SIZE, seedDocs.length - i);
    console.log(`  Deleted ${deleted} / ${seedDocs.length}…`);
  }

  console.log(`Done! ${deleted} seed record(s) removed.`);
}

clearSeedData().catch(err => { console.error(err); process.exit(1); });
