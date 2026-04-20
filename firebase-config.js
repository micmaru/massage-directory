/**
 * firebase-config.js — shared Firebase initialisation.
 *
 * Fill in the three REPLACE_ values from:
 *   Firebase Console → Project Settings → Your apps → Web app → SDK setup
 */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js';
import { getFirestore }  from 'https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyDRU0AYJDe33Qnj1wLlbpV0_DptgG9k-qo',
  authDomain:        'massage-directory-57e19.firebaseapp.com',
  projectId:         'massage-directory-57e19',
  storageBucket:     'massage-directory-57e19.firebasestorage.app',
  messagingSenderId: '594672589028',
  appId:             '1:594672589028:web:1e5255001882665e0534f1',
};

export const app = initializeApp(firebaseConfig);
export const db  = getFirestore(app);

window.GOOGLE_MAPS_API_KEY = 'REPLACE_WITH_YOUR_GOOGLE_MAPS_API_KEY';
