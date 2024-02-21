import { PageTitle } from '@/components';
import { BaseLayout } from '@/layouts';

export default function SerialPage() {
  return (
    <BaseLayout>
      <PageTitle title="All Serials" link="/serial/create" hasAddButton />
    </BaseLayout>
  );
}
