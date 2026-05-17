const admin = require('firebase-admin');
const serviceAccount = require('../massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://massage-directory-57e19.firebaseio.com'
});

const db = admin.firestore();

const TRADITIONS = ['Shiatsu', 'Thai', 'Kahuna', 'Ayurvedic', 'Lomi Lomi'];

function splitMassageTypes(massageTypes) {
  const massageStyles = [];
  const traditions = [];
  const serviceOfferings = [];
  (massageTypes || []).forEach(val => {
    if (val === 'Adult') return;
    if (val === 'Couples') { serviceOfferings.push('Couples Massage'); return; }
    if (TRADITIONS.includes(val)) { traditions.push(val); return; }
    massageStyles.push(val);
  });
  return { massageStyles, traditions, serviceOfferings };
}

async function migrateSuppliers() {
  const snap = await db.collection('suppliers').get();
  if (snap.empty) { console.log('No suppliers found.'); process.exit(0); }
  console.log(`Migrating ${snap.docs.length} supplier documents...`);
  let count = 0;
  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const supplierId = docSnap.id;
    const oldMassageTypes = data.massageTypes || [];
    const { massageStyles, traditions, serviceOfferings } = splitMassageTypes(oldMassageTypes);
    const oldClassification = data.classification;
    const newClassification = Array.isArray(oldClassification)
      ? oldClassification
      : (oldClassification ? [oldClassification] : []);
    const update = {
      massageStyles,
      traditions,
      treatments:       data.treatments       || [],
      classification:   newClassification,
      serviceOfferings: data.serviceOfferings  || serviceOfferings,
      updatedAt:        admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('suppliers').doc(supplierId).update({
      ...update,
      massageTypes: admin.firestore.FieldValue.delete(),
    });
    await db.collection('auditLog').add({
      supplierId,
      action:    'schema_migration_offerings',
      actor:     'system',
      oldValues: { massageTypes: oldMassageTypes, classification: oldClassification },
      newValues: { massageStyles, traditions, classification: newClassification, serviceOfferings },
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log(`  ✓ ${supplierId} — styles:${massageStyles.length} traditions:${traditions.length} serviceOfferings:${serviceOfferings.length}`);
    count++;
  }
  console.log(`\nDone. ${count} suppliers migrated.`);
  process.exit(0);
}

migrateSuppliers().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
