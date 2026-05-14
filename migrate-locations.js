const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const locations = JSON.parse(fs.readFileSync('./locations.json', 'utf8'));

async function batchWrite(writes) {
  const BATCH_SIZE = 499;
  for (let i = 0; i < writes.length; i += BATCH_SIZE) {
    const batch = db.batch();
    writes.slice(i, i + BATCH_SIZE).forEach(({ ref, data }) => {
      batch.set(ref, data);
    });
    await batch.commit();
    console.log(`Committed batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(writes.length / BATCH_SIZE)}`);
  }
}

function slugify(str) {
  return str.toLowerCase()
    .replace(/\//g, '-')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .trim();
}

async function migrate() {
  console.log('Starting migration...');

  const provinceWrites = [];
  const townWrites = [];
  const suburbWrites = [];
  const townIdMap = {};

  for (const province of locations.provinces) {
    const provinceId = slugify(province.name);
    const provinceRef = db.collection('locations_provinces').doc(provinceId);
    provinceWrites.push({
      ref: provinceRef,
      data: {
        name: province.name,
        provinceId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });

    const towns = province.towns || province.areas || [];
    for (const town of towns) {
      const townRef = db.collection('locations_towns').doc();
      const townDocId = townRef.id;
      const mapKey = `${province.name}__${town.name}`;
      townIdMap[mapKey] = { id: townDocId };

      townWrites.push({
        ref: townRef,
        data: {
          name: town.name,
          townId: townDocId,
          provinceId,
          provinceName: province.name,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        }
      });

      for (const suburb of (town.suburbs || [])) {
        const suburbRef = db.collection('locations_suburbs').doc();
        suburbWrites.push({
          ref: suburbRef,
          data: {
            name: suburb,
            townId: townDocId,
            townName: town.name,
            provinceId,
            provinceName: province.name,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          }
        });
      }
    }
  }

  console.log(`Writing ${provinceWrites.length} provinces...`);
  await batchWrite(provinceWrites);

  console.log(`Writing ${townWrites.length} towns...`);
  await batchWrite(townWrites);

  console.log(`Writing ${suburbWrites.length} suburbs...`);
  await batchWrite(suburbWrites);

  console.log('Migrating areas to locations_areas...');
  const areasSnap = await db.collection('areas').get();
  const areaWrites = [];
  const areaDeletes = [];

  for (const areaDoc of areasSnap.docs) {
    const a = areaDoc.data();
    const mapKey = `${a.province}__${a.town}`;
    const townInfo = townIdMap[mapKey];
    const newAreaRef = db.collection('locations_areas').doc();
    areaWrites.push({
      ref: newAreaRef,
      data: {
        areaName: a.areaName,
        provinceId: slugify(a.province),
        provinceName: a.province,
        townId: townInfo ? townInfo.id : null,
        townName: a.town,
        suburbs: a.suburbs || [],
        createdAt: a.createdAt || admin.firestore.FieldValue.serverTimestamp()
      }
    });
    areaDeletes.push(areaDoc.ref);
  }

  if (areaWrites.length) {
    await batchWrite(areaWrites);
    const deleteBatch = db.batch();
    areaDeletes.forEach(ref => deleteBatch.delete(ref));
    await deleteBatch.commit();
    console.log(`Migrated ${areaWrites.length} areas to locations_areas, old areas deleted`);
  } else {
    console.log('No existing areas to migrate');
  }

  console.log('--- Migration complete ---');
  console.log(`Provinces: ${provinceWrites.length}`);
  console.log(`Towns: ${townWrites.length}`);
  console.log(`Suburbs: ${suburbWrites.length}`);
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
