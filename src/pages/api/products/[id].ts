import { db } from '@/firebase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const products = db.collection('/products');
  switch (req.method) {
    case 'GET':
      try {
        const { id } = req.query;
        const doc = await products.doc(id as string).get();
        res.status(200).json({ data: doc.exists && doc.data() });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'PATCH':
      try {
        const { id } = req.query;
        const data = req.body;
        await products.doc(id as string).update(data);
        res.status(200).json({ message: 'Update product info successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await products.doc(id as string).delete();
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
