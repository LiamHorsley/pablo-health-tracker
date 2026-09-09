import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Public client config — safe to expose. Data access is protected by
// Firestore security rules (locked to request.auth.uid), not by hiding this.
const firebaseConfig = {
  apiKey: 'AIzaSyCPTWLNH4oNdqgUr1nr_XHnOD24GD7C_D8',
  authDomain: 'pablo-health-tracker.firebaseapp.com',
  projectId: 'pablo-health-tracker',
  storageBucket: 'pablo-health-tracker.firebasestorage.app',
  messagingSenderId: '116745202343',
  appId: '1:116745202343:web:6622980cea07c17bbf8982',
}

export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
