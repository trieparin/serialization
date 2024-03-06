import { db } from '@/firebase/config';
import { deleteDoc, doc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      try {
        const { id } = req.query;
        const snapshot = await getDoc(doc(db, 'users', id as string));
        res.status(200).json({ data: snapshot.exists() && snapshot.data() });
      } catch (e) {
        res.status(500);
      }
      break;
    case 'PATCH':
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await deleteDoc(doc(db, 'users', id as string));
        res.status(200).json({ message: 'Delete User Successfully' });
      } catch (e) {
        res.status(500);
      }
      break;
    default:
      res.status(400);
      break;
  }
}
