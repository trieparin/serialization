import { admin, db } from '@/firebase/admin';
import { IUser } from '@/models/user.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const users = db.collection('/users');
  if (req.method === 'GET') {
    try {
      const data: IUser[] = [];
      const snapshot = await users.get();
      snapshot.forEach((doc) =>
        data.push({
          uid: doc.id,
          ...doc.data(),
        })
      );
      res.status(200).json({ data });
    } catch (e) {
      res.status(500).json({});
    }
  } else if (req.method === 'POST') {
    try {
      const { email, password, firstName, lastName, role } = req.body;
      const { uid } = await admin.createUser({
        displayName: `${firstName} ${lastName.charAt(0)}.`,
        email,
        password,
      });
      await admin.setCustomUserClaims(uid, { role });
      await users.doc(uid).set({
        displayName: `${firstName} ${lastName.charAt(0)}.`,
        firstName,
        lastName,
        email,
        role,
      });
      res.status(201).json({ message: 'Create new user successfully' });
    } catch (e) {
      res.status(500).json({});
    }
  } else {
    res.status(400).json({});
  }
}
