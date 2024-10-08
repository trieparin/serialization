import { admin, db } from '@/firebase/admin';
import { PAGE_SIZE } from '@/models/form.model';
import { ISerialize } from '@/models/serialize.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const serials = db.collection('serials');
    if (req.method === 'GET') {
      const data: ISerialize[] = [];
      const { label, status, offset } = req.query;
      if (label && status) {
        if (offset) {
          const snapshot = await serials
            .where('status', '==', status)
            .where('label', '>=', label)
            .where('label', '<=', `${label}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as ISerialize) });
          });
        } else {
          const snapshot = await serials
            .where('status', '==', status)
            .where('label', '>=', label)
            .where('label', '<=', `${label}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as ISerialize) });
          });
        }
      } else if (label) {
        if (offset) {
          const snapshot = await serials
            .where('label', '>=', label)
            .where('label', '<=', `${label}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as ISerialize) });
          });
        } else {
          const snapshot = await serials
            .where('label', '>=', label)
            .where('label', '<=', `${label}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as ISerialize) });
          });
        }
      } else {
        if (offset) {
          const snapshot = await serials
            .where('status', '==', status)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as ISerialize) });
          });
        } else {
          const snapshot = await serials
            .where('status', '==', status)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as ISerialize) });
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
