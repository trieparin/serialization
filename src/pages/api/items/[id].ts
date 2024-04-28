import { admin, db } from '@/firebase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const items = db.collection('items');
    const { id } = req.query;
    if (req.method === 'DELETE') {
      await items.doc(id as string).delete();
      res.status(200).json({ message: 'Delete item successfully' });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
