import { apiAuth } from '@/firebase/config';
import { signOut } from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400);
  try {
    await signOut(apiAuth);
    res.status(200).send('');
  } catch (err) {
    throw err;
  }
}
