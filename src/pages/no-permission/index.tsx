import { ErrorPage } from '@/components';
import { BlankLayout } from '@/layouts';

export default function NoPermission() {
  return (
    <BlankLayout>
      <ErrorPage title="No Permission" message="..." />
    </BlankLayout>
  );
}
