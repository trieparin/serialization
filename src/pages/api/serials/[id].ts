import { admin, db } from '@/firebase/admin';
import { ProductStatus } from '@/models/product.model';
import { ethers } from 'ethers';
import { FieldValue } from 'firebase-admin/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const serials = db.collection('serials');
    const products = db.collection('products');
    const { id } = req.query;
    switch (req.method) {
      case 'GET': {
        const doc = await serials.doc(id as string).get();
        res.status(200).json({ data: doc.exists && doc.data() });
        break;
      }
      case 'PATCH': {
        await serials
          .doc(id as string)
          .update({ ...req.body, updated: Date.now() });
        const serial = (await serials.doc(id as string).get()).data();
        const product = (await products.doc(serial?.product).get()).data();
        const [productHash, serialHash] = await Promise.all([
          ethers.hashMessage(JSON.stringify(product)),
          ethers.hashMessage(JSON.stringify(serial)),
        ]);
        res.status(200).json({
          message: 'Update serials status successfully',
          data: { productHash, serialHash },
        });
        break;
      }
      case 'DELETE': {
        const serial = serials.doc(id as string);
        const product = (await serial.get()).data();
        await db.collection('products').doc(product?.product).update({
          status: ProductStatus.APPROVED,
          serial: FieldValue.delete(),
          updated: Date.now(),
        });
        await serial.delete();
        res.status(200).json({ message: 'Delete serials successfully' });
        break;
      }
      default:
        res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
