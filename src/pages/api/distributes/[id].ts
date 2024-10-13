import { admin, db } from '@/firebase/admin';
import { MODE } from '@/models/distribute.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const distributes = db.collection('distributes');
    const { id } = req.query;
    switch (req.method) {
      case 'GET': {
        const doc = await distributes.doc(id as string).get();
        res.status(200).json({ data: doc.data() });
        break;
      }
      case 'PATCH': {
        const { mode, data } = req.body;
        const [key, value] = Object.entries(data);
        if (mode === MODE.CONFIRM) {
          // TODO: Fix update firebase data
          await distributes
            .doc(id as string)
            .update({ [`catalogs.${key}`]: value });
        }
        res.status(200).json({ message: 'Update distribution successfully' });
        break;
      }
      default:
        res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
