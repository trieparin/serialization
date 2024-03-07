import {
  ActiveIngredient,
  BatchInformation,
  PageTitle,
  SaveCancel,
} from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { BaseLayout } from '@/layouts';
import { Pane } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { FormEvent, useContext } from 'react';

export default function ProductCreate() {
  const { isLoading, startLoading } = useContext(LoadingContext);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    startLoading();
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New Product" />
      <Pane is="form" onSubmit={handleSubmit}>
        <Pane is="fieldset" border="none">
          <BatchInformation />
          <ActiveIngredient />
        </Pane>
        <SaveCancel disabled={false} loading={isLoading} />
      </Pane>
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
