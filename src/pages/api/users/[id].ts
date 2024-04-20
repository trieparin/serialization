import { admin, db } from '@/firebase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const users = db.collection('users');
    const { id } = req.query;
    switch (req.method) {
      case 'GET': {
        const doc = await users.doc(id as string).get();
        res.status(200).json({ data: doc.exists && doc.data() });
        break;
      }
      case 'PUT':
        await admin.updateUser(id as string, req.body);
        res.status(200).json({ message: 'Change password successfully' });
        break;
      case 'PATCH':
        await users.doc(id as string).update(req.body);
        if (req.body.displayName) {
          await admin.updateUser(id as string, {
            displayName: req.body.displayName,
          });
        }
        if (req.body.role) {
          await admin.setCustomUserClaims(id as string, {
            role: req.body.role,
          });
        }
        res.status(200).json({ message: 'Update user info successfully' });
        break;
      case 'DELETE':
        await admin.deleteUser(id as string);
        await users.doc(id as string).delete();
        res.status(200).json({ message: 'Delete user successfully' });
        break;
      default:
        res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
