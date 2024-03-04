import { db } from '@/firebase/config';
import { IUser } from '@/models/user.model';
import { collection, getDocs } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400);
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
  } catch (err) {
    throw err;
  }
}
