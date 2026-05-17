const admin = require('firebase-admin');
const serviceAccount = require('../massage-directory-57e19-firebase-adminsdk-fbsvc-21529ba152.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://massage-directory-57e19.firebaseio.com'
});

const db = admin.firestore();

const offerings = [

  // ── MASSAGE STYLES ──────────────────────────────────────────
  { category: 'massageStyles', name: 'Swedish', description: 'The foundation of Western massage. Uses long flowing strokes, kneading and gentle pressure to relax muscles and improve circulation.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 1 },
  { category: 'massageStyles', name: 'Deep Tissue', description: 'Targets deeper layers of muscle and connective tissue using slow, firm strokes. Effective for chronic pain and muscle tightness.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 2 },
  { category: 'massageStyles', name: 'Sports', description: 'Designed for athletes before, during or after training. Combines techniques to prevent injury, reduce recovery time and improve performance.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 3 },
  { category: 'massageStyles', name: 'Aromatherapy', description: 'Uses essential oils blended into the massage medium. Combines physical massage with the therapeutic properties of plant-based oils.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 4 },
  { category: 'massageStyles', name: 'Hot Stone', description: 'Smooth heated basalt stones placed on the body and used as extension of the therapist\'s hands. Heat relaxes muscles and allows deeper work.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 5 },
  { category: 'massageStyles', name: 'Pregnancy', description: 'Specifically adapted for pregnant women. Uses positioning cushions and gentle techniques to relieve lower back pain, swelling and discomfort.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 6 },
  { category: 'massageStyles', name: 'Postnatal', description: 'Gentle massage adapted for the postpartum period. Supports recovery after birth, relieves muscle tension from feeding and carrying.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 7 },
  { category: 'massageStyles', name: 'Trigger Point', description: 'Focuses on tight areas within muscle tissue that cause referred pain elsewhere in the body. Uses direct pressure to release these points.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 8 },
  { category: 'massageStyles', name: 'Myofascial Release', description: 'Targets the fascia — connective tissue surrounding muscles. Uses slow sustained pressure to release restrictions and restore movement.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 9 },
  { category: 'massageStyles', name: 'Lymphatic Drainage', description: 'Uses light rhythmic strokes to stimulate lymphatic fluid flow and assist the body in removing toxins and waste.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 10 },
  { category: 'massageStyles', name: 'Manual Lymphatic Drainage (MLD)', description: 'Clinical version of lymphatic drainage performed by therapists with specialist training. Recommended after surgery, injury or cancer treatment.', visibleTo: ['spa'], launchActive: true, sortOrder: 11 },
  { category: 'massageStyles', name: 'Craniosacral', description: 'Extremely gentle technique working with the craniosacral system — membranes and fluid surrounding the brain and spinal cord.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 12 },
  { category: 'massageStyles', name: 'Remedial', description: 'Targeted therapeutic massage to treat specific musculoskeletal conditions, injuries or postural imbalances. Includes assessment and treatment planning.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 13 },
  { category: 'massageStyles', name: 'Neuromuscular Therapy (NMT)', description: 'Specialised form of manual therapy addressing nerve and muscle interaction. Used to treat chronic pain, postural dysfunction and nerve compression.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 14 },
  { category: 'massageStyles', name: 'Acupressure', description: 'Based on Traditional Chinese Medicine. Applies firm pressure to specific points along energy meridians to relieve pain and restore balance.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 15 },
  { category: 'massageStyles', name: 'Reflexology', description: 'Applies pressure to specific points on the feet, hands or ears corresponding to organs and systems throughout the body.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 16 },
  { category: 'massageStyles', name: 'Cupping Therapy', description: 'Uses silicone or glass cups to create suction on the skin. Draws blood to the surface, loosens fascia and relieves muscle tension.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 17 },
  { category: 'massageStyles', name: 'Gua Sha', description: 'Ancient Chinese healing technique using a smooth-edged tool to scrape the skin in short strokes. Stimulates microcirculation and reduces inflammation.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 18 },
  { category: 'massageStyles', name: 'Reiki', description: 'Japanese energy healing technique. Practitioner channels universal energy through light touch or hands held above the body.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 19 },
  { category: 'massageStyles', name: 'Four Hands Massage', description: 'Two qualified therapists work simultaneously on one client using synchronised strokes across the full body. Performed in a professional spa environment.', visibleTo: ['spa'], launchActive: true, sortOrder: 20 },
  { category: 'massageStyles', name: 'Rolfing / Structural Integration', description: 'A series of deep fascial manipulation sessions designed to realign the whole body and improve posture, flexibility and energy levels.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 21 },
  { category: 'massageStyles', name: 'Bamboo Massage', description: 'Heated bamboo canes used as an extension of the therapist\'s hands. Provides deep muscle relaxation similar to hot stone but with more precision.', visibleTo: ['spa'], launchActive: true, sortOrder: 22 },
  { category: 'massageStyles', name: 'Abhyanga', description: 'A specific Ayurvedic full-body oil massage using warmed herbal oils. Rhythmic strokes nourish the skin, calm the nervous system and balance the doshas.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 23 },
  { category: 'massageStyles', name: 'Oncology Massage', description: 'Specially adapted for people affected by cancer. Requires advanced training. Very gentle techniques adapted to patient treatment stage.', visibleTo: ['spa'], launchActive: true, sortOrder: 24 },
  { category: 'massageStyles', name: 'Geriatric Massage', description: 'Adapted for older adults. Gentle shorter sessions with careful attention to arthritis, osteoporosis and reduced skin elasticity.', visibleTo: ['spa'], launchActive: true, sortOrder: 25 },
  { category: 'massageStyles', name: 'Chair Massage', description: 'Short clothed massage in a specially designed chair. Therapist works on back, neck, shoulders, arms and scalp. Popular at workplaces and events.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 26 },
  { category: 'massageStyles', name: 'Floatation Therapy', description: 'Client floats in a pod filled with warm, highly salted water in complete silence and darkness. Deeply meditative and restorative.', visibleTo: ['spa'], launchActive: true, sortOrder: 27 },
  { category: 'massageStyles', name: 'Tantric', description: 'A sensual, energy-based practice rooted in ancient traditions. Non-sexual. Focuses on breathwork, body awareness and energy flow between practitioner and client.', visibleTo: ['therapist'], launchActive: true, sortOrder: 28 },

  // ── TRADITIONS ──────────────────────────────────────────────
  { category: 'traditions', name: 'Thai', description: 'Combines acupressure, assisted yoga stretches and energy line work. Client is fully clothed on a floor mat.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 1 },
  { category: 'traditions', name: 'Shiatsu', description: 'Applies rhythmic pressure to specific points along energy pathways using fingers, thumbs, palms and elbows. Performed fully clothed on a floor mat.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 2 },
  { category: 'traditions', name: 'Ayurvedic', description: 'Based on ancient Indian medicine. Uses warm herbal oils and techniques tailored to the client\'s body type (dosha).', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 3 },
  { category: 'traditions', name: 'Indian Head Massage', description: 'Part of the Ayurvedic tradition. Focuses on scalp, neck, shoulders and face. Firm pressure and gentle strokes to relieve tension, headaches and stress.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 4 },
  { category: 'traditions', name: 'Chinese Tuina', description: 'One of the oldest forms of massage. Part of Traditional Chinese Medicine. Uses kneading, pressing, rolling and joint manipulation to stimulate meridians.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 5 },
  { category: 'traditions', name: 'Balinese', description: 'Combines acupressure, skin rolling, gentle stretches and aromatherapy. Uses palms, fingers, knuckles and forearms for a full-body treatment.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 6 },
  { category: 'traditions', name: 'Javanese', description: 'Indonesian tradition distinct from Balinese. Uses deep knuckle kneading, firm pressure strokes and the traditional boreh body scrub.', visibleTo: ['spa'], launchActive: true, sortOrder: 7 },
  { category: 'traditions', name: 'Lomi Lomi', description: 'The loving hands massage. Uses long flowing forearm strokes based on the Hawaiian philosophy of Huna — harmony is essential to wellbeing.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 8 },
  { category: 'traditions', name: 'Kahuna', description: 'Advanced form of Lomi Lomi. Uses full forearm and bodyweight techniques in a rhythmic dance-like flow. Deeply relaxing and transformative.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 9 },
  { category: 'traditions', name: 'African Traditional', description: 'Ubuntu-inspired bodywork rooted in indigenous African healing traditions. Uses local plant-based oils, rhythmic pressure and community-centred healing philosophy.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 10 },
  { category: 'traditions', name: 'Tibetan', description: 'Combines Tibetan singing bowl sound therapy with acupressure and energy work. Bowls placed on or near the body promote deep relaxation and energetic rebalancing.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 11 },

  // ── TREATMENTS ──────────────────────────────────────────────
  { category: 'treatments', name: 'Full Body', description: 'A complete massage covering the entire body — back, legs, arms, neck, shoulders, feet and sometimes abdomen. Typically 60–90 minutes.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 1 },
  { category: 'treatments', name: 'Back & Neck', description: 'Focuses on the back and neck only. Typically 30–45 minutes. Popular for office workers and those with postural tension.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 2 },
  { category: 'treatments', name: 'Back & Shoulders', description: 'Targets the upper and lower back, shoulders and shoulder blades. Ideal for releasing tension from sitting or physical work.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 3 },
  { category: 'treatments', name: 'Neck & Shoulders', description: 'A shorter focused treatment on the neck and shoulder area. Good for headache relief and desk workers.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 4 },
  { category: 'treatments', name: 'Indian Head', description: 'Head, scalp, face, neck and upper shoulders. Can be done seated and clothed. Often performed without oil.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 5 },
  { category: 'treatments', name: 'Scalp Massage', description: 'Focused treatment on the scalp using circular pressure and gentle strokes. Improves blood flow, relieves headaches and promotes hair health.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 6 },
  { category: 'treatments', name: 'Legs & Feet', description: 'Focuses on the lower limbs including calf muscles, hamstrings, feet and ankles. Popular for runners and those who stand for long periods.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 7 },
  { category: 'treatments', name: 'Hands & Arms', description: 'Targets the forearms, wrists, hands and fingers. Beneficial for people who work with their hands — typing, manual labour, sports.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 8 },
  { category: 'treatments', name: 'Foot Massage', description: 'Focused treatment on the feet using massage techniques — distinct from Reflexology. Includes sole, heel and toe work.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 9 },
  { category: 'treatments', name: 'Facial', description: 'Skin treatment for the face combining cleansing, exfoliation, masks and massage. Usually performed by a trained somatologist or beauty therapist.', visibleTo: ['spa'], launchActive: true, sortOrder: 10 },
  { category: 'treatments', name: 'Eye Treatment', description: 'Targeted spa treatment for the eye area — depuffing, dark circle treatment, cooling masks.', visibleTo: ['spa'], launchActive: true, sortOrder: 11 },
  { category: 'treatments', name: 'Body Scrub / Exfoliation', description: 'Removes dead skin cells using a scrub medium applied to the body before or after massage. Leaves skin smooth and refreshed.', visibleTo: ['spa'], launchActive: true, sortOrder: 12 },
  { category: 'treatments', name: 'Body Wrap', description: 'The body is coated in therapeutic product and wrapped in warm sheets to promote detoxification and hydration.', visibleTo: ['spa'], launchActive: true, sortOrder: 13 },
  { category: 'treatments', name: 'Hydrotherapy', description: 'Water-based treatments including baths, jets, steam and immersion therapies used to enhance the massage experience or as a standalone treatment.', visibleTo: ['spa'], launchActive: true, sortOrder: 14 },
  { category: 'treatments', name: 'Manicure', description: 'Cosmetic treatment for the hands and nails — filing, cuticle care, polish. Often offered at spas alongside massage.', visibleTo: ['spa'], launchActive: true, sortOrder: 15 },
  { category: 'treatments', name: 'Pedicure', description: 'Cosmetic treatment for the feet and toenails — soaking, filing, cuticle care, callus removal and polish.', visibleTo: ['spa'], launchActive: true, sortOrder: 16 },
  { category: 'treatments', name: 'Waxing', description: 'Hair removal using warm or hot wax. Commonly offered at spas alongside massage and beauty treatments.', visibleTo: ['spa'], launchActive: true, sortOrder: 17 },

  // ── CLASSIFICATION ──────────────────────────────────────────
  { category: 'classification', name: 'Therapeutic Massage', description: 'You focus on physical health and pain relief. Your work is clinical and results-driven.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 1 },
  { category: 'classification', name: 'Holistic', description: 'You work with the whole person — body, mind and energy. Your approach is wellness-focused.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 2 },
  { category: 'classification', name: 'Beauty & Wellness', description: 'You offer pampering and beauty treatments alongside massage. Often spa or salon based.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 3 },

  // ── SERVICE OFFERINGS ───────────────────────────────────────
  { category: 'serviceOfferings', name: 'Couples Massage', description: 'Two people receive massages simultaneously, usually in the same room. Popular for partners, friends or mother-daughter bookings.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 1 },
  { category: 'serviceOfferings', name: 'Mobile / House Call', description: 'The therapist travels to the client\'s home, office or accommodation. Client does not need to travel.', visibleTo: ['therapist'], launchActive: true, sortOrder: 2 },
  { category: 'serviceOfferings', name: 'Outcall / Hotel Visit', description: 'Therapist travels to a hotel, guesthouse or Airbnb. Relevant for tourism and business travel markets.', visibleTo: ['therapist'], launchActive: true, sortOrder: 3 },
  { category: 'serviceOfferings', name: 'Corporate / Workplace', description: 'Massage delivered at a workplace or corporate event. Usually chair massage or short sessions. Booked by a company for staff.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 4 },
  { category: 'serviceOfferings', name: 'Corporate / Spa Day', description: 'A company arranges for staff or management to visit the spa for a full or half day experience. Booked as a group.', visibleTo: ['spa'], launchActive: true, sortOrder: 5 },
  { category: 'serviceOfferings', name: 'Group Booking', description: 'A booking for three or more people at the same time. Popular for hen parties, birthdays, team events.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 6 },
  { category: 'serviceOfferings', name: 'Birthday Package', description: 'A specially arranged session or set of treatments for a birthday celebration. May include extras like champagne or gift wrap.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 7 },
  { category: 'serviceOfferings', name: 'Wellness Package', description: 'A bundled multi-session package covering several treatments or visits, sold as a single purchase.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 8 },
  { category: 'serviceOfferings', name: 'Full Day Spa', description: 'A full day experience at the spa including multiple treatments, use of facilities, and usually lunch.', visibleTo: ['spa'], launchActive: true, sortOrder: 9 },
  { category: 'serviceOfferings', name: 'Half Day Spa', description: 'A half-day experience including two or more treatments and use of spa facilities.', visibleTo: ['spa'], launchActive: true, sortOrder: 10 },
  { category: 'serviceOfferings', name: 'Kiddies Spa', description: 'Gentle age-appropriate treatments for children. Supervised by a parent or guardian. Suitable for special occasions.', visibleTo: ['spa'], launchActive: true, sortOrder: 11 },
  { category: 'serviceOfferings', name: 'Gift Voucher', description: 'A voucher purchased as a gift that can be redeemed for any treatment or package. No fixed appointment at time of purchase.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 12 },
  { category: 'serviceOfferings', name: 'Membership / Package', description: 'A subscription or prepaid package offering discounted treatments over a period of time.', visibleTo: ['therapist', 'spa'], launchActive: true, sortOrder: 13 },
];

async function seedOfferings() {
  console.log(`Seeding ${offerings.length} offerings to Firestore...`);
  const batch = db.batch();
  offerings.forEach((item) => {
    const ref = db.collection('offerings').doc();
    batch.set(ref, {
      ...item,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  await batch.commit();
  console.log('Done. offerings collection populated.');
  process.exit(0);
}

seedOfferings().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
