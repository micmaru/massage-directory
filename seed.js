/**
 * seed.js — Populate Firestore with 15 fake therapists for testing.
 *
 * Setup (once):
 *   npm install firebase-admin
 *
 * Run:
 *   node seed.js
 *
 * Auth: uses Application Default Credentials from `firebase login` / gcloud.
 *   If needed first: firebase login  (or: gcloud auth application-default login)
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const path = require('path');

initializeApp({
  credential: cert(path.join(__dirname, 'serviceAccount.json')),
  projectId:  'massage-directory-57e19',
});

const db = getFirestore();
db.settings({ ignoreUndefinedProperties: true });

/* ── Location data ───────────────────────────────────────────── */

const LOCATIONS = [
  {
    suburb: 'Sandton',        province: 'gauteng',      area: 'sandton-north-johannesburg',
    gpsLat: -26.1074,         gpsLng:  28.0567,
    addressTemplates: ['12 Rivonia Rd', '45 Sandton Dr', '7 Alice Ln'],
  },
  {
    suburb: 'Fourways',       province: 'gauteng',      area: 'sandton-north-johannesburg',
    gpsLat: -26.0226,         gpsLng:  28.0122,
    addressTemplates: ['3 Witkoppen Rd', '88 Fourways Blvd', '21 Monte Carlo Cres'],
  },
  {
    suburb: 'Bryanston',      province: 'gauteng',      area: 'sandton-north-johannesburg',
    gpsLat: -26.0539,         gpsLng:  28.0217,
    addressTemplates: ['56 Ballyclare Dr', '14 Peter Place', '9 Bryanston Dr'],
  },
  {
    suburb: 'Rosebank',       province: 'gauteng',      area: 'sandton-north-johannesburg',
    gpsLat: -26.1480,         gpsLng:  28.0440,
    addressTemplates: ['24 Bath Ave', '5 Cradock Ave', '11 Oxford Rd'],
  },
  {
    suburb: 'Morningside',    province: 'gauteng',      area: 'sandton-north-johannesburg',
    gpsLat: -26.0895,         gpsLng:  28.0584,
    addressTemplates: ['33 Rivonia Rd', '7 Benmore Rd', '18 Karen St'],
  },
  {
    suburb: 'Midrand',        province: 'gauteng',      area: 'midrand',
    gpsLat: -25.9972,         gpsLng:  28.1283,
    addressTemplates: ['10 Allandale Rd', '45 New Rd', '2 Grand Central Blvd'],
  },
  {
    suburb: 'Centurion',      province: 'gauteng',      area: 'centurion',
    gpsLat: -25.8553,         gpsLng:  28.1892,
    addressTemplates: ['99 Centurion Ln', '6 Jean Ave', '27 West Ave'],
  },
  {
    suburb: 'Sea Point',      province: 'western-cape', area: 'cape-town-green-point',
    gpsLat: -33.9221,         gpsLng:  18.3856,
    addressTemplates: ['40 Main Rd', '18 Arthur Rd', '7 Regent Rd'],
  },
  {
    suburb: 'Green Point',    province: 'western-cape', area: 'cape-town-green-point',
    gpsLat: -33.9042,         gpsLng:  18.4078,
    addressTemplates: ['15 Main Rd', '3 Somerset Rd', '22 De Smidt St'],
  },
  {
    suburb: 'Claremont',      province: 'western-cape', area: 'cape-town-southern-suburbs-claremont',
    gpsLat: -33.9847,         gpsLng:  18.4696,
    addressTemplates: ['5 Protea Rd', '30 Imam Haron Rd', '12 Vineyard Rd'],
  },
  {
    suburb: 'Constantia',     province: 'western-cape', area: 'cape-town-constantia',
    gpsLat: -34.0295,         gpsLng:  18.4396,
    addressTemplates: ['8 Constantia Rd', '44 Ladies Mile Rd', '2 Spaanschemat River Rd'],
  },
  {
    suburb: 'Bloubergstrand', province: 'western-cape', area: 'bloubergstrand-table-view',
    gpsLat: -33.8019,         gpsLng:  18.4709,
    addressTemplates: ['60 Otto du Plessis Dr', '15 Marine Dr', '9 Dune St'],
  },
];

/* ── Name pools ──────────────────────────────────────────────── */

const FEMALE_FIRST = ['Zanele', 'Priya', 'Annika', 'Fatima', 'Nomsa', 'Sarah', 'Lerato', 'Chloé', 'Aisha'];
const MALE_FIRST   = ['Thabo', 'Jacques', 'David', 'Sipho', 'Luca', 'Ryan'];
const LAST_NAMES   = [
  'Dlamini', 'Naidoo', 'van der Berg', 'Patel', 'Dube', 'Mitchell',
  'Mokoena', 'du Toit', 'Nkosi', 'Botha', 'Mahlangu', 'Petersen',
  'Khumalo', 'Adams', 'Zulu',
];

const SPA_NAMES = [
  'Serenity Spa', 'The Healing Space', 'Lotus Touch', 'Azure Wellness',
  'Ubuntu Body & Soul',
];

/* ── Service pools ───────────────────────────────────────────── */

const ALL_SERVICES     = ['Full Body', 'Back & Neck', 'Facial', 'Foot Massage', 'Head Massage'];
const ALL_MASSAGE_TYPES = ['Swedish', 'Deep Tissue', 'Hot Stone', 'Thai', 'Sports', 'Reflexology'];

/* ── Helpers ─────────────────────────────────────────────────── */

function pick(arr)        { return arr[Math.floor(Math.random() * arr.length)]; }
function pickN(arr, n)    { return [...arr].sort(() => 0.5 - Math.random()).slice(0, n); }
function bool()           { return Math.random() > 0.5; }

function saCell() {
  const prefix = pick(['06', '07', '08']);
  const rest = String(Math.floor(10000000 + Math.random() * 89999999));
  return `${prefix}${rest}`;
}

function availFrom() {
  const hrs = pick([7, 8, 9, 10]);
  return `${String(hrs).padStart(2, '0')}:00`;
}

function availTo() {
  const hrs = pick([16, 17, 18, 19, 20]);
  return `${String(hrs).padStart(2, '0')}:00`;
}

/* ── Build therapist records ─────────────────────────────────── */

const therapists = [];

// 10 individuals
const individualGenders = [
  'female','male','female','male','female',
  'female','male','female','male','male',
];
const individualClassifications = [
  'massage','massage','massage','holistic','massage',
  'holistic','massage','massage','holistic','adult',
];
const individualDisplayMassageTypes = [
  'Massage', 'Sport',   'Massage', 'Reiki',  'Chinese',
  'Indian',  'Massage', 'Sport',   'Reiki',  'Adult',
];

for (let i = 0; i < 10; i++) {
  const gender    = individualGenders[i];
  const firstName = gender === 'female' ? pick(FEMALE_FIRST) : pick(MALE_FIRST);
  const lastName  = pick(LAST_NAMES);
  const loc       = LOCATIONS[i % LOCATIONS.length];
  const addr      = pick(loc.addressTemplates);
  const svcCount  = 2 + Math.floor(Math.random() * 3);  // 2–4 services
  const mtCount   = 1 + Math.floor(Math.random() * 3);  // 1–3 massage types
  const cell      = saCell();

  therapists.push({
    supplierType:        'individual',
    classification:      individualClassifications[i],
    displayMassageType:  individualDisplayMassageTypes[i],
    firstName,
    lastName,
    displayName:         `${firstName} ${lastName}`,
    cellNumber:          cell,
    whatsappNumber:      cell,
    email:             `${firstName.toLowerCase().replace(/\s/g,'')}.${lastName.toLowerCase().replace(/[\s']/g,'')}@gmail.com`,
    suburb:            loc.suburb,
    province:          loc.province,
    area:              loc.area,
    addressLine1:      `${addr}, ${loc.suburb}`,
    gpsLat:            loc.gpsLat + (Math.random() - 0.5) * 0.006,
    gpsLng:            loc.gpsLng + (Math.random() - 0.5) * 0.006,
    services:          pickN(ALL_SERVICES, svcCount),
    massageTypes:      pickN(ALL_MASSAGE_TYPES, mtCount),
    status:            i < 8 ? 'active' : 'pending',
    lastUpdated:       Timestamp.now(),
    gender,
    mobileAvailable:   bool(),
    showerFacilities:  bool(),
    parkingAvailable:  bool(),
    availableFrom:     availFrom(),
    availableTo:       availTo(),
    genderServed:      pick(['ladies', 'gentlemen', 'both']),
  });
}

// 5 spas
const spaLocations = LOCATIONS.slice(5, 10);
const spaClassifications        = ['massage', 'holistic', 'massage', 'holistic', 'massage'];
const spaDisplayMassageTypes    = ['Massage', 'Indian',   'Massage', 'Reiki',    'Chinese'];

for (let i = 0; i < 5; i++) {
  const loc      = spaLocations[i % spaLocations.length];
  const addr     = pick(loc.addressTemplates);
  const spaName  = SPA_NAMES[i];
  const svcCount = 3 + Math.floor(Math.random() * 2);  // 3–4 services
  const mtCount  = 2 + Math.floor(Math.random() * 3);  // 2–4 massage types
  const cell     = saCell();

  therapists.push({
    supplierType:        'spa',
    classification:      spaClassifications[i],
    displayMassageType:  spaDisplayMassageTypes[i],
    firstName:           '',
    lastName:            '',
    displayName:         spaName,
    cellNumber:          cell,
    whatsappNumber:      cell,
    email:             `info@${spaName.toLowerCase().replace(/[\s&]/g,'-')}.co.za`,
    suburb:            loc.suburb,
    province:          loc.province,
    area:              loc.area,
    addressLine1:      `${addr}, ${loc.suburb}`,
    gpsLat:            loc.gpsLat + (Math.random() - 0.5) * 0.006,
    gpsLng:            loc.gpsLng + (Math.random() - 0.5) * 0.006,
    services:          pickN(ALL_SERVICES, svcCount),
    massageTypes:      pickN(ALL_MASSAGE_TYPES, mtCount),
    status:            i < 4 ? 'active' : 'pending',
    lastUpdated:       Timestamp.now(),
    gender:            'female',       // spas default to female staff
    mobileAvailable:   false,
    showerFacilities:  true,
    parkingAvailable:  bool(),
    availableFrom:     '09:00',
    availableTo:       '18:00',
    genderServed:      pick(['ladies', 'both']),
  });
}

/* ── Write to Firestore ──────────────────────────────────────── */

async function seed() {
  console.log(`Seeding ${therapists.length} suppliers into Firestore...`);
  const batch = db.batch();

  therapists.forEach((t) => {
    const ref = db.collection('suppliers').doc();
    batch.set(ref, t);
  });

  await batch.commit();

  const active  = therapists.filter(t => t.status === 'active').length;
  const pending = therapists.filter(t => t.status === 'pending').length;
  const indiv   = therapists.filter(t => t.supplierType === 'individual').length;
  const spas    = therapists.filter(t => t.supplierType === 'spa').length;

  console.log('Done!');
  console.log(`  ${active} active, ${pending} pending`);
  console.log(`  ${indiv} individuals, ${spas} spas`);
  console.log(`  Provinces: Gauteng + Western Cape`);
}

seed().catch((err) => { console.error(err); process.exit(1); });
