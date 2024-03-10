import { db } from '@/firebase/config';
import { IProduct } from '@/models/product.model';
import { addDoc, collection, getDocs } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const snapshot = await getDocs(collection(db, 'products'));
      const products: IProduct[] = [];
      snapshot.forEach((doc) => {
        products.push({ id: doc.id, ...(doc.data() as IProduct) });
      });
      res.status(200).json({ data: products });
    } catch (e) {
      res.status(500).json({});
    }
  } else if (req.method === 'POST') {
    try {
      const data = req.body;
      await addDoc(collection(db, 'products'), data);
      res.status(201).json({ message: 'Create product successfully' });
    } catch (e) {
      res.status(500).json({});
    }
  } else {
    res.status(400).json({});
  }
}
