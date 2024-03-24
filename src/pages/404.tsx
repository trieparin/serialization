import { ErrorPage } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { BlankLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import { useContext } from 'react';

export default function Error404() {
  const { role } = useContext(UserContext);
  return (
    <BlankLayout>
      <ErrorPage
        title="Page Not Found"
        message="The page you requested could not be found."
        path={role === Role.ADMIN ? '/user' : '/product'}
        back="Back to main page"
      />
    </BlankLayout>
  );
}
