import { auth, db } from '@/firebase/config';
import { deleteUser, updateProfile } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') res.status(400).json({});
  try {
    if (auth.currentUser) {
      const snapshot = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (snapshot.exists()) {
        const { uid, email, displayName } = auth.currentUser;
        const { firstName, lastName, role }: any = snapshot.data();
        const updateName = `${firstName} ${lastName.charAt(0)}.`;
        if (displayName !== updateName) {
          await updateProfile(auth.currentUser, {
            displayName: updateName,
          });
        }
        res.status(200).json({
          displayName: updateName,
          uid,
          email,
          firstName,
          lastName,
          role,
        });
      } else {
        await deleteUser(auth.currentUser);
        res.status(401).json({});
      }
    }
  } catch (e) {
    res.status(500).json({});
  }
}
