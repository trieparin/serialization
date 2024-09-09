import { admin, db } from '@/firebase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const distributes = db.collection('distributes');
    if (req.method === 'POST') {
      const { contract, product, serialize, info } = req.body;
      const { id } = await distributes.add({
        distributes: [{ ...info, date: new Date().toISOString() }],
        serialize,
        product,
        contract,
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