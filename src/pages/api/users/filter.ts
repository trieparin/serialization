import { admin, db } from '@/firebase/admin';
import { PageSize } from '@/models/form.model';
import { IUserContext } from '@/models/user.model';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    await admin.verifyIdToken(req.cookies.token!);
    const users = db.collection('users');
    if (req.method === 'GET') {
      const { email, role, offset } = req.query;
      const data: IUserContext[] = [];
      if (email && role) {
        if (offset) {
          const snapshot = await users
            .where('role', '==', role)
            .where('email', '>=', email)
            .where('email', '<=', `${email}~`)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => data.push({ uid: doc.id, ...doc.data() }));
        } else {
          const snapshot = await users
            .where('role', '==', role)
            .where('email', '>=', email)
            .where('email', '<=', `${email}~`)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => data.push({ uid: doc.id, ...doc.data() }));
        }
      } else if (email) {
        if (offset) {
          const snapshot = await users
            .where('email', '>=', email)
            .where('email', '<=', `${email}~`)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => data.push({ uid: doc.id, ...doc.data() }));
        } else {
          const snapshot = await users
            .where('email', '>=', email)
            .where('email', '<=', `${email}~`)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => data.push({ uid: doc.id, ...doc.data() }));
        }
      } else {
        if (offset) {
          const snapshot = await users
            .where('role', '==', role)
            .limit(PageSize.PER_PAGE)
            .offset(parseInt(offset as string))
            .get();
          snapshot.forEach((doc) => data.push({ uid: doc.id, ...doc.data() }));
        } else {
          const snapshot = await users
            .where('role', '==', role)
            .limit(PageSize.PER_PAGE)
            .get();
          snapshot.forEach((doc) => data.push({ uid: doc.id, ...doc.data() }));
        }
      }
      res.status(200).json({ data });
    } else {
      res.status(400).json({});
    }
  } catch (e) {
    res.status(401).json({});
  }
}
