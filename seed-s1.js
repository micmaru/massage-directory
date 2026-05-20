'use strict';

const admin = require('firebase-admin');
const serviceAccount = require('./massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function batchDelete(snapshot) {
  if (snapshot.empty) return 0;
  const docs = snapshot.docs;
  const chunks = [];
  for (let i = 0; i < docs.length; i += 500) {
    chunks.push(docs.slice(i, i + 500));
  }
  for (const chunk of chunks) {
    const batch = db.batch();
    chunk.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  }
  return docs.length;
}

async function main() {

  // ================================================
  // STEP A — DELETE ALL SUPPLIER DOCUMENTS
  // ================================================
  console.log('\n--- STEP A: Deleting all supplier documents ---');
  const suppliersSnap = await db.collection('suppliers').get();
  const deletedSuppliers = await batchDelete(suppliersSnap);
  console.log(`Deleted ${deletedSuppliers} supplier documents`);

  // ================================================
  // STEP B — UPDATE SETTINGS/CONFIG
  // ================================================
  console.log('\n--- STEP B: Updating settings/config ---');
  await db.doc('settings/config').set(
    { counterIndividual: 0, counterSpa: 0 },
    { merge: true }
  );
  console.log('Settings/config counters initialised');

  // ================================================
  // STEP C — UPDATE OFFERINGS COLLECTION
  // ================================================
  console.log('\n--- STEP C: Updating offerings collection ---');

  // C1 — Delete all facilities documents
  const facilitiesSnap = await db.collection('offerings')
    .where('category', '==', 'facilities')
    .get();
  const deletedFacilities = await batchDelete(facilitiesSnap);
  console.log(`Deleted ${deletedFacilities} facilities documents`);

  // C2 — Delete all amenities documents
  const amenitiesSnap = await db.collection('offerings')
    .where('category', '==', 'amenities')
    .get();
  const deletedAmenities = await batchDelete(amenitiesSnap);
  console.log(`Deleted ${deletedAmenities} old amenity documents`);

  // C3 — Add Cupping if not already present
  const cuppingSnap = await db.collection('offerings')
    .where('category', '==', 'massageStyles')
    .where('name', '==', 'Cupping')
    .get();

  if (cuppingSnap.empty) {
    await db.collection('offerings').add({
      category: 'massageStyles',
      name: 'Cupping',
      description: 'A therapy using suction cups placed on the skin to release muscle tension, improve circulation and reduce pain. Popular as a standalone or add-on treatment.',
      launchActive: true,
      sortOrder: 50,
      visibleTo: ['both'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    console.log('Cupping added');
  } else {
    console.log('Cupping already exists — skipped');
  }

  // C4 — Seed 10 amenity documents
  const amenities = [
    {
      name: 'Parking',
      description: 'Off-street parking available for clients at the premises.',
      sortOrder: 1
    },
    {
      name: 'Shower',
      description: 'Shower facilities available for use before or after treatment.',
      sortOrder: 2
    },
    {
      name: 'Couples Room',
      description: 'Private room set up for two people to receive treatments simultaneously.',
      sortOrder: 3
    },
    {
      name: 'Air Conditioning',
      description: 'Air-conditioned treatment rooms for year-round comfort.',
      sortOrder: 4
    },
    {
      name: 'Wi-Fi',
      description: 'Free Wi-Fi available for clients in the waiting area.',
      sortOrder: 5
    },
    {
      name: 'Wheelchair Access',
      description: 'Premises are wheelchair accessible.',
      sortOrder: 6
    },
    {
      name: 'Baby Changing Facility',
      description: 'Baby changing facilities available on premises.',
      sortOrder: 7
    },
    {
      name: 'Waiting Area',
      description: 'Dedicated waiting area for clients before their appointment.',
      sortOrder: 8
    },
    {
      name: 'Refreshments',
      description: 'Complimentary refreshments such as water or tea provided to clients.',
      sortOrder: 9
    },
    {
      name: 'Health Bar',
      description: 'Health bar on premises offering juices, smoothies or wellness drinks.',
      sortOrder: 10
    }
  ];

  for (const amenity of amenities) {
    await db.collection('offerings').add({
      ...amenity,
      category: 'amenities',
      launchActive: true,
      visibleTo: ['both'],
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  console.log('10 amenity documents seeded');

  // ================================================
  // STEP D — SEED 25 INDIVIDUAL THERAPISTS
  // ================================================
  console.log('\n--- STEP D: Seeding 25 individual therapists ---');

  const activeExpiry = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
  );
  const expiredExpiry = admin.firestore.Timestamp.fromDate(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  );

  const ST = () => admin.firestore.FieldValue.serverTimestamp();

  const WH = {
    A: {
      monday:    { available: true,  from: 8, to: 17 },
      tuesday:   { available: true,  from: 8, to: 17 },
      wednesday: { available: true,  from: 8, to: 17 },
      thursday:  { available: true,  from: 8, to: 17 },
      friday:    { available: true,  from: 8, to: 17 },
      saturday:  { available: true,  from: 9, to: 13 },
      sunday:    { available: false, from: 0, to: 0  }
    },
    B: {
      monday:    { available: true,  from: 9, to: 18 },
      tuesday:   { available: true,  from: 9, to: 18 },
      wednesday: { available: true,  from: 9, to: 18 },
      thursday:  { available: true,  from: 9, to: 18 },
      friday:    { available: true,  from: 9, to: 18 },
      saturday:  { available: true,  from: 9, to: 14 },
      sunday:    { available: false, from: 0, to: 0  }
    },
    C: {
      monday:    { available: true,  from: 8, to: 17 },
      tuesday:   { available: true,  from: 8, to: 17 },
      wednesday: { available: true,  from: 8, to: 17 },
      thursday:  { available: true,  from: 8, to: 17 },
      friday:    { available: true,  from: 8, to: 16 },
      saturday:  { available: true,  from: 9, to: 13 },
      sunday:    { available: false, from: 0, to: 0  }
    },
    D: {
      monday:    { available: true,  from: 7, to: 16 },
      tuesday:   { available: true,  from: 7, to: 16 },
      wednesday: { available: true,  from: 7, to: 16 },
      thursday:  { available: true,  from: 7, to: 16 },
      friday:    { available: true,  from: 7, to: 16 },
      saturday:  { available: true,  from: 8, to: 13 },
      sunday:    { available: false, from: 0, to: 0  }
    },
    E: {
      monday:    { available: true, from: 9, to: 18 },
      tuesday:   { available: true, from: 9, to: 18 },
      wednesday: { available: true, from: 9, to: 18 },
      thursday:  { available: true, from: 9, to: 18 },
      friday:    { available: true, from: 9, to: 18 },
      saturday:  { available: true, from: 9, to: 17 },
      sunday:    { available: true, from: 10, to: 15 }
    },
    F: {
      monday:    { available: true, from: 8, to: 18 },
      tuesday:   { available: true, from: 8, to: 18 },
      wednesday: { available: true, from: 8, to: 18 },
      thursday:  { available: true, from: 8, to: 18 },
      friday:    { available: true, from: 8, to: 18 },
      saturday:  { available: true, from: 8, to: 16 },
      sunday:    { available: true, from: 10, to: 14 }
    },
    G: {
      monday:    { available: true,  from: 9, to: 18 },
      tuesday:   { available: true,  from: 9, to: 18 },
      wednesday: { available: true,  from: 9, to: 18 },
      thursday:  { available: true,  from: 9, to: 18 },
      friday:    { available: true,  from: 9, to: 18 },
      saturday:  { available: true,  from: 9, to: 17 },
      sunday:    { available: false, from: 0, to: 0  }
    },
    H: {
      monday:    { available: true, from: 9, to: 17 },
      tuesday:   { available: true, from: 9, to: 17 },
      wednesday: { available: true, from: 9, to: 17 },
      thursday:  { available: true, from: 9, to: 17 },
      friday:    { available: true, from: 9, to: 17 },
      saturday:  { available: true, from: 9, to: 17 },
      sunday:    { available: true, from: 10, to: 14 }
    }
  };

  const therapists = [
    {
      supplierType: 'individual', supplierNumber: 'T-0001',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0820001001', whatsappNumber: '0820001001', showWhatsapp: true,
      email: 'thandi.dlamini@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Thandi', lastName: 'Dlamini', displayName: 'Thandi Dlamini',
      gender: 'female', genderServed: 'both', experienceYears: '5+',
      province: 'gauteng', suburb: 'Sandton', area: '',
      addressLine1: '14 Sandton Drive, Sandton', addressVisible: false,
      gpsLat: -26.1076, gpsLng: 28.0567,
      aboutMe: 'Qualified massage therapist with over eight years of experience specialising in Swedish and deep tissue massage. I combine traditional healing techniques with modern therapeutic approaches to help clients achieve deep relaxation and pain relief.',
      aboutSpa: '', specialsText: '10% off first session for new clients.',
      qualifications: 'ITEC Diploma in Massage Therapy', associationMembership: 'MTASA',
      weeklyHours: WH.A, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call', 'Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0002',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0830001002', whatsappNumber: '0830001002', showWhatsapp: true,
      email: 'priya.naidoo@outlook.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Priya', lastName: 'Naidoo', displayName: 'Priya Naidoo',
      gender: 'female', genderServed: 'female', experienceYears: '3-5',
      province: 'gauteng', suburb: 'Centurion', area: '',
      addressLine1: '7 Clifton Avenue, Centurion', addressVisible: false,
      gpsLat: -25.8600, gpsLng: 28.1887,
      aboutMe: 'With a background in Ayurvedic healing and over five years of practice, I offer a deeply restorative massage experience tailored to each client\'s needs. My approach blends aromatherapy and hot stone techniques for a truly holistic treatment.',
      aboutSpa: '', specialsText: 'Book 3 sessions and get the 4th free.',
      qualifications: 'CIBTAC Certificate in Massage', associationMembership: 'AHPCSA',
      weeklyHours: WH.B, classification: ['Holistic'],
      massageStyles: ['Aromatherapy', 'Hot Stone', 'Swedish'], traditions: ['Ayurvedic'],
      treatments: ['Full Body', 'Legs & Feet', 'Back & Neck'], serviceOfferings: ['Couples Massage', 'Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0003',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0720001003', whatsappNumber: '0720001003', showWhatsapp: true,
      email: 'sarah.vdmerwe@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Sarah', lastName: 'van der Merwe', displayName: 'Sarah van der Merwe',
      gender: 'female', genderServed: 'both', experienceYears: '5+',
      province: 'gauteng', suburb: 'Randburg', area: '',
      addressLine1: '23 Hendrik Verwoerd Drive, Randburg', addressVisible: false,
      gpsLat: -26.0925, gpsLng: 27.9628,
      aboutMe: 'Practising massage therapist for over ten years, trained in Swedish, deep tissue and sports massage. I work from my private therapy room in Randburg and create personalised treatment plans for each client including athletes and office workers.',
      aboutSpa: '', specialsText: '',
      qualifications: 'City & Guilds Level 3 Diploma in Massage', associationMembership: 'None',
      weeklyHours: WH.C, classification: ['Therapeutic Massage'],
      massageStyles: ['Deep Tissue', 'Sports Massage', 'Trigger Point Therapy'], traditions: [],
      treatments: ['Full Body', 'Back & Neck', 'Legs & Feet'], serviceOfferings: ['Corporate / Workplace'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0004',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0840001004', whatsappNumber: '0840001004', showWhatsapp: true,
      email: 'nomsa.khumalo@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Nomsa', lastName: 'Khumalo', displayName: 'Nomsa Khumalo',
      gender: 'female', genderServed: 'female', experienceYears: '1-3',
      province: 'gauteng', suburb: 'Midrand', area: '',
      addressLine1: '5 New Road, Midrand', addressVisible: false,
      gpsLat: -25.9942, gpsLng: 28.1284,
      aboutMe: 'Certified holistic therapist offering Swedish massage, lymphatic drainage and reflexology from my home studio in Midrand. I believe in treating the whole person and take time to understand each client\'s needs before every session.',
      aboutSpa: '', specialsText: 'Loyalty card — buy 5 sessions, get 1 free.',
      qualifications: 'ITEC Diploma in Holistic Massage', associationMembership: 'SAAHIP',
      weeklyHours: WH.A, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Lymphatic Drainage'], traditions: ['Thai'],
      treatments: ['Full Body', 'Indian Head Massage'], serviceOfferings: ['Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0005',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0730001005', whatsappNumber: '0730001005', showWhatsapp: true,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Lerato', lastName: 'Molefe', displayName: 'Lerato Molefe',
      gender: 'female', genderServed: 'both', experienceYears: '3-5',
      province: 'gauteng', suburb: 'Boksburg', area: '',
      addressLine1: '18 Trichardt Road, Boksburg', addressVisible: false,
      gpsLat: -26.2143, gpsLng: 28.2614,
      aboutMe: 'Passionate massage therapist based in Boksburg with over three years of experience. I specialise in relaxation and sports massage and offer mobile services to clients who prefer treatments at home or in the workplace.',
      aboutSpa: '', specialsText: '',
      qualifications: 'NQF Level 4 Beauty Therapy', associationMembership: 'MTASA',
      weeklyHours: WH.B, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Sports Massage', 'Deep Tissue'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call', 'Corporate / Workplace'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0006',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0760001006', whatsappNumber: '0760001006', showWhatsapp: true,
      email: 'emma.botha@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Emma', lastName: 'Botha', displayName: 'Emma Botha',
      gender: 'female', genderServed: 'female', experienceYears: '5+',
      province: 'western-cape', suburb: 'Sea Point', area: '',
      addressLine1: '31 Beach Road, Sea Point', addressVisible: false,
      gpsLat: -33.9140, gpsLng: 18.3900,
      aboutMe: 'Based in Sea Point with over twelve years of experience, specialising in Swedish massage, hot stone therapy and pregnancy massage. I hold a CIDESCO Diploma and am a registered AHPCSA member. My clients describe sessions as deeply relaxing and restorative.',
      aboutSpa: '', specialsText: 'Summer special: 90-minute hot stone massage for the price of 60 minutes.',
      qualifications: 'CIDESCO Diploma in Beauty Therapy', associationMembership: 'AHPCSA',
      weeklyHours: WH.B, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Hot Stone', 'Pregnancy Massage'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Back & Neck', 'Facial'], serviceOfferings: ['Couples Massage', 'Outcall / Hotel Visit'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0007',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0820001007', whatsappNumber: '0820001007', showWhatsapp: true,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Anke', lastName: 'Louw', displayName: 'Anke Louw',
      gender: 'female', genderServed: 'both', experienceYears: '1-3',
      province: 'western-cape', suburb: 'Stellenbosch', area: '',
      addressLine1: '9 Dorp Street, Stellenbosch', addressVisible: false,
      gpsLat: -33.9321, gpsLng: 18.8602,
      aboutMe: 'Stellenbosch-based therapist offering Swedish and Balinese massage from my private studio in the winelands. I believe that massage is a vital component of physical and emotional wellbeing and tailor every session to the individual.',
      aboutSpa: '', specialsText: '',
      qualifications: 'ITEC Level 3 Diploma in Massage', associationMembership: 'None',
      weeklyHours: WH.A, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Aromatherapy'], traditions: ['Balinese', 'Shiatsu'],
      treatments: ['Full Body', 'Legs & Feet'], serviceOfferings: ['Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0008',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0780001008', whatsappNumber: '0780001008', showWhatsapp: true,
      email: 'zanele.sithole@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Zanele', lastName: 'Sithole', displayName: 'Zanele Sithole',
      gender: 'female', genderServed: 'both', experienceYears: '3-5',
      province: 'western-cape', suburb: 'Paarl', area: '',
      addressLine1: '44 Main Street, Paarl', addressVisible: false,
      gpsLat: -33.7311, gpsLng: 18.9748,
      aboutMe: 'Trained in holistic massage and aromatherapy with over three years of practice in Paarl. I use high-quality essential oils in all my treatments and create sessions focused on deep relaxation and muscle relief.',
      aboutSpa: '', specialsText: 'Couples massage available — book together and save 15%.',
      qualifications: 'NQF Level 5 Complementary Health', associationMembership: 'MTASA',
      weeklyHours: WH.C, classification: ['Beauty & Wellness'],
      massageStyles: ['Aromatherapy', 'Swedish', 'Hot Stone'], traditions: [],
      treatments: ['Full Body', 'Scalp Massage', 'Back & Neck'], serviceOfferings: ['Mobile / House Call', 'Gift Voucher', 'Couples Massage'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0009',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0830001009', whatsappNumber: '0830001009', showWhatsapp: true,
      email: 'fatima.moosa@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Fatima', lastName: 'Moosa', displayName: 'Fatima Moosa',
      gender: 'female', genderServed: 'female', experienceYears: '5+',
      province: 'western-cape', suburb: 'Bellville', area: '',
      addressLine1: '16 Durban Road, Bellville', addressVisible: false,
      gpsLat: -33.9000, gpsLng: 18.6290,
      aboutMe: 'Diploma-qualified massage therapist with specialist training in cupping and lymphatic drainage, practising in Bellville. I take a detailed health history before each session to ensure the safest and most effective treatment.',
      aboutSpa: '', specialsText: '10% discount for AHPCSA members.',
      qualifications: 'CIBTAC Diploma in Massage Therapy', associationMembership: 'SAAHIP',
      weeklyHours: WH.B, classification: ['Therapeutic Massage'],
      massageStyles: ['Cupping', 'Lymphatic Drainage', 'Deep Tissue'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Couples Massage'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0010',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0720001010', whatsappNumber: '0720001010', showWhatsapp: true,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Claire', lastName: 'Meyer', displayName: 'Claire Meyer',
      gender: 'female', genderServed: 'both', experienceYears: '1-3',
      province: 'western-cape', suburb: 'Somerset West', area: '',
      addressLine1: '27 Main Road, Somerset West', addressVisible: false,
      gpsLat: -34.0773, gpsLng: 18.8450,
      aboutMe: 'Fully qualified massage therapist based in Somerset West, specialising in sports and deep tissue massage. I work closely with athletes and active individuals to support recovery, improve performance and prevent injury.',
      aboutSpa: '', specialsText: '',
      qualifications: 'ITEC Diploma in Sports Massage', associationMembership: 'AHPCSA',
      weeklyHours: WH.A, classification: ['Therapeutic Massage'],
      massageStyles: ['Sports Massage', 'Deep Tissue', 'Trigger Point Therapy'], traditions: ['Thai'],
      treatments: ['Full Body', 'Legs & Feet', 'Back & Neck'], serviceOfferings: ['Corporate / Workplace', 'Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0011',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0840001011', whatsappNumber: '0840001011', showWhatsapp: true,
      email: 'ayanda.cele@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Ayanda', lastName: 'Cele', displayName: 'Ayanda Cele',
      gender: 'female', genderServed: 'female', experienceYears: '5+',
      province: 'kwazulu-natal', suburb: 'Umhlanga', area: '',
      addressLine1: '12 Lagoon Drive, Umhlanga', addressVisible: false,
      gpsLat: -29.7268, gpsLng: 31.0768,
      aboutMe: 'Premium massage therapist based in Umhlanga with a BSc in Complementary Health Sciences and over six years of experience. I am registered with MTASA and committed to the highest standards of professional practice.',
      aboutSpa: '', specialsText: 'Corporate wellness packages available on request.',
      qualifications: 'BSc Complementary Health Sciences', associationMembership: 'MTASA',
      weeklyHours: WH.B, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Back & Neck', 'Indian Head Massage'], serviceOfferings: ['Couples Massage', 'Gift Voucher', 'Outcall / Hotel Visit'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0012',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0730001012', whatsappNumber: '0730001012', showWhatsapp: true,
      email: 'sheetal.maharaj@outlook.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Sheetal', lastName: 'Maharaj', displayName: 'Sheetal Maharaj',
      gender: 'female', genderServed: 'both', experienceYears: '3-5',
      province: 'kwazulu-natal', suburb: 'Hillcrest', area: '',
      addressLine1: '8 Old Main Road, Hillcrest', addressVisible: false,
      gpsLat: -29.7870, gpsLng: 30.7742,
      aboutMe: 'I bring a holistic, client-centred approach to massage therapy from my studio in Hillcrest. My training includes Swedish, deep tissue and Ayurvedic massage, and I adapt every session to the individual\'s needs.',
      aboutSpa: '', specialsText: '',
      qualifications: 'ITEC Diploma in Massage Therapy', associationMembership: 'None',
      weeklyHours: WH.C, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Deep Tissue'], traditions: ['Ayurvedic'],
      treatments: ['Full Body', 'Facial', 'Legs & Feet'], serviceOfferings: ['Mobile / House Call', 'Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0013',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0760001013', whatsappNumber: '0760001013', showWhatsapp: true,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Bronwyn', lastName: 'Jacobs', displayName: 'Bronwyn Jacobs',
      gender: 'female', genderServed: 'female', experienceYears: '0-1',
      province: 'kwazulu-natal', suburb: 'Ballito', area: '',
      addressLine1: '3 Link Road, Ballito', addressVisible: false,
      gpsLat: -29.5394, gpsLng: 31.2157,
      aboutMe: 'Newly qualified massage therapist based in Ballito, passionate about delivering professional treatments on the North Coast. I specialise in relaxation massage and aromatherapy and aim to create a calming experience for every client.',
      aboutSpa: '', specialsText: '20% off for first-time clients this month.',
      qualifications: 'NQF Level 4 Massage Therapy', associationMembership: 'AHPCSA',
      weeklyHours: WH.D, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Aromatherapy'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0014',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0820001014', whatsappNumber: '0820001014', showWhatsapp: true,
      email: 'nokuthula.zulu@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Nokuthula', lastName: 'Zulu', displayName: 'Nokuthula Zulu',
      gender: 'female', genderServed: 'both', experienceYears: '1-3',
      province: 'kwazulu-natal', suburb: 'Pinetown', area: '',
      addressLine1: '55 Kings Road, Pinetown', addressVisible: false,
      gpsLat: -29.8175, gpsLng: 30.8559,
      aboutMe: 'Massage therapist in Pinetown with a focus on Swedish and pregnancy massage. I have a particular interest in supporting women through pregnancy and postpartum recovery with a gentle, reassuring approach.',
      aboutSpa: '', specialsText: 'Pregnancy massage packages from R450 per session.',
      qualifications: 'CIBTAC Certificate in Holistic Massage', associationMembership: 'SAAHIP',
      weeklyHours: WH.A, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Pregnancy Massage'], traditions: [],
      treatments: ['Full Body', 'Legs & Feet'], serviceOfferings: ['Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0015',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0780001015', whatsappNumber: '0780001015', showWhatsapp: true,
      email: 'michelle.govender@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Michelle', lastName: 'Govender', displayName: 'Michelle Govender',
      gender: 'female', genderServed: 'both', experienceYears: '5+',
      province: 'kwazulu-natal', suburb: 'Westville', area: '',
      addressLine1: '19 Jan Hofmeyr Road, Westville', addressVisible: false,
      gpsLat: -29.8327, gpsLng: 30.9315,
      aboutMe: 'Qualified massage therapist based in Westville with over ten years of experience in therapeutic and holistic massage. I offer Swedish, deep tissue and trigger point therapy and hold a diploma in Aromatherapy.',
      aboutSpa: '', specialsText: '',
      qualifications: 'ITEC Diploma in Aromatherapy & Massage', associationMembership: 'MTASA',
      weeklyHours: WH.B, classification: ['Therapeutic Massage'],
      massageStyles: ['Deep Tissue', 'Trigger Point Therapy', 'Aromatherapy', 'Swedish'], traditions: ['Thai', 'Shiatsu'],
      treatments: ['Full Body', 'Back & Neck', 'Scalp Massage'], serviceOfferings: ['Couples Massage', 'Corporate / Workplace', 'Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0016',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0830001016', whatsappNumber: '0830001016', showWhatsapp: true,
      email: 'lindiwe.ndlovu@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Lindiwe', lastName: 'Ndlovu', displayName: 'Lindiwe Ndlovu',
      gender: 'female', genderServed: 'female', experienceYears: '3-5',
      province: 'eastern-cape', suburb: 'Summerstrand', area: '',
      addressLine1: '6 Marine Drive, Summerstrand', addressVisible: false,
      gpsLat: -33.9744, gpsLng: 25.6661,
      aboutMe: 'Therapeutic massage practitioner offering sessions from my home studio in Summerstrand, Port Elizabeth. Trained in Cape Town with three years of practice, specialising in Swedish and deep tissue techniques.',
      aboutSpa: '', specialsText: 'Weekend availability — book now to secure your slot.',
      qualifications: 'ITEC Diploma in Massage Therapy', associationMembership: 'None',
      weeklyHours: WH.C, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0017',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0720001017', whatsappNumber: '0720001017', showWhatsapp: true,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Yolanda', lastName: 'Peters', displayName: 'Yolanda Peters',
      gender: 'female', genderServed: 'both', experienceYears: '0-1',
      province: 'eastern-cape', suburb: 'Vincent', area: '',
      addressLine1: '22 Vincent Road, Vincent', addressVisible: false,
      gpsLat: -32.9948, gpsLng: 27.8810,
      aboutMe: 'Based in Vincent, East London, offering massage treatments focused on relaxation and muscle recovery. I hold an NQF Level 4 qualification and am passionate about helping clients manage stress and improve quality of life.',
      aboutSpa: '', specialsText: '',
      qualifications: 'NQF Level 4 Beauty Therapy', associationMembership: 'MTASA',
      weeklyHours: WH.A, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Hot Stone'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Indian Head Massage', 'Scalp Massage'], serviceOfferings: ['Gift Voucher', 'Couples Massage'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0018',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0840001018', whatsappNumber: '0840001018', showWhatsapp: true,
      email: 'amahle.mthembu@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Amahle', lastName: 'Mthembu', displayName: 'Amahle Mthembu',
      gender: 'female', genderServed: 'female', experienceYears: '1-3',
      province: 'eastern-cape', suburb: 'Uitenhage', area: '',
      addressLine1: '14 Caledon Street, Uitenhage', addressVisible: false,
      gpsLat: -33.7636, gpsLng: 25.4002,
      aboutMe: 'Massage therapist in Uitenhage with a focus on holistic healing and whole-body wellness. I completed my City & Guilds Level 3 in massage and offer treatments from my private studio tailored carefully to each client.',
      aboutSpa: '', specialsText: '',
      qualifications: 'City & Guilds Level 3 Massage', associationMembership: 'AHPCSA',
      weeklyHours: WH.B, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Lymphatic Drainage'], traditions: [],
      treatments: ['Full Body', 'Back & Neck', 'Legs & Feet'], serviceOfferings: ['Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0019',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0730001019', whatsappNumber: '0730001019', showWhatsapp: false,
      email: 'jfortuin@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Jason', lastName: 'Fortuin', displayName: 'Jason Fortuin',
      gender: 'male', genderServed: 'both', experienceYears: '3-5',
      province: 'eastern-cape', suburb: 'Jeffreys Bay', area: '',
      addressLine1: '7 Da Gama Road, Jeffreys Bay', addressVisible: false,
      gpsLat: -34.0524, gpsLng: 24.9252,
      aboutMe: 'Male massage therapist based in Jeffreys Bay, offering sports and deep tissue massage to surfers, athletes and active locals. I specialise in injury prevention and rehabilitation, with mobile appointments available on request.',
      aboutSpa: '', specialsText: 'Post-surf recovery massage special — 45 minutes for R350.',
      qualifications: 'ITEC Diploma in Sports Massage', associationMembership: 'None',
      weeklyHours: WH.A, classification: ['Therapeutic Massage'],
      massageStyles: ['Sports Massage', 'Deep Tissue', 'Trigger Point Therapy'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call', 'Outcall / Hotel Visit'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0020',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0760001020', whatsappNumber: '0760001020', showWhatsapp: false,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Sipho', lastName: 'Dlamini', displayName: 'Sipho Dlamini',
      gender: 'male', genderServed: 'male', experienceYears: '5+',
      province: 'eastern-cape', suburb: 'Port Alfred', area: '',
      addressLine1: '33 Causeway Road, Port Alfred', addressVisible: false,
      gpsLat: -33.5914, gpsLng: 26.8916,
      aboutMe: 'Professional massage therapist offering sessions from my studio in Port Alfred, catering to local residents and visitors. I specialise in Swedish and trigger point massage with a thorough, client-centred approach.',
      aboutSpa: '', specialsText: '',
      qualifications: 'NQF Level 4 Massage Therapy', associationMembership: 'SAAHIP',
      weeklyHours: WH.C, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Trigger Point Therapy'], traditions: ['Thai'],
      treatments: ['Full Body', 'Legs & Feet'], serviceOfferings: ['Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0021',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0820001021', whatsappNumber: '0820001021', showWhatsapp: false,
      email: 'lungelo.nkosi@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Lungelo', lastName: 'Nkosi', displayName: 'Lungelo Nkosi',
      gender: 'male', genderServed: 'both', experienceYears: '1-3',
      province: 'limpopo', suburb: 'Polokwane', area: '',
      addressLine1: '11 Vorster Street, Polokwane', addressVisible: false,
      gpsLat: -23.9045, gpsLng: 29.4689,
      aboutMe: 'Holistic therapist based in Polokwane offering Swedish and deep tissue massage. I completed my ITEC Diploma in Holistic Massage and am passionate about making quality therapy accessible across Limpopo.',
      aboutSpa: '', specialsText: '',
      qualifications: 'ITEC Diploma in Holistic Massage', associationMembership: 'MTASA',
      weeklyHours: WH.B, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue'], traditions: [],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0022',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0780001022', whatsappNumber: '0780001022', showWhatsapp: false,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Pieter', lastName: 'Visser', displayName: 'Pieter Visser',
      gender: 'male', genderServed: 'male', experienceYears: '0-1',
      province: 'limpopo', suburb: 'Tzaneen', area: '',
      addressLine1: '8 Agatha Street, Tzaneen', addressVisible: false,
      gpsLat: -23.8328, gpsLng: 30.1623,
      aboutMe: 'Massage therapist offering relaxation and stress management treatments from my studio in Tzaneen. I hold an NQF Level 4 qualification and look forward to resuming full practice once my subscription is renewed.',
      aboutSpa: '', specialsText: '',
      qualifications: 'NQF Level 4 Beauty Therapy', associationMembership: 'None',
      weeklyHours: WH.A, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Aromatherapy'], traditions: ['Ayurvedic'],
      treatments: ['Full Body', 'Scalp Massage'], serviceOfferings: ['Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0023',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0830001023', whatsappNumber: '0830001023', showWhatsapp: false,
      email: 'themba.mokoena@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Themba', lastName: 'Mokoena', displayName: 'Themba Mokoena',
      gender: 'male', genderServed: 'both', experienceYears: '3-5',
      province: 'limpopo', suburb: 'Mokopane', area: '',
      addressLine1: '19 Mokopane Street, Mokopane', addressVisible: false,
      gpsLat: -24.1975, gpsLng: 29.0137,
      aboutMe: 'Massage therapist based in Mokopane with a background in Swedish and aromatherapy massage. I trained through an accredited provider and aim to bring professional, affordable therapy to the Mokopane community.',
      aboutSpa: '', specialsText: '',
      qualifications: 'ITEC Diploma in Massage Therapy', associationMembership: 'AHPCSA',
      weeklyHours: WH.D, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Hot Stone'], traditions: [],
      treatments: ['Full Body', 'Back & Neck', 'Indian Head Massage'], serviceOfferings: ['Mobile / House Call', 'Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0024',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0720001024', whatsappNumber: '0720001024', showWhatsapp: false,
      email: 'alex.swart@gmail.com', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Alex', lastName: 'Swart', displayName: 'Alex Swart',
      gender: 'non-binary', genderServed: 'both', experienceYears: '1-3',
      province: 'limpopo', suburb: 'Louis Trichardt', area: '',
      addressLine1: '5 Trichardt Street, Louis Trichardt', addressVisible: false,
      gpsLat: -23.0444, gpsLng: 29.9021,
      aboutMe: 'Complementary health practitioner offering massage and wellness treatments from Louis Trichardt. My training includes Swedish massage and hot stone therapy, with an interest in integrative health approaches.',
      aboutSpa: '', specialsText: '',
      qualifications: 'CIBTAC Certificate in Complementary Health', associationMembership: 'SAAHIP',
      weeklyHours: WH.B, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Hot Stone'], traditions: [],
      treatments: ['Full Body', 'Legs & Feet'], serviceOfferings: ['Gift Voucher'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'individual', supplierNumber: 'T-0025',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0840001025', whatsappNumber: '0840001025', showWhatsapp: false,
      email: '', contactPreferences: ['sms', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      firstName: 'Jordan', lastName: 'Pretorius', displayName: 'Jordan Pretorius',
      gender: 'non-binary', genderServed: 'female', experienceYears: '5+',
      province: 'limpopo', suburb: 'Bela-Bela', area: '',
      addressLine1: '27 Voortrekker Road, Bela-Bela', addressVisible: false,
      gpsLat: -24.8833, gpsLng: 28.3333,
      aboutMe: 'Qualified massage therapist based in Bela-Bela with a passion for holistic wellness. I specialise in relaxation and deep tissue massage and completed my NQF Level 5 qualification.',
      aboutSpa: '', specialsText: '',
      qualifications: 'NQF Level 5 Holistic Health', associationMembership: 'None',
      weeklyHours: WH.A, classification: ['Therapeutic Massage'],
      massageStyles: ['Deep Tissue', 'Swedish'], traditions: ['Shiatsu'],
      treatments: ['Full Body', 'Back & Neck'], serviceOfferings: ['Mobile / House Call'],
      amenities: [], vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    }
  ];

  for (const t of therapists) {
    await db.collection('suppliers').add(t);
  }
  await db.collection('settings').doc('config').set({ counterIndividual: 25 }, { merge: true });
  console.log('25 therapists seeded. counterIndividual: 25');

  // ================================================
  // STEP E — SEED 25 SPAS
  // ================================================
  console.log('\n--- STEP E: Seeding 25 spas ---');

  const spas = [
    {
      supplierType: 'spa', supplierNumber: 'S-0001',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0820002001', whatsappNumber: '0820002001', showWhatsapp: true,
      email: 'info@serenitywellnessspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Serenity Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Serenity Wellness Spa', genderServed: 'both', experienceYears: '',
      province: 'gauteng', suburb: 'Sandton', area: '',
      addressLine1: '12 Rivonia Road, Sandton', addressVisible: true,
      gpsLat: -26.1076, gpsLng: 28.0567,
      aboutMe: '', aboutSpa: 'Serenity Wellness Spa offers a premier urban retreat in the heart of Sandton, providing a full range of massage and body treatments for the modern professional. Our experienced team is dedicated to delivering personalised care in a serene, luxurious environment. We welcome both individual clients and corporate wellness groups.',
      specialsText: 'Midweek wellness package: 60-minute massage plus facial for R850.',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.E, classification: ['Therapeutic Massage', 'Beauty & Wellness'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'], traditions: ['Balinese', 'Thai'],
      treatments: ['Full Body', 'Facial', 'Body Scrub', 'Back & Neck'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher', 'Full Day Spa'],
      amenities: ['Parking', 'Waiting Area', 'Refreshments', 'Wi-Fi'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0002',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0830002002', whatsappNumber: '0830002002', showWhatsapp: true,
      email: 'bookings@zendayspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Zen Day Spa (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Zen Day Spa', genderServed: 'female', experienceYears: '',
      province: 'gauteng', suburb: 'Centurion', area: '',
      addressLine1: '45 John Vorster Drive, Centurion', addressVisible: true,
      gpsLat: -25.8600, gpsLng: 28.1887,
      aboutMe: '', aboutSpa: 'Zen Day Spa is a tranquil sanctuary in Centurion offering an extensive menu of therapeutic and relaxation treatments. Our therapists are fully qualified and passionate about holistic wellbeing. Whether you are looking for a quick escape or a full-day pampering experience, we have a treatment for you.',
      specialsText: '15% discount on all treatments booked Monday to Wednesday.',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.F, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Pregnancy Massage'], traditions: ['Ayurvedic'],
      treatments: ['Full Body', 'Back & Neck', 'Body Wrap'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher'],
      amenities: ['Parking', 'Shower', 'Couples Room'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0003',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0720002003', whatsappNumber: '0720002003', showWhatsapp: true,
      email: 'hello@azurespa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Azure Beauty (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Azure Spa & Beauty', genderServed: 'both', experienceYears: '',
      province: 'gauteng', suburb: 'Randburg', area: '',
      addressLine1: '8 Hans Strijdom Drive, Randburg', addressVisible: true,
      gpsLat: -26.0925, gpsLng: 27.9628,
      aboutMe: '', aboutSpa: 'Azure Spa & Beauty combines luxury beauty treatments with therapeutic massage in our Randburg studio. Our team specialises in a wide range of services from deep tissue massage to manicures and pedicures. We pride ourselves on creating a warm, welcoming space where every client feels valued.',
      specialsText: 'Full day spa package includes lunch — book for two from R2,200.',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.E, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Hot Stone', 'Aromatherapy', 'Lymphatic Drainage'], traditions: ['Thai', 'Balinese', 'Shiatsu'],
      treatments: ['Full Body', 'Facial', 'Body Scrub', 'Manicure', 'Pedicure'],
      serviceOfferings: ['Full Day Spa', 'Half Day Spa', 'Birthday Package', 'Gift Voucher'],
      amenities: ['Parking', 'Shower', 'Waiting Area', 'Refreshments', 'Wi-Fi'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0004',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0840002004', whatsappNumber: '0840002004', showWhatsapp: true,
      email: 'info@tranquiltouch.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Tranquil Touch CC', firstName: '', lastName: '', gender: '',
      displayName: 'Tranquil Touch Spa', genderServed: 'female', experienceYears: '',
      province: 'gauteng', suburb: 'Midrand', area: '',
      addressLine1: '23 New Road, Midrand', addressVisible: true,
      gpsLat: -25.9942, gpsLng: 28.1284,
      aboutMe: '', aboutSpa: 'Tranquil Touch Spa in Midrand is a boutique wellness destination focused on personalised, results-driven treatments. We offer a curated menu of massage, body and facial therapies designed to restore balance and vitality. Our peaceful environment and attentive service make every visit a true escape.',
      specialsText: 'New client special: 10% off your first visit.',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.H, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Cupping', 'Hot Stone'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Body Wrap', 'Back & Neck', 'Facial'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher', 'Membership / Package'],
      amenities: ['Parking', 'Couples Room', 'Air Conditioning', 'Waiting Area'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0005',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0730002005', whatsappNumber: '0730002005', showWhatsapp: true,
      email: 'blisswellness@gmail.com', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Bliss Wellness Centre (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Bliss Wellness Centre', genderServed: 'both', experienceYears: '',
      province: 'gauteng', suburb: 'Roodepoort', area: '',
      addressLine1: '56 Ontdekkers Road, Roodepoort', addressVisible: true,
      gpsLat: -26.1625, gpsLng: 27.8729,
      aboutMe: '', aboutSpa: 'Bliss Wellness Centre in Roodepoort is your go-to destination for affordable, professional spa treatments. We offer a wide range of massages and body therapies suitable for all lifestyles and budgets. Our experienced therapists take a client-first approach to ensure you leave feeling refreshed and revitalised.',
      specialsText: '',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.E, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Sports Massage', 'Aromatherapy', 'Trigger Point Therapy'], traditions: ['Thai', 'Shiatsu'],
      treatments: ['Full Body', 'Back & Neck', 'Body Scrub'],
      serviceOfferings: ['Full Day Spa', 'Half Day Spa', 'Corporate / Workplace'],
      amenities: ['Parking', 'Waiting Area', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0006',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0820002006', whatsappNumber: '0820002006', showWhatsapp: true,
      email: 'info@healingsanctuary.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Healing Sanctuary (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'The Healing Sanctuary', genderServed: 'female', experienceYears: '',
      province: 'western-cape', suburb: 'Sea Point', area: '',
      addressLine1: '18 Beach Road, Sea Point', addressVisible: true,
      gpsLat: -33.9140, gpsLng: 18.3900,
      aboutMe: '', aboutSpa: 'The Healing Sanctuary in Sea Point offers an intimate, carefully curated spa experience focused on therapeutic and holistic healing. Set just moments from the Atlantic seaboard, our space is designed for deep relaxation and renewal. Our practitioners bring exceptional skill and genuine care to every treatment.',
      specialsText: 'Couples retreat package available every weekend — enquire for pricing.',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.F, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Facial', 'Indian Head Massage'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher', 'Birthday Package'],
      amenities: ['Shower', 'Couples Room', 'Waiting Area', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0007',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0830002007', whatsappNumber: '0830002007', showWhatsapp: true,
      email: 'bookings@vineyardspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: true,
      tradingName: 'Vineyard Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Vineyard Wellness Spa', genderServed: 'both', experienceYears: '',
      province: 'western-cape', suburb: 'Stellenbosch', area: '',
      addressLine1: '7 Church Street, Stellenbosch', addressVisible: true,
      gpsLat: -33.9321, gpsLng: 18.8602,
      aboutMe: '', aboutSpa: 'Vineyard Wellness Spa in Stellenbosch provides a serene winelands retreat combining traditional Balinese and Ayurvedic techniques with modern wellness philosophy. Our setting among the vineyards creates the perfect backdrop for a transformative spa day. We specialise in half-day packages and gift experiences.',
      specialsText: 'Winelands escape: half-day spa package from R950 per person.',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.G, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Pregnancy Massage', 'Lymphatic Drainage'], traditions: ['Ayurvedic', 'Thai'],
      treatments: ['Full Body', 'Back & Neck', 'Body Wrap', 'Facial'],
      serviceOfferings: ['Half Day Spa', 'Gift Voucher', 'Membership / Package'],
      amenities: ['Parking', 'Waiting Area', 'Refreshments', 'Health Bar'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0008',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0720002008', whatsappNumber: '0720002008', showWhatsapp: true,
      email: 'hello@heritagedayspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Heritage Day Spa CC', firstName: '', lastName: '', gender: '',
      displayName: 'Heritage Day Spa', genderServed: 'female', experienceYears: '',
      province: 'western-cape', suburb: 'Paarl', area: '',
      addressLine1: '33 Main Street, Paarl', addressVisible: true,
      gpsLat: -33.7311, gpsLng: 18.9748,
      aboutMe: '', aboutSpa: 'Heritage Day Spa in Paarl draws on the region\'s rich cultural heritage to offer a distinctive spa experience blending African traditions with contemporary therapies. Our team is passionate about authentic, effective treatments that nourish the body and calm the mind.',
      specialsText: '',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.E, classification: ['Therapeutic Massage', 'Beauty & Wellness'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'], traditions: ['Balinese', 'Shiatsu'],
      treatments: ['Full Body', 'Body Scrub', 'Facial', 'Manicure'],
      serviceOfferings: ['Full Day Spa', 'Birthday Package', 'Kiddies Spa', 'Gift Voucher'],
      amenities: ['Parking', 'Shower', 'Waiting Area', 'Wi-Fi', 'Air Conditioning'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0009',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0840002009', whatsappNumber: '0840002009', showWhatsapp: true,
      email: 'info@capeserenity.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Cape Serenity (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Cape Serenity Spa', genderServed: 'both', experienceYears: '',
      province: 'western-cape', suburb: 'Bellville', area: '',
      addressLine1: '14 Voortrekker Road, Bellville', addressVisible: true,
      gpsLat: -33.9000, gpsLng: 18.6290,
      aboutMe: '', aboutSpa: 'Cape Serenity Spa in Bellville is a modern wellness hub offering professional massage and body treatments in a relaxing, friendly environment. We serve the Northern Suburbs community with a commitment to quality, affordability and genuine care. Appointments are available six days a week.',
      specialsText: '10% loyalty discount for clients who book 5 or more sessions.',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.H, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Cupping'], traditions: ['Thai'],
      treatments: ['Full Body', 'Back & Neck', 'Body Scrub'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher'],
      amenities: ['Parking', 'Couples Room', 'Waiting Area'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0010',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0730002010', whatsappNumber: '0730002010', showWhatsapp: true,
      email: 'bookings@bluewatersspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Blue Waters Wellness CC', firstName: '', lastName: '', gender: '',
      displayName: 'Blue Waters Spa', genderServed: 'both', experienceYears: '',
      province: 'western-cape', suburb: 'Strand', area: '',
      addressLine1: '9 Beach Road, Strand', addressVisible: true,
      gpsLat: -34.1145, gpsLng: 18.8286,
      aboutMe: '', aboutSpa: 'Blue Waters Spa in Strand offers a coastal spa experience inspired by the calming energy of the sea. Our menu includes a wide range of massages, body wraps and facial treatments for all genders. We aim to make premium spa therapy accessible and enjoyable for the whole community.',
      specialsText: '',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.F, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Hot Stone', 'Sports Massage', 'Deep Tissue'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Body Wrap', 'Facial'],
      serviceOfferings: ['Half Day Spa', 'Membership / Package', 'Gift Voucher'],
      amenities: ['Shower', 'Waiting Area', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0011',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0820002011', whatsappNumber: '0820002011', showWhatsapp: true,
      email: 'info@oceanbreezespa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Ocean Breeze Spa (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Ocean Breeze Spa', genderServed: 'female', experienceYears: '',
      province: 'kwazulu-natal', suburb: 'Umhlanga', area: '',
      addressLine1: '5 Gateway Drive, Umhlanga', addressVisible: true,
      gpsLat: -29.7268, gpsLng: 31.0768,
      aboutMe: '', aboutSpa: 'Ocean Breeze Spa in Umhlanga is a premier wellness destination offering a full menu of massage and body treatments. Our waterfront location and professional facilities create an exceptional environment for relaxation and rejuvenation. We are a preferred spa destination on the KwaZulu-Natal North Coast.',
      specialsText: 'Birthday month special: complimentary 15-minute add-on treatment.',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.E, classification: ['Therapeutic Massage', 'Beauty & Wellness'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Aromatherapy', 'Lymphatic Drainage'], traditions: ['Thai', 'Balinese'],
      treatments: ['Full Body', 'Facial', 'Body Scrub', 'Back & Neck', 'Indian Head Massage'],
      serviceOfferings: ['Full Day Spa', 'Couples Massage', 'Gift Voucher', 'Birthday Package'],
      amenities: ['Parking', 'Couples Room', 'Shower', 'Waiting Area', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0012',
      status: 'active', subscriptionStatus: 'active', subscriptionExpiry: activeExpiry,
      cellNumber: '0830002012', whatsappNumber: '0830002012', showWhatsapp: true,
      email: 'bookings@valleywellness.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Valley Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Valley Wellness', genderServed: 'both', experienceYears: '',
      province: 'kwazulu-natal', suburb: 'Hillcrest', area: '',
      addressLine1: '27 Old Main Road, Hillcrest', addressVisible: true,
      gpsLat: -29.7870, gpsLng: 30.7742,
      aboutMe: '', aboutSpa: 'Valley Wellness in Hillcrest is a serene day spa set in lush Midlands surroundings, offering therapeutic and holistic treatments for body and mind. Our experienced therapists are committed to delivering exceptional results in a warm, nurturing environment. We specialise in couples packages and membership plans.',
      specialsText: 'Membership packages from R1,200 per month — ask for details.',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.G, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Pregnancy Massage', 'Aromatherapy'], traditions: ['Ayurvedic', 'Thai', 'Balinese'],
      treatments: ['Full Body', 'Back & Neck', 'Body Wrap', 'Manicure'],
      serviceOfferings: ['Couples Massage', 'Half Day Spa', 'Membership / Package'],
      amenities: ['Parking', 'Waiting Area', 'Air Conditioning', 'Health Bar'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0013',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0720002013', whatsappNumber: '0720002013', showWhatsapp: true,
      email: 'info@durbandayspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Durban Day Spa CC', firstName: '', lastName: '', gender: '',
      displayName: 'Durban Day Spa', genderServed: 'female', experienceYears: '',
      province: 'kwazulu-natal', suburb: 'Westville', area: '',
      addressLine1: '16 Jan Hofmeyr Road, Westville', addressVisible: true,
      gpsLat: -29.8327, gpsLng: 30.9315,
      aboutMe: '', aboutSpa: 'Durban Day Spa in Westville offers a peaceful urban retreat for clients seeking quality massage and beauty treatments. Our friendly, experienced team provides personalised service in a comfortable, relaxing setting. We cater to individuals, couples and groups looking for a genuine spa experience close to home.',
      specialsText: '',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.H, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Hot Stone', 'Aromatherapy'], traditions: ['Thai'],
      treatments: ['Full Body', 'Back & Neck', 'Facial'],
      serviceOfferings: ['Gift Voucher', 'Couples Massage'],
      amenities: ['Parking', 'Waiting Area'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0014',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0840002014', whatsappNumber: '0840002014', showWhatsapp: true,
      email: 'hello@coastalretreat.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Coastal Retreat (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Coastal Retreat Spa', genderServed: 'both', experienceYears: '',
      province: 'kwazulu-natal', suburb: 'Ballito', area: '',
      addressLine1: '4 Link Road, Ballito', addressVisible: true,
      gpsLat: -29.5394, gpsLng: 31.2157,
      aboutMe: '', aboutSpa: 'Coastal Retreat Spa in Ballito provides a laid-back, premium spa experience inspired by the relaxed coastal lifestyle of the North Coast. We offer a focused menu of massage and body treatments designed for both visitors and locals. Our outdoor relaxation area and sea views make every visit memorable.',
      specialsText: 'Summer coastal package: 90-minute massage plus body scrub from R780.',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.F, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Sports Massage'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Body Scrub', 'Back & Neck'],
      serviceOfferings: ['Half Day Spa', 'Gift Voucher', 'Birthday Package'],
      amenities: ['Parking', 'Shower', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0015',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0730002015', whatsappNumber: '0730002015', showWhatsapp: true,
      email: 'bookings@zulusoul.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Zulu Soul Spa CC', firstName: '', lastName: '', gender: '',
      displayName: 'Zulu Soul Spa', genderServed: 'female', experienceYears: '',
      province: 'kwazulu-natal', suburb: 'Pietermaritzburg', area: '',
      addressLine1: '41 Commercial Road, Pietermaritzburg', addressVisible: true,
      gpsLat: -29.6006, gpsLng: 30.3794,
      aboutMe: '', aboutSpa: 'Zulu Soul Spa in Pietermaritzburg draws on the region\'s vibrant cultural heritage to offer a unique spa experience blending indigenous African wellness traditions with modern techniques. Our team is passionate about authentic, community-centred therapy that supports holistic wellbeing.',
      specialsText: '',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.E, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Cupping'], traditions: ['Thai', 'Shiatsu'],
      treatments: ['Full Body', 'Facial', 'Body Wrap', 'Pedicure'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher'],
      amenities: ['Couples Room', 'Waiting Area', 'Refreshments', 'Wi-Fi'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0016',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0820002016', whatsappNumber: '0820002016', showWhatsapp: false,
      email: 'info@easternlightspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Eastern Light Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Eastern Light Spa', genderServed: 'both', experienceYears: '',
      province: 'eastern-cape', suburb: 'Summerstrand', area: '',
      addressLine1: '11 Marine Drive, Summerstrand', addressVisible: true,
      gpsLat: -33.9744, gpsLng: 25.6661,
      aboutMe: '', aboutSpa: 'Eastern Light Spa in Summerstrand offers a calming, professional spa experience on the Eastern Cape coast. Our treatments are designed to relieve the stresses of modern life and restore natural vitality. We are committed to using quality products and delivering personalised care to every client.',
      specialsText: '',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.G, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Deep Tissue'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Back & Neck', 'Body Scrub'],
      serviceOfferings: ['Gift Voucher', 'Couples Massage'],
      amenities: ['Parking', 'Waiting Area'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0017',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0830002017', whatsappNumber: '0830002017', showWhatsapp: false,
      email: 'hello@wildcoastwellness.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Wild Coast Wellness CC', firstName: '', lastName: '', gender: '',
      displayName: 'Wild Coast Wellness', genderServed: 'female', experienceYears: '',
      province: 'eastern-cape', suburb: 'East London', area: '',
      addressLine1: '7 Beacon Bay Road, East London', addressVisible: true,
      gpsLat: -32.9977, gpsLng: 27.8655,
      aboutMe: '', aboutSpa: 'Wild Coast Wellness in East London brings a bold, nature-inspired approach to spa therapy. Our menu reflects the energy and diversity of the Eastern Cape, with treatments ranging from Ayurvedic massage to deep tissue bodywork. We are passionate about making premium wellness accessible to the East London community.',
      specialsText: 'Introductory offer: 20% off first booking.',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.H, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Hot Stone', 'Lymphatic Drainage', 'Aromatherapy'], traditions: ['Ayurvedic'],
      treatments: ['Full Body', 'Facial', 'Body Wrap'],
      serviceOfferings: ['Half Day Spa', 'Birthday Package', 'Gift Voucher'],
      amenities: ['Shower', 'Waiting Area', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0018',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0720002018', whatsappNumber: '0720002018', showWhatsapp: false,
      email: 'info@bayspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Bay Spa and Beauty (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Bay Spa & Beauty', genderServed: 'both', experienceYears: '',
      province: 'eastern-cape', suburb: 'Gqeberha', area: '',
      addressLine1: '22 Cape Road, Gqeberha', addressVisible: true,
      gpsLat: -33.9608, gpsLng: 25.6022,
      aboutMe: '', aboutSpa: 'Bay Spa & Beauty in Gqeberha is a full-service spa offering a comprehensive menu of massage, body and beauty treatments. Our central location and flexible hours make us a convenient choice for clients across the metro. We are known for our warm service and consistently high treatment standards.',
      specialsText: '',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.E, classification: ['Beauty & Wellness'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone'], traditions: ['Thai', 'Balinese'],
      treatments: ['Full Body', 'Back & Neck', 'Body Scrub', 'Indian Head Massage'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher', 'Corporate / Workplace'],
      amenities: ['Parking', 'Couples Room', 'Air Conditioning'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0019',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0840002019', whatsappNumber: '0840002019', showWhatsapp: false,
      email: 'bookings@algoawellness.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Algoa Wellness CC', firstName: '', lastName: '', gender: '',
      displayName: 'Algoa Wellness', genderServed: 'both', experienceYears: '',
      province: 'eastern-cape', suburb: 'Uitenhage', area: '',
      addressLine1: '8 Caledon Street, Uitenhage', addressVisible: true,
      gpsLat: -33.7636, gpsLng: 25.4002,
      aboutMe: '', aboutSpa: 'Algoa Wellness in Uitenhage is a boutique spa offering thoughtful, professional treatments in a calm and welcoming space. We specialise in therapeutic massage and body wrap therapies, and we take pride in creating a personalised experience for every client. Appointments are available on weekdays and Saturdays.',
      specialsText: '',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.F, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Aromatherapy', 'Cupping'], traditions: ['Shiatsu'],
      treatments: ['Full Body', 'Body Wrap', 'Facial'],
      serviceOfferings: ['Half Day Spa', 'Gift Voucher'],
      amenities: ['Parking', 'Waiting Area', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0020',
      status: 'pending', subscriptionStatus: 'not_paid', subscriptionExpiry: expiredExpiry,
      cellNumber: '0730002020', whatsappNumber: '0730002020', showWhatsapp: false,
      email: 'info@sunshinecoastspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Sunshine Coast Spa (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Sunshine Coast Spa', genderServed: 'female', experienceYears: '',
      province: 'eastern-cape', suburb: 'Jeffreys Bay', area: '',
      addressLine1: '15 Da Gama Road, Jeffreys Bay', addressVisible: true,
      gpsLat: -34.0524, gpsLng: 24.9252,
      aboutMe: '', aboutSpa: 'Sunshine Coast Spa in Jeffreys Bay captures the easy, sun-soaked spirit of the town in every treatment. Our friendly team offers relaxing massages and body therapies tailored to locals and visiting surfers alike. We are committed to affordable, quality wellness in one of South Africa\'s most beloved coastal towns.',
      specialsText: 'Post-surf recovery package: deep tissue massage from R420.',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.G, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Hot Stone', 'Sports Massage'], traditions: ['Thai'],
      treatments: ['Full Body', 'Back & Neck', 'Body Scrub'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher'],
      amenities: ['Parking', 'Shower'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0021',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0820002021', whatsappNumber: '0820002021', showWhatsapp: false,
      email: 'info@baobabspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Baobab Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Baobab Wellness Spa', genderServed: 'both', experienceYears: '',
      province: 'limpopo', suburb: 'Polokwane', area: '',
      addressLine1: '6 Grobler Street, Polokwane', addressVisible: true,
      gpsLat: -23.9045, gpsLng: 29.4689,
      aboutMe: '', aboutSpa: 'Baobab Wellness Spa in Polokwane is a premier spa destination serving the capital of Limpopo. We offer a full menu of massage, body and facial treatments in a sophisticated, tranquil environment. Our experienced team is dedicated to delivering exceptional results for every client.',
      specialsText: '',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.H, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone', 'Aromatherapy'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Facial', 'Body Scrub'],
      serviceOfferings: ['Gift Voucher', 'Couples Massage'],
      amenities: ['Parking', 'Waiting Area'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0022',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0830002022', whatsappNumber: '0830002022', showWhatsapp: false,
      email: 'bookings@tzaneenvalleyspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Tzaneen Valley Spa CC', firstName: '', lastName: '', gender: '',
      displayName: 'Tzaneen Valley Spa', genderServed: 'female', experienceYears: '',
      province: 'limpopo', suburb: 'Tzaneen', area: '',
      addressLine1: '19 Agatha Street, Tzaneen', addressVisible: true,
      gpsLat: -23.8328, gpsLng: 30.1623,
      aboutMe: '', aboutSpa: 'Tzaneen Valley Spa offers a peaceful retreat amid the lush subtropical landscape of the Tzaneen valley. Our treatments draw on local botanical ingredients and traditional African wellness traditions. We are passionate about creating a genuine, restorative spa experience for the Limpopo community.',
      specialsText: '',
      qualifications: '', associationMembership: 'SPAASA',
      weeklyHours: WH.E, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Cupping'], traditions: ['Thai', 'Shiatsu'],
      treatments: ['Full Body', 'Back & Neck', 'Manicure'],
      serviceOfferings: ['Half Day Spa', 'Gift Voucher'],
      amenities: ['Shower', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0023',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0720002023', whatsappNumber: '0720002023', showWhatsapp: false,
      email: 'hello@bushretreat.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Bush Retreat Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Bush Retreat Wellness', genderServed: 'both', experienceYears: '',
      province: 'limpopo', suburb: 'Mokopane', area: '',
      addressLine1: '12 Mogalakwena Street, Mokopane', addressVisible: true,
      gpsLat: -24.1975, gpsLng: 29.0137,
      aboutMe: '', aboutSpa: 'Bush Retreat Wellness in Mokopane offers a unique spa experience inspired by the surrounding bushveld. Our menu includes therapeutic massage and body treatments tailored to the active, outdoor-oriented lifestyle of the region. We are committed to bringing professional wellness services to Mokopane and surrounding areas.',
      specialsText: '',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.F, classification: ['Therapeutic Massage'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Hot Stone'], traditions: ['Ayurvedic'],
      treatments: ['Full Body', 'Body Wrap', 'Facial', 'Back & Neck'],
      serviceOfferings: ['Couples Massage', 'Gift Voucher', 'Birthday Package'],
      amenities: ['Parking', 'Waiting Area', 'Wheelchair Access'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0024',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0840002024', whatsappNumber: '0840002024', showWhatsapp: false,
      email: 'info@soutpansbergspa.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Soutpansberg Spa CC', firstName: '', lastName: '', gender: '',
      displayName: 'Soutpansberg Spa', genderServed: 'both', experienceYears: '',
      province: 'limpopo', suburb: 'Louis Trichardt', area: '',
      addressLine1: '3 Munnik Street, Louis Trichardt', addressVisible: true,
      gpsLat: -23.0444, gpsLng: 29.9021,
      aboutMe: '', aboutSpa: 'Soutpansberg Spa in Louis Trichardt is nestled in the shadow of the Soutpansberg Mountains, offering a serene escape from the everyday. Our treatments combine mountain botanicals with expert massage techniques for a deeply grounding experience. We serve clients from across the far north of Limpopo.',
      specialsText: '',
      qualifications: '', associationMembership: 'AHPCSA',
      weeklyHours: WH.G, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Aromatherapy', 'Lymphatic Drainage'], traditions: ['Balinese'],
      treatments: ['Full Body', 'Back & Neck', 'Indian Head Massage'],
      serviceOfferings: ['Gift Voucher', 'Couples Massage'],
      amenities: ['Parking', 'Refreshments'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    },
    {
      supplierType: 'spa', supplierNumber: 'S-0025',
      status: 'suspended', subscriptionStatus: 'expired', subscriptionExpiry: expiredExpiry,
      cellNumber: '0730002025', whatsappNumber: '0730002025', showWhatsapp: false,
      email: 'bookings@waterbergwellness.co.za', contactPreferences: ['email', 'whatsapp'],
      dataConsentGiven: true, dataConsentTimestamp: ST(), requiresInvoice: false,
      tradingName: 'Waterberg Wellness (Pty) Ltd', firstName: '', lastName: '', gender: '',
      displayName: 'Waterberg Wellness', genderServed: 'female', experienceYears: '',
      province: 'limpopo', suburb: 'Bela-Bela', area: '',
      addressLine1: '28 Voortrekker Road, Bela-Bela', addressVisible: true,
      gpsLat: -24.8833, gpsLng: 28.3333,
      aboutMe: '', aboutSpa: 'Waterberg Wellness in Bela-Bela is a full-service spa located in one of South Africa\'s premier thermal resort towns. We offer a comprehensive menu of massage and body treatments to complement the natural healing properties of the local hot springs. Our welcoming, professional team ensures an exceptional experience every time.',
      specialsText: 'Thermal spa add-on: 30-minute soak plus massage from R650.',
      qualifications: '', associationMembership: 'None',
      weeklyHours: WH.H, classification: ['Holistic'],
      massageStyles: ['Swedish', 'Deep Tissue', 'Trigger Point Therapy', 'Hot Stone'], traditions: ['Thai'],
      treatments: ['Full Body', 'Facial', 'Body Scrub'],
      serviceOfferings: ['Half Day Spa', 'Gift Voucher'],
      amenities: ['Parking', 'Waiting Area', 'Health Bar'],
      vetNotes: '', rejectionReason: '', idPhotoUrl: '', photos: [],
      createdAt: ST(), lastUpdated: ST()
    }
  ];

  for (const s of spas) {
    await db.collection('suppliers').add(s);
  }
  await db.collection('settings').doc('config').set({ counterSpa: 25 }, { merge: true });
  console.log('25 spas seeded. counterSpa: 25');
  console.log('=== S1 COMPLETE ===');

}

main().catch(console.error);
