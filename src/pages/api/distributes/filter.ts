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
      const { label, status, offset } = req.query;
      if (label) {
        if (offset) {
          const snapshot = await distributes
            .where('label', '>=', label)
            .where('label', '<=', `${label}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IDistribute) });
          });
        } else {
          const snapshot = await distributes
            .where('label', '>=', label)
            .where('label', '<=', `${label}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IDistribute) });
          });
        }
      } else {
        if (offset) {
          const snapshot = await distributes
            .where('status', '==', status)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IDistribute) });
          });
        } else {
          const snapshot = await distributes
            .where('status', '==', status)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IDistribute) });
          });
        }
      }
      res.status(200).json({ data });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
