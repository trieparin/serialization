import { db, tempAuth } from '@/firebase/config';
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') res.status(400);
  try {
    const { email, password, firstName, lastName, role } = req.body;
    const { user } = await createUserWithEmailAndPassword(
      tempAuth,
      email,
      password
    );
    await updateProfile(user, {
      displayName: `${firstName} ${lastName.charAt(0)}.`,
    });
    await setDoc(doc(db, 'users', user.uid), {
      email,
      firstName,
      lastName,
      role,
    });
    await signOut(tempAuth);
    res.status(200).json({ message: 'Create New User Successfully' });
  } catch (err) {
    throw err;
  }
}
