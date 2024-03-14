import { admin } from '@/firebase/admin';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import { GetServerSidePropsContext } from 'next';

export default function SerialInfo() {
  return <BaseLayout></BaseLayout>;
}

export async function getServerSideProps({
  req,
  params,
}: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (role === Role.ADMIN) return { redirect: { destination: '/' } };
    return {
      props: {
        params,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
