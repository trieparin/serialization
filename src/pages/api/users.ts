import { db, firebaseConfig } from '@/firebase/config';
import { initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await updateProfile(user, {
        displayName: `${firstName} ${lastName.charAt(0)}.`,
      });
      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        role,
      });
      await signOut(auth);
      res.status(200).json({ message: 'Create New User Successfully' });
    } catch (err) {
      throw err;
    }
  } else if (req.method === 'PATCH') {
    // TODO: Add api handler for admin update user
    res.status(200).json({ message: 'Update User Info Successfully' });
  } else {
    res.status(400);
  }
}
