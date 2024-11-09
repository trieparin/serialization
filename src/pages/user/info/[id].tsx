import { PageTitle, UserForm } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import { auth } from '@/firebase/config';
import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { formChangeValue } from '@/helpers/form.helper';
import { BaseLayout } from '@/layouts';
import { IFormMessage } from '@/models/form.model';
import { IUser, IUserForm, ROLE } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { signOut } from 'firebase/auth';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { useContext } from 'react';

interface UserInfoProps {
  params: ParsedUrlQuery;
  data: IUser;
}

export default function UserInfo({ params, data }: UserInfoProps) {
  const router = useRouter();
  const profile = useContext(UserContext);

  const formSubmit = async (value: IUserForm, change?: object) => {
    try {
      const { password, firstName, lastName, role } = value;
      const user: Record<string, string> = formChangeValue(change!, {
        firstName,
        lastName,
        role,
      });
      delete user.pwd;
      delete user.password;
      const fch = customFetch();
      if (Object.keys(user).length) {
        const displayName = `${firstName} ${lastName?.charAt(0)}.`;
        if (data?.displayName !== displayName) {
          user.displayName = displayName;
        }
        if (data?.role !== role && profile.role === ROLE.ADMIN) {
          user.role = role as ROLE;
        }
        const { message }: IFormMessage = await fch.patch(
          `/users/${params.id}`,
          user
        );
        toaster.success(message);
      }
      if (password) {
        const { message }: IFormMessage = await fch.put(`/users/${params.id}`, {
          password,
        });
        if (profile.uid === params.id) {
          toaster.success(message, {
            description: 'Please sign in again',
          });
          await signOut(auth);
          setCookie('token', '');
          router.push('/');
        } else {
          toaster.success(message);
        }
      }
      router.push(profile.role === ROLE.ADMIN ? '/user' : '/product');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Edit User Info" />
      <UserForm
        initForm={data}
        formSubmit={formSubmit}
        edit
      />
    </BaseLayout>
  );
}

export async function getServerSideProps({
  req,
  params,
}: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };

    const data = (
      await db
        .collection('users')
        .doc(params?.id as string)
        .get()
    ).data();

    return {
      props: {
        params,
        data,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
