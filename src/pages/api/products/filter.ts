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
      const { batch, name, status, offset } = req.query;
      if (batch && status) {
        if (offset) {
          const snapshot = await products
            .where('status', '==', status)
            .where('batch', '>=', batch)
            .where('batch', '<=', `${batch}~`)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        } else {
          const snapshot = await products
            .where('status', '==', status)
            .where('batch', '>=', batch)
            .where('batch', '<=', `${batch}~`)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        }
      } else if (name && status) {
        if (offset) {
          const snapshot = await products
            .where('status', '==', status)
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        } else {
          const snapshot = await products
            .where('status', '==', status)
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        }
      } else if (batch) {
        if (offset) {
          const snapshot = await products
            .where('batch', '>=', batch)
            .where('batch', '<=', `${batch}~`)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        } else {
          const snapshot = await products
            .where('batch', '>=', batch)
            .where('batch', '<=', `${batch}~`)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        }
      } else if (name) {
        if (offset) {
          const snapshot = await products
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        } else {
          const snapshot = await products
            .where('name', '>=', name)
            .where('name', '<=', `${name}~`)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        }
      } else {
        if (offset) {
          const snapshot = await products
            .where('status', '==', status)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
          });
        } else {
          const snapshot = await products
            .where('status', '==', status)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => {
            data.push({ id: doc.id, ...(doc.data() as IProduct) });
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
