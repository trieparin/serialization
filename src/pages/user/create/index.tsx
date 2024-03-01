import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { signUp } from '@/firebase/auth';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { useRouter } from 'next/router';
import { FormEvent, useContext, useEffect } from 'react';

export default function UserCreate() {
  const userRoles = Object.values(Role);
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startLoading();
    const target = e.currentTarget;
    const user = {
      email: target.email.value,
      password: target.password.value,
      firstName: target.firstName.value,
      lastName: target.lastName.value,
      role: target.userRole.value,
    };
    const { message } = await signUp(user);
    toaster.success(message);
    router.replace('/user');
  };

  useEffect(() => {
    stopLoading();
  }, []);

  return (
    <BaseLayout>
      <PageTitle title="Create New User" />
      <Pane is="form" onSubmit={handleSubmit}>
        <Pane is="fieldset" border="none" disabled={isLoading}>
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Email"
              name="email"
              id="email"
              type="email"
              required
            />
            <TextInputField
              label="Password"
              name="password"
              id="password"
              type="password"
              required
            />
            <TextInputField
              label="Confirm Password"
              name="cfmPassword"
              id="cfmPassword"
              type="password"
              required
            />
            <TextInputField
              label="First Name"
              name="firstName"
              id="firstName"
              type="text"
              required
            />
            <TextInputField
              label="Last Name"
              name="lastName"
              id="lastName"
              type="text"
              required
            />
            <SelectField label="Role" name="userRole" id="userRole" required>
              {userRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </SelectField>
          </Pane>
        </Pane>
        <SaveCancel loading={isLoading} />
      </Pane>
    </BaseLayout>
  );
}
