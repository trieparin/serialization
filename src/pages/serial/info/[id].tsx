import { BaseLayout } from '@/layouts';
import { GetServerSidePropsContext } from 'next';

export default function SerialInfo() {
  return <BaseLayout></BaseLayout>;
}

export function getServerSideProps({ req, params }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {
      params,
    },
  };
}
