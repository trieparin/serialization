import { db } from '@/firebase/config';
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
        const snapshot = await getDoc(doc(db, 'products', id as string));
        res.status(200).json({ data: snapshot.exists() && snapshot.data() });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'PATCH':
      try {
        const { id } = req.query;
        const data = req.body;
        await updateDoc(doc(db, 'products', id as string), data);
        res.status(200).json({ message: 'Update product info successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await deleteDoc(doc(db, 'products', id as string));
        res.status(200).json({ message: 'Delete product successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    default:
      res.status(400).json({});
      break;
  }
}
