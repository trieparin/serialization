import {
  ActiveIngredient,
  BatchInformation,
  PageTitle,
  SaveCancel,
} from '@/components';
import { BaseLayout } from '@/layouts';
import { Pane } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';

export default function ProductCreate() {
  return (
    <BaseLayout>
      <PageTitle title="Create New Product" />
      <Pane is="form">
        <Pane is="fieldset" border="none">
          <BatchInformation />
          <ActiveIngredient />
        </Pane>
        <SaveCancel disabled={false} loading={false} />
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
