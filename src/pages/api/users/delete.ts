import { db } from '@/firebase/config';
import { deleteDoc, doc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'PUT') res.status(400);
  try {
    const { id } = req.body;
    await deleteDoc(doc(db, 'users', id));
    res.status(200).json({ message: 'Delete User Successfully' });
  } catch (e) {
    res.status(500);
  }
}
