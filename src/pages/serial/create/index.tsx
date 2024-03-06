import { BaseLayout } from '@/layouts';
import { GetServerSidePropsContext } from 'next';

export default function SerialCreate() {
  return <BaseLayout></BaseLayout>;
}

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
}
