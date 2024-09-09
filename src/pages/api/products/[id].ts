import { admin, db } from '@/firebase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const products = db.collection('products');
    const { id } = req.query;
    switch (req.method) {
      case 'GET': {
        const doc = await products.doc(id as string).get();
        res.status(200).json({ data: doc.data() });
        break;
      }
      case 'PATCH': {
        await products
          .doc(id as string)
          .update({ ...req.body, updated: Date.now() });
        res.status(200).json({ message: 'Update product info successfully' });
        break;
      }
      case 'DELETE':
        await products.doc(id as string).delete();
        res.status(200).json({ message: 'Delete product successfully' });
        break;
      default:
        res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
