import { PageTitle, UserForm } from '@/components';
import { admin } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IFormMessage } from '@/models/form.model';
import { IUserForm, Role } from '@/models/user.model';
import { toaster } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';

export default function UserCreate() {
  const init = {
    email: '',
    password: '',
    pwd: '',
    firstName: '',
    lastName: '',
    role: Role.OPERATOR,
  };
  const router = useRouter();

  const formSubmit = async (value: IUserForm) => {
    try {
      const { email, password, firstName, lastName, role } = value;
      const fch = customFetch();
      const { message }: IFormMessage = await fch.post('/users', {
        email,
        password,
        firstName,
        lastName,
        role,
      });
      toaster.success(message);
      router.push('/user');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New User" />
      <UserForm initForm={init} formSubmit={formSubmit} />
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role !== Role.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }
    return { props: {} };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
