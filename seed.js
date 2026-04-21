/**
 * seed.js — Populate Firestore with 45 seed suppliers for testing.
 *
 * Setup (once):
 *   npm install firebase-admin
 *
 * Run:
 *   node seed.js
 *
 * Auth: uses service account from serviceAccount.json
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

const TEST_PHONE = '0800000001';

function wh(fromHr, toHr, satAvail = true, sunAvail = false) {
  const day = (avail, f, t) => ({ available: avail, from: avail ? f : null, to: avail ? t : null });
  return {
    monday:    day(true,      fromHr, toHr),
    tuesday:   day(true,      fromHr, toHr),
    wednesday: day(true,      fromHr, toHr),
    thursday:  day(true,      fromHr, toHr),
    friday:    day(true,      fromHr, toHr),
    saturday:  day(satAvail,  fromHr, satAvail ? Math.min(toHr, 14) : null),
    sunday:    day(sunAvail,  fromHr, sunAvail ? Math.min(toHr, 13) : null),
  };
}

function indiv(o) {
  return {
    supplierType:       'individual',
    classification:     o.classification || 'massage',
    displayMassageType: o.displayMassageType,
    firstName:          o.firstName,
    lastName:           o.lastName,
    displayName:        `${o.firstName} ${o.lastName}`,
    gender:             o.gender,
    cellNumber:         o.phone,
    whatsappNumber:     o.phone,
    email:              `${o.firstName.toLowerCase()}.${o.lastName.toLowerCase().replace(/[\s']/g,'')}@gmail.com`,
    suburb:             o.suburb,
    province:           o.province,
    area:               o.area,
    addressLine1:       o.address,
    gpsLat:             o.lat,
    gpsLng:             o.lng,
    massageTypes:       o.massageTypes,
    services:           o.services || ['Full Body', 'Back & Neck'],
    weeklyHours:        o.weeklyHours || wh(9, 17),
    status:             'active',
    lastUpdated:        Timestamp.now(),
    mobileAvailable:    o.mobile ?? false,
    showerFacilities:   o.shower ?? false,
    parkingAvailable:   o.parking ?? true,
    genderServed:       o.genderServed || 'both',
  };
}

function spa(o) {
  return {
    supplierType:       'spa',
    classification:     o.classification || 'massage',
    displayMassageType: o.displayMassageType,
    firstName:          '',
    lastName:           '',
    displayName:        o.displayName,
    cellNumber:         o.phone,
    whatsappNumber:     o.phone,
    email:              `info@${o.displayName.toLowerCase().replace(/[\s&]/g, '-')}.co.za`,
    suburb:             o.suburb,
    province:           o.province,
    area:               o.area,
    addressLine1:       o.address,
    gpsLat:             o.lat,
    gpsLng:             o.lng,
    massageTypes:       o.massageTypes,
    services:           o.services || ['Full Body', 'Back & Neck', 'Foot Massage'],
    weeklyHours:        o.weeklyHours || wh(9, 18, true, false),
    status:             'active',
    lastUpdated:        Timestamp.now(),
    mobileAvailable:    false,
    showerFacilities:   true,
    parkingAvailable:   o.parking ?? true,
    genderServed:       o.genderServed || 'both',
  };
}

/* ──────────────────────────────────────────────────────────────
   SUPPLIERS — 45 records total
   Gauteng: 36 (80%)  |  Other provinces: 9 (20%)
   ────────────────────────────────────────────────────────────── */

const suppliers = [

  /* ── EXISTING 10 INDIVIDUALS ─────────────────────────────── */

  // 1 — Sandton, Gauteng
  indiv({
    firstName: 'Zanele', lastName: 'Dlamini', gender: 'female',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Hot Stone'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Sandton',
    address: '12 Rivonia Rd, Sandton',
    lat: -26.1091, lng: 28.0563,
    phone: '0721234001',
    weeklyHours: wh(9, 18),
  }),

  // 2 — Fourways, Gauteng
  indiv({
    firstName: 'Thabo', lastName: 'Naidoo', gender: 'male',
    displayMassageType: 'Sport', massageTypes: ['Sports', 'Deep Tissue'],
    classification: 'massage',
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Fourways',
    address: '3 Witkoppen Rd, Fourways',
    lat: -26.0218, lng: 28.0135,
    phone: '0731234002',
    weeklyHours: wh(8, 17),
  }),

  // 3 — Bryanston, Gauteng — TEST PHONE #1
  indiv({
    firstName: 'Annika', lastName: 'van der Berg', gender: 'female',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Deep Tissue', 'Hot Stone'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Bryanston',
    address: '56 Ballyclare Dr, Bryanston',
    lat: -26.0544, lng: 28.0209,
    phone: TEST_PHONE,
    weeklyHours: wh(9, 17),
  }),

  // 4 — Rosebank, Gauteng
  indiv({
    firstName: 'Jacques', lastName: 'Patel', gender: 'male',
    displayMassageType: 'Reiki', massageTypes: ['Reflexology', 'Thai'],
    classification: 'holistic',
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Rosebank',
    address: '24 Bath Ave, Rosebank',
    lat: -26.1475, lng: 28.0448,
    phone: '0741234004',
    weeklyHours: wh(10, 18, false),
  }),

  // 5 — Morningside, Gauteng
  indiv({
    firstName: 'Priya', lastName: 'Dube', gender: 'female',
    displayMassageType: 'Chinese', massageTypes: ['Thai', 'Swedish'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Morningside',
    address: '33 Rivonia Rd, Morningside',
    lat: -26.0901, lng: 28.0579,
    phone: '0761234005',
    weeklyHours: wh(9, 17),
  }),

  // 6 — Midrand, Gauteng
  indiv({
    firstName: 'Fatima', lastName: 'Mitchell', gender: 'female',
    displayMassageType: 'Indian', massageTypes: ['Swedish', 'Thai'],
    classification: 'holistic',
    province: 'gauteng', area: 'midrand', suburb: 'Midrand',
    address: '10 Allandale Rd, Midrand',
    lat: -25.9981, lng: 28.1277,
    phone: '0611234006',
    weeklyHours: wh(9, 18),
  }),

  // 7 — Centurion, Gauteng
  indiv({
    firstName: 'David', lastName: 'Mokoena', gender: 'male',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Deep Tissue'],
    province: 'gauteng', area: 'centurion', suburb: 'Centurion',
    address: '99 Centurion Ln, Centurion',
    lat: -25.8560, lng: 28.1884,
    phone: '0721234007',
    weeklyHours: wh(8, 17),
  }),

  // 8 — Sea Point, Western Cape
  indiv({
    firstName: 'Nomsa', lastName: 'du Toit', gender: 'female',
    displayMassageType: 'Sport', massageTypes: ['Sports', 'Deep Tissue'],
    province: 'western-cape', area: 'cape-town-green-point', suburb: 'Sea Point',
    address: '40 Main Rd, Sea Point',
    lat: -33.9228, lng: 18.3861,
    phone: '0731234008',
    weeklyHours: wh(9, 17),
  }),

  // 9 — Green Point, Western Cape
  indiv({
    firstName: 'Sipho', lastName: 'Nkosi', gender: 'male',
    displayMassageType: 'Reiki', massageTypes: ['Reflexology', 'Thai'],
    classification: 'holistic',
    province: 'western-cape', area: 'cape-town-green-point', suburb: 'Green Point',
    address: '15 Main Rd, Green Point',
    lat: -33.9048, lng: 18.4083,
    phone: '0741234009',
    weeklyHours: wh(10, 18, false),
  }),

  // 10 — Claremont, Western Cape
  indiv({
    firstName: 'Luca', lastName: 'Botha', gender: 'male',
    displayMassageType: 'Adult', massageTypes: ['Swedish', 'Deep Tissue'],
    classification: 'adult',
    province: 'western-cape', area: 'cape-town-southern-suburbs-claremont', suburb: 'Claremont',
    address: '5 Protea Rd, Claremont',
    lat: -33.9851, lng: 18.4700,
    phone: '0611234010',
    weeklyHours: wh(11, 20),
  }),

  /* ── EXISTING 5 SPAS ─────────────────────────────────────── */

  // 11 — Midrand, Gauteng — TEST PHONE #2
  spa({
    displayName: 'Serenity Spa',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Hot Stone', 'Deep Tissue'],
    province: 'gauteng', area: 'midrand', suburb: 'Midrand',
    address: '45 New Rd, Midrand',
    lat: -25.9965, lng: 28.1291,
    phone: TEST_PHONE,
    weeklyHours: wh(9, 18, true, true),
  }),

  // 12 — Centurion, Gauteng
  spa({
    displayName: 'The Healing Space',
    displayMassageType: 'Indian', massageTypes: ['Thai', 'Swedish', 'Hot Stone'],
    classification: 'holistic',
    province: 'gauteng', area: 'centurion', suburb: 'Centurion',
    address: '6 Jean Ave, Centurion',
    lat: -25.8541, lng: 28.1901,
    phone: '0721234012',
    weeklyHours: wh(9, 18),
  }),

  // 13 — Sea Point, Western Cape
  spa({
    displayName: 'Lotus Touch',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Hot Stone', 'Thai', 'Deep Tissue'],
    province: 'western-cape', area: 'cape-town-green-point', suburb: 'Sea Point',
    address: '18 Arthur Rd, Sea Point',
    lat: -33.9215, lng: 18.3849,
    phone: '0731234013',
    weeklyHours: wh(9, 18, true, true),
  }),

  // 14 — Green Point, Western Cape
  spa({
    displayName: 'Azure Wellness',
    displayMassageType: 'Reiki', massageTypes: ['Reflexology', 'Thai', 'Swedish'],
    classification: 'holistic',
    province: 'western-cape', area: 'cape-town-green-point', suburb: 'Green Point',
    address: '3 Somerset Rd, Green Point',
    lat: -33.9035, lng: 18.4071,
    phone: '0741234014',
    weeklyHours: wh(9, 17),
  }),

  // 15 — Claremont, Western Cape
  spa({
    displayName: 'Ubuntu Body & Soul',
    displayMassageType: 'Chinese', massageTypes: ['Thai', 'Reflexology', 'Hot Stone'],
    province: 'western-cape', area: 'cape-town-southern-suburbs-claremont', suburb: 'Claremont',
    address: '30 Imam Haron Rd, Claremont',
    lat: -33.9840, lng: 18.4689,
    phone: '0611234015',
    weeklyHours: wh(9, 17),
  }),

  /* ── NEW 20 INDIVIDUALS ───────────────────────────────────── */

  // 16 — Randburg, Gauteng — TEST PHONE #3
  indiv({
    firstName: 'Sarah', lastName: 'Mahlangu', gender: 'female',
    displayMassageType: 'Swedish', massageTypes: ['Swedish', 'Hot Stone'],
    province: 'gauteng', area: 'west-rand-randburg', suburb: 'Randburg',
    address: '12 Jan Smuts Ave, Randburg',
    lat: -26.0938, lng: 27.9975,
    phone: TEST_PHONE,
    weeklyHours: wh(9, 17),
  }),

  // 17 — Northriding, Gauteng
  indiv({
    firstName: 'Ryan', lastName: 'Petersen', gender: 'male',
    displayMassageType: 'Deep Tissue', massageTypes: ['Deep Tissue', 'Sports'],
    province: 'gauteng', area: 'west-rand-randburg', suburb: 'Northriding',
    address: '5 Roan Cres, Northriding',
    lat: -26.0558, lng: 27.9836,
    phone: '0721234017',
    weeklyHours: wh(8, 17),
  }),

  // 18 — Soweto, Gauteng
  indiv({
    firstName: 'Lerato', lastName: 'Khumalo', gender: 'female',
    displayMassageType: 'Hot Stone', massageTypes: ['Hot Stone', 'Swedish'],
    province: 'gauteng', area: 'soweto-west', suburb: 'Soweto',
    address: '22 Vilakazi St, Soweto',
    lat: -26.2681, lng: 27.8625,
    phone: '0731234018',
    weeklyHours: wh(9, 17),
    mobile: true,
  }),

  // 19 — Roodepoort, Gauteng
  indiv({
    firstName: 'Chloé', lastName: 'Adams', gender: 'female',
    displayMassageType: 'Thai', massageTypes: ['Thai', 'Swedish', 'Reflexology'],
    province: 'gauteng', area: 'soweto-west', suburb: 'Roodepoort',
    address: '8 Ontdekkers Rd, Roodepoort',
    lat: -26.1633, lng: 27.8791,
    phone: '0741234019',
    weeklyHours: wh(10, 18),
  }),

  // 20 — Arcadia, Pretoria, Gauteng
  indiv({
    firstName: 'Jacques', lastName: 'du Toit', gender: 'male',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Deep Tissue'],
    province: 'gauteng', area: 'pretoria-central', suburb: 'Arcadia',
    address: '44 Park St, Arcadia',
    lat: -25.7468, lng: 28.1887,
    phone: '0611234020',
    weeklyHours: wh(9, 17),
  }),

  // 21 — Hatfield, Pretoria East, Gauteng — TEST PHONE #4
  indiv({
    firstName: 'Nomsa', lastName: 'Zulu', gender: 'female',
    displayMassageType: 'Reflexology', massageTypes: ['Reflexology', 'Thai', 'Hot Stone'],
    classification: 'holistic',
    province: 'gauteng', area: 'pretoria-east', suburb: 'Hatfield',
    address: '7 Burnett St, Hatfield',
    lat: -25.7529, lng: 28.2341,
    phone: TEST_PHONE,
    weeklyHours: wh(9, 17),
  }),

  // 22 — Halfway House, Midrand, Gauteng
  indiv({
    firstName: 'Aisha', lastName: 'Naidoo', gender: 'female',
    displayMassageType: 'Thai', massageTypes: ['Thai', 'Hot Stone', 'Swedish'],
    province: 'gauteng', area: 'midrand', suburb: 'Halfway House',
    address: '18 New Rd, Halfway House',
    lat: -25.9889, lng: 28.1351,
    phone: '0721234022',
    weeklyHours: wh(9, 18),
  }),

  // 23 — Fourways, Gauteng
  indiv({
    firstName: 'Thabo', lastName: 'Botha', gender: 'male',
    displayMassageType: 'Swedish', massageTypes: ['Swedish', 'Sports'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Fourways',
    address: '88 Fourways Blvd, Fourways',
    lat: -26.0231, lng: 28.0108,
    phone: '0731234023',
    weeklyHours: wh(8, 16),
  }),

  // 24 — Bryanston, Gauteng
  indiv({
    firstName: 'Priya', lastName: 'Patel', gender: 'female',
    displayMassageType: 'Deep Tissue', massageTypes: ['Deep Tissue', 'Hot Stone'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Bryanston',
    address: '14 Peter Place, Bryanston',
    lat: -26.0531, lng: 28.0224,
    phone: '0741234024',
    weeklyHours: wh(9, 17),
  }),

  // 25 — Morningside, Gauteng
  indiv({
    firstName: 'Sipho', lastName: 'Mitchell', gender: 'male',
    displayMassageType: 'Hot Stone', massageTypes: ['Hot Stone', 'Deep Tissue', 'Swedish'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Morningside',
    address: '7 Benmore Rd, Morningside',
    lat: -26.0888, lng: 28.0591,
    phone: '0611234025',
    weeklyHours: wh(10, 19),
  }),

  // 26 — Centurion, Gauteng
  indiv({
    firstName: 'Zanele', lastName: 'Mahlangu', gender: 'female',
    displayMassageType: 'Thai', massageTypes: ['Thai', 'Reflexology'],
    province: 'gauteng', area: 'centurion', suburb: 'Centurion',
    address: '27 West Ave, Centurion',
    lat: -25.8569, lng: 28.1879,
    phone: '0721234026',
    weeklyHours: wh(9, 17),
  }),

  // 27 — Randburg, Gauteng
  indiv({
    firstName: 'David', lastName: 'Petersen', gender: 'male',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Sports'],
    province: 'gauteng', area: 'west-rand-randburg', suburb: 'Randburg',
    address: '3 Ferndale Rd, Randburg',
    lat: -26.0951, lng: 27.9961,
    phone: '0731234027',
    weeklyHours: wh(9, 17),
  }),

  // 28 — Roodepoort, Gauteng
  indiv({
    firstName: 'Fatima', lastName: 'du Toit', gender: 'female',
    displayMassageType: 'Sport', massageTypes: ['Sports', 'Deep Tissue'],
    province: 'gauteng', area: 'soweto-west', suburb: 'Roodepoort',
    address: '20 Hendrik Potgieter Rd, Roodepoort',
    lat: -26.1619, lng: 27.8777,
    phone: '0741234028',
    weeklyHours: wh(8, 17),
  }),

  // 29 — Montana, Pretoria North, Gauteng
  indiv({
    firstName: 'Luca', lastName: 'Khumalo', gender: 'male',
    displayMassageType: 'Reiki', massageTypes: ['Reflexology', 'Thai'],
    classification: 'holistic',
    province: 'gauteng', area: 'pretoria-north', suburb: 'Montana',
    address: '11 Montana Blvd, Montana',
    lat: -25.6768, lng: 28.2024,
    phone: '0611234029',
    weeklyHours: wh(9, 17),
  }),

  // 30 — Lynnwood, Pretoria East, Gauteng
  indiv({
    firstName: 'Annika', lastName: 'Dlamini', gender: 'female',
    displayMassageType: 'Indian', massageTypes: ['Swedish', 'Hot Stone', 'Thai'],
    classification: 'holistic',
    province: 'gauteng', area: 'pretoria-east', suburb: 'Lynnwood',
    address: '9 Lynnwood Rd, Lynnwood',
    lat: -25.7718, lng: 28.2751,
    phone: '0721234030',
    weeklyHours: wh(9, 18),
  }),

  // 31 — Sandton, Gauteng
  indiv({
    firstName: 'Lerato', lastName: 'Nkosi', gender: 'female',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Deep Tissue'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Sandton',
    address: '45 Sandton Dr, Sandton',
    lat: -26.1065, lng: 28.0578,
    phone: '0731234031',
    weeklyHours: wh(9, 17),
    mobile: true,
  }),

  // 32 — Vorna Valley, Midrand, Gauteng
  indiv({
    firstName: 'Luca', lastName: 'Adams', gender: 'male',
    displayMassageType: 'Adult', massageTypes: ['Swedish', 'Deep Tissue'],
    classification: 'adult',
    province: 'gauteng', area: 'midrand', suburb: 'Vorna Valley',
    address: '2 Grand Central Blvd, Vorna Valley',
    lat: -25.9959, lng: 28.1309,
    phone: '0611234032',
    weeklyHours: wh(11, 20),
  }),

  // 33 — Umhlanga, KwaZulu-Natal
  indiv({
    firstName: 'Zanele', lastName: 'Zulu', gender: 'female',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Hot Stone'],
    province: 'kwazulu-natal', area: 'umhlanga-ballito', suburb: 'Umhlanga',
    address: '15 Umhlanga Rocks Dr, Umhlanga',
    lat: -29.7274, lng: 31.0768,
    phone: '0721234033',
    weeklyHours: wh(9, 17),
  }),

  // 34 — Durban North, KwaZulu-Natal
  indiv({
    firstName: 'Priya', lastName: 'Maharaj', gender: 'female',
    displayMassageType: 'Sport', massageTypes: ['Sports', 'Deep Tissue'],
    province: 'kwazulu-natal', area: 'durban-north', suburb: 'Durban North',
    address: '8 Hawaan Forest Dr, Durban North',
    lat: -29.8018, lng: 31.0289,
    phone: '0731234034',
    weeklyHours: wh(9, 17),
  }),

  // 35 — Bloubergstrand, Western Cape
  indiv({
    firstName: 'Thabo', lastName: 'Dube', gender: 'male',
    displayMassageType: 'Swedish', massageTypes: ['Swedish', 'Deep Tissue'],
    province: 'western-cape', area: 'bloubergstrand-table-view', suburb: 'Bloubergstrand',
    address: '60 Otto du Plessis Dr, Bloubergstrand',
    lat: -33.8024, lng: 18.4714,
    phone: '0741234035',
    weeklyHours: wh(9, 17),
  }),

  /* ── NEW 10 SPAS (all Gauteng) ───────────────────────────── */

  // 36 — Sandton, Gauteng — TEST PHONE #5
  spa({
    displayName: 'Harmony Wellness',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Hot Stone', 'Deep Tissue'],
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Sandton',
    address: '7 Alice Ln, Sandton',
    lat: -26.1082, lng: 28.0551,
    phone: TEST_PHONE,
    weeklyHours: wh(9, 18, true, true),
  }),

  // 37 — Fourways, Gauteng
  spa({
    displayName: 'Zen Garden Spa',
    displayMassageType: 'Indian', massageTypes: ['Thai', 'Swedish', 'Hot Stone'],
    classification: 'holistic',
    province: 'gauteng', area: 'sandton-north-johannesburg', suburb: 'Fourways',
    address: '21 Monte Carlo Cres, Fourways',
    lat: -26.0219, lng: 28.0131,
    phone: '0721234037',
    weeklyHours: wh(9, 18),
  }),

  // 38 — Randburg, Gauteng
  spa({
    displayName: 'The Body Studio',
    displayMassageType: 'Chinese', massageTypes: ['Thai', 'Reflexology', 'Swedish'],
    province: 'gauteng', area: 'west-rand-randburg', suburb: 'Randburg',
    address: '5 Bram Fischer Dr, Randburg',
    lat: -26.0944, lng: 27.9981,
    phone: '0731234038',
    weeklyHours: wh(9, 18),
  }),

  // 39 — Roodepoort, Gauteng
  spa({
    displayName: 'Soul Revival Spa',
    displayMassageType: 'Deep Tissue', massageTypes: ['Deep Tissue', 'Sports', 'Swedish'],
    province: 'gauteng', area: 'soweto-west', suburb: 'Roodepoort',
    address: '33 Christiaan De Wet Rd, Roodepoort',
    lat: -26.1638, lng: 27.8769,
    phone: '0741234039',
    weeklyHours: wh(9, 17),
  }),

  // 40 — Soweto, Gauteng
  spa({
    displayName: 'Tranquil Touch',
    displayMassageType: 'Swedish', massageTypes: ['Swedish', 'Hot Stone', 'Thai'],
    province: 'gauteng', area: 'soweto-west', suburb: 'Soweto',
    address: '14 Khumalo St, Soweto',
    lat: -26.2669, lng: 27.8631,
    phone: '0611234040',
    weeklyHours: wh(9, 17),
  }),

  // 41 — Arcadia, Pretoria, Gauteng — TEST PHONE #6
  spa({
    displayName: 'Prestige Wellness',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Thai'],
    province: 'gauteng', area: 'pretoria-central', suburb: 'Arcadia',
    address: '22 Church St, Arcadia',
    lat: -25.7453, lng: 28.1894,
    phone: TEST_PHONE,
    weeklyHours: wh(9, 18, true, true),
  }),

  // 42 — Hatfield, Pretoria East, Gauteng
  spa({
    displayName: 'Restore & Renew Spa',
    displayMassageType: 'Hot Stone', massageTypes: ['Hot Stone', 'Swedish', 'Deep Tissue'],
    province: 'gauteng', area: 'pretoria-east', suburb: 'Hatfield',
    address: '6 Prospect St, Hatfield',
    lat: -25.7541, lng: 28.2328,
    phone: '0721234042',
    weeklyHours: wh(9, 18),
  }),

  // 43 — Midrand, Gauteng
  spa({
    displayName: 'Pure Bliss Spa',
    displayMassageType: 'Reflexology', massageTypes: ['Reflexology', 'Hot Stone', 'Swedish'],
    classification: 'holistic',
    province: 'gauteng', area: 'midrand', suburb: 'Midrand',
    address: '3 Waterfall Dr, Midrand',
    lat: -25.9977, lng: 28.1272,
    phone: '0731234043',
    weeklyHours: wh(9, 18, true, false),
  }),

  // 44 — Wierda Park, Centurion, Gauteng
  spa({
    displayName: 'Glow Spa & Wellness',
    displayMassageType: 'Thai', massageTypes: ['Thai', 'Swedish', 'Hot Stone'],
    province: 'gauteng', area: 'centurion', suburb: 'Wierda Park',
    address: '9 Lenchen Ave, Wierda Park',
    lat: -25.8561, lng: 28.1901,
    phone: '0741234044',
    weeklyHours: wh(9, 18),
  }),

  // 45 — Lynnwood, Pretoria East, Gauteng
  spa({
    displayName: 'Nirvana Spa',
    displayMassageType: 'Massage', massageTypes: ['Swedish', 'Deep Tissue', 'Thai', 'Reflexology'],
    province: 'gauteng', area: 'pretoria-east', suburb: 'Lynnwood',
    address: '18 Lynnwood Rd, Lynnwood',
    lat: -25.7709, lng: 28.2759,
    phone: '0611234045',
    weeklyHours: wh(9, 18, true, false),
  }),

];

/* ── Write to Firestore ──────────────────────────────────────── */

async function seed() {
  const gauteng    = suppliers.filter(s => s.province === 'gauteng').length;
  const nonGauteng = suppliers.filter(s => s.province !== 'gauteng').length;
  const indivCount = suppliers.filter(s => s.supplierType === 'individual').length;
  const spaCount   = suppliers.filter(s => s.supplierType === 'spa').length;
  const testPhones = suppliers.filter(s => s.cellNumber === TEST_PHONE).length;

  console.log(`Seeding ${suppliers.length} suppliers into Firestore...`);
  console.log(`  ${gauteng} Gauteng (${Math.round(gauteng/suppliers.length*100)}%), ${nonGauteng} other provinces`);
  console.log(`  ${indivCount} individuals, ${spaCount} spas`);
  console.log(`  ${testPhones} records with test phone ${TEST_PHONE}`);

  const BATCH_SIZE = 500;
  for (let i = 0; i < suppliers.length; i += BATCH_SIZE) {
    const batch = db.batch();
    suppliers.slice(i, i + BATCH_SIZE).forEach((s, offset) => {
      const docId = `seed_${String(i + offset + 1).padStart(3, '0')}`;
      batch.set(db.collection('suppliers').doc(docId), s);
    });
    await batch.commit();
  }

  console.log('Done!');
}

seed().catch(err => { console.error(err); process.exit(1); });
