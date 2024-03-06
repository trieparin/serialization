import { auth } from '@/firebase/config';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      await signOut(auth);
      res.status(200).json({});
    } catch (e) {
      res.status(500);
    }
  } else if (req.method === 'POST') {
    try {
      const { email, password } = req.body;
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      res.status(200).json({ data: user.refreshToken });
    } catch (e) {
      res.status(500);
    }
  } else {
    res.status(400);
  }
}
