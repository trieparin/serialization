import { ErrorPage } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { BlankLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import { useContext } from 'react';

export default function Error500() {
  const { role } = useContext(UserContext);
  return (
    <BlankLayout>
      <ErrorPage
        title="Internal Server Error"
        message="Our service is temporary unavailable. Please try again later."
        path={role === Role.ADMIN ? '/user' : '/product'}
        back="Back to main page"
      />
    </BlankLayout>
  );
}
