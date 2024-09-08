import { admin, db } from '@/firebase/admin';
import {
  IDistributeContract,
  IDistributeInfo,
  ROLE,
} from '@/models/distribute.model';
import { IProduct } from '@/models/product.model';
import { ISerialize } from '@/models/serialize.model';
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
    if (req.method === 'POST') {
      const { status, product, serial, receiver } = req.body;
      await serials.doc(serial).update({ updated: Date.now(), status });
      const [productData, serialData] = await Promise.all([
        (await products.doc(product).get()).data() as IProduct,
        (await serials.doc(serial).get()).data() as ISerialize,
      ]);
      const distributeInfo: IDistributeInfo = {
        from: {
          address: '',
          company: productData.manufacturer,
          role: ROLE.MANUFACTURER,
        },
        to: { ...receiver, role: ROLE.DISTRIBUTOR },
        serials: serialData.serials,
        date: new Date().toISOString(),
      };
      const { id } = await distributes.add({
        product: product,
        serialize: serial,
        distributes: [distributeInfo],
      } as IDistributeContract);
      const [productHash, serialHash, distributeHash] = await Promise.all([
        ethers.hashMessage(JSON.stringify(productData)),
        ethers.hashMessage(JSON.stringify(serialData)),
        ethers.hashMessage(JSON.stringify(distributeInfo)),
      ]);
      res.status(201).json({
        message: 'Create new distribution successfully',
        data: { id, productHash, serialHash, distributeHash },
      });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
