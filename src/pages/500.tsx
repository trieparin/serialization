import { ErrorPage } from '@/components';
import { BlankLayout } from '@/layouts';

export default function Error500() {
  return (
    <BlankLayout>
      <ErrorPage title="Internal Server Error" message="..." />
    </BlankLayout>
  );
}
