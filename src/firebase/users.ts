import { db } from '@/firebase/config';
import { IUser } from '@/models/user.model';
import { collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

export const createUser = async ({ uid, firstName, lastName, role }: IUser) => {
  try {
    await setDoc(doc(db, 'users', uid as string), {
      firstName,
      lastName,
      role,
    });
  } catch (error) {}
};

export const getUser = async (uid: string) => {
  try {
    const snapshot = await getDoc(doc(db, 'users', uid));
    return snapshot.exists() && snapshot.data();
  } catch (err) {
    throw err;
  }
};

export const getAllUsers = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'users'));
    const users: IUser[] = [];
    snapshot.forEach((doc) => {
      const data = { ...doc.data() };
      users.push({
        uid: doc.id,
        ...data,
      });
    });
    return users;
  } catch (err) {
    throw err;
  }
};
