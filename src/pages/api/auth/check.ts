import { auth, db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400);
  try {
    if (auth.currentUser) {
      const snapshot = await getDoc(doc(db, 'users', auth.currentUser.uid));
      const role = snapshot.exists() && snapshot.get('role');
      res
        .status(200)
        .json({
          uid: auth.currentUser.uid,
          displayName: auth.currentUser.displayName,
          role: role,
        });
    } else {
      res.status(200).json({ data: null });
    }
  } catch (err) {
    throw err;
  }
}
