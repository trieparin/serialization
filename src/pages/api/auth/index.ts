import { auth } from '@/firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
} from 'firebase/auth';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        await signOut(auth);
        res.status(200).json({});
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'POST':
      try {
        const { email, password } = req.body;
        const { user } = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        res.status(200).json({ data: user.refreshToken });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'PUT':
      try {
        const { password } = req.body;
        await updatePassword(auth.currentUser!, password);
        await signOut(auth);
        res.status(200).json({ message: 'Change password successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    default:
      res.status(400).json({});
      break;
  }
}
