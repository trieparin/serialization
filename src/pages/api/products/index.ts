import { admin, db } from '@/firebase/admin';
import { IProduct } from '@/models/product.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const products = db.collection('products');
    if (req.method === 'GET') {
      const data: IProduct[] = [];
      const snapshot = await products.get();
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...(doc.data() as IProduct) });
      });
      res.status(200).json({ data });
    } else if (req.method === 'POST') {
      await products.add(req.body);
      res.status(201).json({ message: 'Create new product successfully' });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
