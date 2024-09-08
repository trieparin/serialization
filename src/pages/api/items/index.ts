import { admin, db } from '@/firebase/admin';
import { PAGE_SIZE } from '@/models/form.model';
import { IItem } from '@/models/inventory.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const items = db.collection('items');
    if (req.method === 'GET') {
      const data: IItem[] = [];
      const { offset } = req.query;
      const amount = await items.orderBy('type').count().get();
      const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
      if (offset) {
        const snapshot = await items
          .orderBy('type')
          .limit(PAGE_SIZE.PER_PAGE)
          .offset(parseInt(offset as string))
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as IItem) });
        });
      } else {
        const snapshot = await items
          .orderBy('type')
          .limit(PAGE_SIZE.PER_PAGE)
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as IItem) });
        });
      }
      res.status(200).json({ data, total });
    } else if (req.method === 'POST') {
      await items.add(req.body);
      res.status(201).json({ message: 'Create new item successfully' });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
