import { db } from '@/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400);
  try {
    const { id } = req.query;
    const snapshot = await getDoc(doc(db, 'users', id as string));
    res.status(200).json({ data: snapshot.exists() && snapshot.data() });
  } catch (e) {
    res.status(500);
  }
}
