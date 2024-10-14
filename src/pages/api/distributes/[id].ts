import { admin, db } from '@/firebase/admin';
import { MODE } from '@/models/distribute.model';
import { FieldValue } from 'firebase-admin/firestore';
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
        const { mode } = req.body;
        const now = Date.now();
        if (mode === MODE.CONFIRM) {
          const { update } = req.body;
          await distributes
            .doc(id as string)
            .update({ catalogs: update, updated: now });
        } else {
          const { catalogs, info } = req.body;
          const distribute = { ...info, date: new Date().toISOString() };
          await distributes
            .doc(id as string)
            .update({
              catalogs: catalogs,
              distributes: FieldValue.arrayUnion(distribute),
              updated: now,
            });
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
