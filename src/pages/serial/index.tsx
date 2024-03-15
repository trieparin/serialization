import { PageTitle } from '@/components';
import { admin } from '@/firebase/admin';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import { GetServerSidePropsContext } from 'next';

export default function SerialPage() {
  return (
    <BaseLayout>
      <PageTitle title="All Serials" />
    </BaseLayout>
  );
}

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (role === Role.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }
    return {
      props: {},
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
