import { admin, db } from '@/firebase/admin';
import { IProduct } from '@/models/product.model';
import { ISerialize } from '@/models/serialize.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    if (req.method === 'GET') {
      const { year } = req.query;
      const products: IProduct[] = [];
      const serials: ISerialize[] = [];
      const start = Date.parse(`${year}-01-01`);
      const end = Date.parse(`${year}-12-31`);
      const productSnap = await db
        .collection('products')
        .where('created', '>=', start)
        .where('created', '<=', end)
        .get();
      productSnap.forEach((doc) => products.push(doc.data() as IProduct));
      const serialSnap = await db
        .collection('serials')
        .where('created', '>=', start)
        .where('created', '<=', end)
        .get();
      serialSnap.forEach((doc) => serials.push(doc.data() as ISerialize));
      res.status(200).json({ products, serials });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
