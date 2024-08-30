import { admin, db } from '@/firebase/admin';
import { ethers } from 'ethers';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const serials = db.collection('serials');
    const products = db.collection('products');
    const distributes = db.collection('distributes');
    if (req.method === 'GET') {
      res.status(200).json({});
    } else if (req.method === 'POST') {
      const { status, serial, product } = req.body;
      await serials.doc(serial).update({ updated: Date.now(), status });
      const [productData, serialData] = await Promise.all([
        (await products.doc(product).get()).data(),
        (await serials.doc(serial).get()).data(),
      ]);
      const [productHash, serialHash] = await Promise.all([
        ethers.hashMessage(JSON.stringify(productData)),
        ethers.hashMessage(JSON.stringify(serialData)),
      ]);
      const { id } = await distributes.add({
        product: productData,
        serial: serialData,
      });
      res.status(201).json({
        message: 'Create new distribute successfully',
        data: { id, productHash, serialHash },
      });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
