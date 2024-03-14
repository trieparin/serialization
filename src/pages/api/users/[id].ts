import { admin, db } from '@/firebase/admin';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = db.collection('/users');
  switch (req.method) {
    case 'GET':
      try {
        const { id } = req.query;
        const doc = await users.doc(id as string).get();
        res.status(200).json({ data: doc.exists && doc.data() });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'PUT':
      try {
        const { id } = req.query;
        const password = req.body;
        await admin.updateUser(id as string, password);
        res.status(200).json({ message: 'Change password successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'PATCH':
      try {
        const { id } = req.query;
        const data = req.body;
        await users.doc(id as string).update(data);
        if (data.displayName) {
          await admin.updateUser(id as string, {
            displayName: data.displayName,
          });
        }
        if (data.role) {
          await admin.setCustomUserClaims(id as string, { role: data.role });
        }
        res.status(200).json({ message: 'Update user info successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    case 'DELETE':
      try {
        const { id } = req.query;
        await admin.deleteUser(id as string);
        await users.doc(id as string).delete();
        res.status(200).json({ message: 'Delete user successfully' });
      } catch (e) {
        res.status(500).json({});
      }
      break;
    default:
      res.status(400).json({});
      break;
  }
}
