import { ErrorPage } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { BlankLayout } from '@/layouts';
import { ROLE } from '@/models/user.model';
import { useContext } from 'react';

export default function Error404() {
  const { role } = useContext(UserContext);
  const getPath = () => {
    switch (role) {
      case ROLE.ADMIN:
        return '/user';
      case ROLE.SUPERVISOR:
        return '/product';
      case ROLE.OPERATOR:
        return '/product';
      default:
        return '/scan';
    }
  };
  return (
    <BlankLayout>
      <ErrorPage
        title="Page Not Found"
        message="The page you requested could not be found."
        path={getPath()}
        back="Back to main page"
      />
    </BlankLayout>
  );
}
