import { ErrorPage } from '@/components';
import { BlankLayout } from '@/layouts';

export default function Error404() {
  return (
    <BlankLayout>
      <ErrorPage title="Page Not Found" message="..." />
    </BlankLayout>
  );
}
