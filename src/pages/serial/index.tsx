import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';
import { GetServerSidePropsContext } from 'next';

export default function SerialPage() {
  return (
    <BaseLayout>
      <PageTitle title="All Serials" link="/serial/create" hasAddButton />
    </BaseLayout>
  );
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
