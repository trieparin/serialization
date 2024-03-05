import { apiAuth, db } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') res.status(400);
  try {
    const { email, password } = req.body;
    const { user } = await signInWithEmailAndPassword(apiAuth, email, password);
    const snapshot = await getDoc(doc(db, 'users', user.uid));
    res.status(200).json({ data: snapshot.exists() && snapshot.data() });
  } catch (err) {
    throw err;
  }
}
