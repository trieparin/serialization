import { db } from '@/firebase/admin';
import { IProduct } from '@/models/product.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const products = db.collection('/products');
  if (req.method === 'GET') {
    try {
      const data: IProduct[] = [];
      const snapshot = await products.get();
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...(doc.data() as IProduct) });
      });
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json({});
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      await products.add(data);
      res.status(201).json({ message: 'Create new product successfully' });
    } catch (e) {
      res.status(500).json({});
    }
  } else {
    res.status(400).json({});
  }
}
