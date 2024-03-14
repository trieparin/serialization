import {
  ServiceAccount,
  cert,
  getApp,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import serviceAccount from './serviceAccount.json';

const firebaseAdmin = {
  credential: cert(serviceAccount as ServiceAccount),
};

const app = getApps().length ? getApp() : initializeApp(firebaseAdmin);
export const admin = getAuth(app);
export const db = getFirestore(app);
