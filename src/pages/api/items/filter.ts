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
      const { name, type, offset } = req.query;
      const data: IItem[] = [];
      if (name && type) {
        if (offset) {
          const snapshot = await items
            .where('type', '==', type)
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IItem) });
          });
        } else {
          const snapshot = await items
            .where('type', '==', type)
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IItem) });
          });
        }
      } else if (name) {
        if (offset) {
          const snapshot = await items
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IItem) });
          });
        } else {
          const snapshot = await items
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IItem) });
          });
        }
      } else {
        if (offset) {
          const snapshot = await items
            .where('type', '==', type)
            .limit(PAGE_SIZE.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IItem) });
          });
        } else {
          const snapshot = await items
            .where('type', '==', type)
            .limit(PAGE_SIZE.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IItem) });
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
