import { PageTitle, SaveCancel } from '@/components';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import { Pane, SelectField, TextInputField, majorScale } from 'evergreen-ui';
import { FormEvent, useState } from 'react';

export default function UserCreate() {
  const userRoles = Object.values(Role);
  const [isLoading, setIsLoading] = useState(false);
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New User" />
      <Pane is="form" onSubmit={handleSubmit}>
        <Pane is="fieldset" border="none">
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
              name="confirmPassword"
              id="confirmPassword"
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
            <SelectField label="Role" name="role" id="role" required>
              {userRoles.map((role) => (
                <option value={role}>{role}</option>
              ))}
            </SelectField>
          </Pane>
        </Pane>
        <SaveCancel loading={isLoading} />
      </Pane>
    </BaseLayout>
  );
}
