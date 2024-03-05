import { auth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400);
  try {
    await signOut(auth);
    res.status(200).json({});
  } catch (err) {
    throw err;
  }
}
