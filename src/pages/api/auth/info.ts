import { auth, db } from '@/firebase/config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400);
  try {
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snapshot = await getDoc(doc(db, 'users', user.uid));
        const role = snapshot.exists() && snapshot.get('role');
        res.status(200).json({ user, role: role });
      } else {
        res.status(200).json({ data: null });
      }
    });
  } catch (err) {
    throw err;
  }
}
