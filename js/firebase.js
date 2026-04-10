// ════════════════════════════════════════════════════════════
// DACEWAV.STORE — Firebase Init (Modular SDK v9 ESM)
// ════════════════════════════════════════════════════════════

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js';
import { getDatabase } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-database.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js';

const firebaseConfig = {
  apiKey: 'AIzaSyCr2dekkLLifIg0_JlLfEleaV32b5XdvIQ',
  authDomain: 'dacewav-store-3b0f5.firebaseapp.com',
  databaseURL: 'https://dacewav-store-3b0f5-default-rtdb.firebaseio.com',
  projectId: 'dacewav-store-3b0f5',
  storageBucket: 'dacewav-store-3b0f5.firebasestorage.app',
  messagingSenderId: '163354805352',
  appId: '1:163354805352:web:d8a99d1d71323de1ed27dd'
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

export { db, auth };
