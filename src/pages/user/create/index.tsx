import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { signUp } from '@/firebase/auth';
import { ValidatePassword } from '@/helpers/validate.helper';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  Text,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { useRouter } from 'next/router';
import { FocusEvent, FormEvent, useContext, useEffect, useState } from 'react';

export default function UserCreate() {
  const userRoles = Object.values(Role);
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const [passwordValue, setPasswordValue] = useState('');
  const [cfmPasswordValue, setCfmPasswordValue] = useState('');

  useEffect(() => {
    stopLoading();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (ValidatePassword(passwordValue) && passwordValue === cfmPasswordValue) {
      startLoading();
      const target = e.currentTarget;
      const user = {
        email: target.email.value,
        password: target.password.value,
        firstName: target.firstName.value.trim(),
        lastName: target.lastName.value.trim(),
        role: target.userRole.value,
      };
      const { message } = await signUp(user);
      toaster.success(message);
      router.push('/user');
    } else {
      toaster.danger('An Error Occurred');
    }
  };

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
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                console.log(e);
              }}
              required
            />
            <TextInputField
              label="Password"
              name="password"
              id="password"
              type="password"
              isInvalid={!!passwordValue && !ValidatePassword(passwordValue)}
              validationMessage={
                !!passwordValue &&
                !ValidatePassword(passwordValue) && (
                  <Text size={300} color="red500">
                    Must contain at least 6 characters with upper and lower
                    case.
                  </Text>
                )
              }
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                setPasswordValue(e.currentTarget.value);
              }}
              required
            />
            <TextInputField
              label="Confirm Password"
              name="cfmPassword"
              id="cfmPassword"
              type="password"
              isInvalid={
                !!cfmPasswordValue && passwordValue !== cfmPasswordValue
              }
              validationMessage={
                !!cfmPasswordValue &&
                passwordValue !== cfmPasswordValue && (
                  <Text size={300} color="red500">
                    Password do not match.
                  </Text>
                )
              }
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                setCfmPasswordValue(e.currentTarget.value);
              }}
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
