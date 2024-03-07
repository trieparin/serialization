import { auth, db } from '@/firebase/config';
import { updatePassword } from 'firebase/auth';
import { deleteDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
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
        res.status(500).json({});
      }
      break;
    case 'PATCH':
      try {
        const { id } = req.query;
        const { password, ...update } = req.body;
        if (update) await updateDoc(doc(db, 'users', id as string), update);
        if (password) await updatePassword(auth.currentUser!, password);
        res.status(200).json({ message: 'Update user successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await deleteDoc(doc(db, 'users', id as string));
        res.status(200).json({ message: 'Delete user successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    default:
      res.status(400).json({});
      break;
  }
}
