import { PageTitle } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { BaseLayout } from '@/layouts';
import { GetServerSidePropsContext } from 'next';
import { useContext, useEffect } from 'react';

export default function SerialPage() {
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);

  useEffect(() => {
    stopLoading();
  }, [isLoading]);

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
