import { admin, db } from '@/firebase/admin';
import { IDistribute } from '@/models/distribute.model';
import { PAGE_SIZE } from '@/models/form.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const distributes = db.collection('distributes');
    if (req.method === 'GET') {
      const data: IDistribute[] = [];
      const { offset, sort } = req.query;
      const amount = await distributes
        .orderBy(sort as string, 'desc')
        .count()
        .get();
      const total = Math.ceil(amount.data().count / PAGE_SIZE.PER_PAGE);
      if (offset) {
        const snapshot = await distributes
          .orderBy(sort as string, 'desc')
          .limit(PAGE_SIZE.PER_PAGE)
          .offset(parseInt(offset as string))
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as IDistribute) });
        });
      } else {
        const snapshot = await distributes
          .orderBy(sort as string, 'desc')
          .limit(PAGE_SIZE.PER_PAGE)
          .get();
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...(doc.data() as IDistribute) });
        });
      }
      res.status(200).json({ data, total });
    } else if (req.method === 'POST') {
      const now = Date.now();
      const { label, contract, product, serialize, catalogs, info } = req.body;
      const { id } = await distributes.add({
        created: now,
        updated: now,
        distributes: [{ ...info, date: new Date().toISOString() }],
        catalogs,
        serialize,
        product,
        contract,
        label,
      });
      res.status(201).json({
        message: 'Create new distribution successfully',
        data: { id },
      });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
