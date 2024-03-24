import { ErrorPage } from '@/components';
import { BlankLayout } from '@/layouts';

export default function NoPermission() {
  return (
    <BlankLayout>
      <ErrorPage
        title="No Permission Access"
        message="You do not have permission to access this page."
      />
    </BlankLayout>
  );
}
