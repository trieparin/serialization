import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') res.status(400);
  try {
    const { email, password } = req.body;
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    res.status(200).json({ data: user.refreshToken });
  } catch (e) {
    res.status(500);
  }
}
