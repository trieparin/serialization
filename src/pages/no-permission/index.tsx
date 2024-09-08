import { ErrorPage } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { BlankLayout } from '@/layouts';
import { ROLE } from '@/models/user.model';
import { useContext } from 'react';

export default function NoPermission() {
  const { role } = useContext(UserContext);
  return (
    <BlankLayout>
      <ErrorPage
        title="No Permission Access"
        message="You do not have permission to access this page."
        path={role === ROLE.ADMIN ? '/user' : '/product'}
        back="Back to main page"
      />
    </BlankLayout>
  );
}
