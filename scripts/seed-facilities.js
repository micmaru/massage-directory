const admin = require('firebase-admin');
const serviceAccount = require('../massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://massage-directory-57e19.firebaseio.com'
});

const db = admin.firestore();

const facilities = [
  { category: 'facilities', name: 'Sauna', description: 'Dry heat sauna available on premises.', visibleTo: ['spa'], launchActive: true, sortOrder: 1 },
  { category: 'facilities', name: 'Steam Room', description: 'Wet steam room available on premises.', visibleTo: ['spa'], launchActive: true, sortOrder: 2 },
  { category: 'facilities', name: 'Swimming Pool', description: 'Swimming pool available on premises.', visibleTo: ['spa'], launchActive: true, sortOrder: 3 },
  { category: 'facilities', name: 'Jacuzzi / Hot Tub', description: 'Jacuzzi or hot tub available on premises.', visibleTo: ['spa'], launchActive: true, sortOrder: 4 },
  { category: 'facilities', name: 'Plunge Pool', description: 'Cold plunge pool available on premises.', visibleTo: ['spa'], launchActive: true, sortOrder: 5 },
  { category: 'facilities', name: 'Relaxation Lounge', description: 'Dedicated relaxation lounge for guests.', visibleTo: ['spa'], launchActive: true, sortOrder: 6 },
  { category: 'facilities', name: 'Changing Rooms', description: 'Private changing rooms available.', visibleTo: ['spa'], launchActive: true, sortOrder: 7 },
  { category: 'facilities', name: 'Shower Facilities', description: 'Shower facilities available on premises.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 8 },
  { category: 'facilities', name: 'Hydrotherapy Pool', description: 'Hydrotherapy pool available on premises.', visibleTo: ['spa'], launchActive: true, sortOrder: 9 },
  { category: 'facilities', name: 'Outdoor Terrace', description: 'Outdoor terrace or garden area for guests.', visibleTo: ['spa'], launchActive: true, sortOrder: 10 },
  { category: 'facilities', name: 'Restaurant / Café', description: 'On-site restaurant or café for guests.', visibleTo: ['spa'], launchActive: true, sortOrder: 11 },
  { category: 'facilities', name: 'Parking', description: 'Parking available on or near premises.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 12 },
];

async function seedFacilities() {
  console.log(`Seeding ${facilities.length} facilities to Firestore...`);
  const batch = db.batch();
  facilities.forEach((item) => {
    const ref = db.collection('offerings').doc();
    batch.set(ref, {
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  console.log('Done. Facilities seeded.');
  process.exit(0);
}

seedFacilities().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
