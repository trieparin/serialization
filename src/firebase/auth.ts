import { auth } from '@/firebase/config';
import customFetch from '@/helpers/fetch.helper';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const signUp = async (user: object) => {
  try {
    const fch = customFetch();
    const res: any = await fch.post('/api/users', user);
    return res;
  } catch (err) {
    throw err;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (err) {
    throw err;
  }
};
