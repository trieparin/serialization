import { admin, db } from '@/firebase/admin';
import { PAGE_SIZE } from '@/models/form.model';
import { PRODUCT_STATUS } from '@/models/product.model';
import { ISerialize } from '@/models/serialize.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const serials = db.collection('serials');
    const products = db.collection('products');
    if (req.method === 'GET') {
      const data: ISerialize[] = [];
      const { offset, sort } = req.query;
      const amount = await serials
        .orderBy(sort as string, 'desc')
        .count()
        .get();
      const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
      if (offset) {
        const snapshot = await serials
          .orderBy(sort as string, 'desc')
          .limit(PAGE_SIZE.PER_PAGE)
          .offset(parseInt(offset as string))
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as ISerialize) });
        });
      } else {
        const snapshot = await serials
          .orderBy(sort as string, 'desc')
          .limit(PAGE_SIZE.PER_PAGE)
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as ISerialize) });
        });
      }
      res.status(200).json({ data, total });
    } else if (req.method === 'POST') {
      const now = Date.now();
      const { product } = req.body;
      const { id } = await serials.add({
        ...req.body,
        created: now,
        updated: now,
      });
      await products.doc(product).update({
        status: PRODUCT_STATUS.SERIALIZED,
        serial: id,
        updated: now,
      });
      res.status(201).json({ message: 'Create new serialize successfully' });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
