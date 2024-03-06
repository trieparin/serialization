import { auth, db } from '@/firebase/config';
import { IUser } from '@/models/user.model';
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const users: IUser[] = [];
      snapshot.forEach((doc) => {
        users.push({
          uid: doc.id,
          ...doc.data(),
        });
      });
      res.status(200).json({ data: users });
    } catch (e) {
      res.status(500);
    }
  } else if (req.method === 'POST') {
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
        email,
        firstName,
        lastName,
        role,
      });
      await signOut(auth);
      res.status(200).json({ message: 'Create New User Successfully' });
    } catch (e) {
      res.status(500);
    }
  } else {
    res.status(400);
  }
}
