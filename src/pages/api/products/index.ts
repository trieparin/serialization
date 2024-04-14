import { admin, db } from '@/firebase/admin';
import { PageSize } from '@/models/form.model';
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
      const { offset } = req.query;
      const amount = await products.count().get();
      const total = Math.ceil(amount.data().count / PageSize.PER_PAGE);
      if (offset) {
        const snapshot = await products
          .limit(PageSize.PER_PAGE)
          .offset(parseInt(offset as string))
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as IProduct) });
        });
      } else {
        const snapshot = await products.limit(PageSize.PER_PAGE).get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as IProduct) });
        });
      }
      res.status(200).json({ data, total });
    } else if (req.method === 'POST') {
      const now = Date.now();
      await products.add({ ...req.body, created: now, updated: now });
      res.status(201).json({ message: 'Create new product successfully' });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
