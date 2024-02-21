import { Logo } from '@/components';
import {
  Button,
  Card,
  Pane,
  TextInputField,
  majorScale,
  minorScale,
} from 'evergreen-ui';
import { FormEvent } from 'react';

export const Login = () => {
  const handleLogin = (event: FormEvent) => {
    event.preventDefault();
    console.log('login');
  };

  return (
    <Card
      background="tint1"
      elevation={2}
      padding={majorScale(5)}
      minWidth="40%"
    >
      <Pane
        is="form"
        method="post"
        onSubmit={handleLogin}
        width="100%"
        display="flex"
        alignItems="center"
        flexFlow="column"
      >
        <Pane marginBottom={minorScale(7)}>
          <Logo />
        </Pane>
        <TextInputField
          label="Email"
          name="loginEmail"
          id="loginEmail"
          type="text"
          width="70%"
          required
        />
        <TextInputField
          label="Password"
          name="loginPassword"
          id="loginPassword"
          type="password"
          width="70%"
          required
        />
        <Button appearance="primary" size="large">
          Login
        </Button>
      </Pane>
    </Card>
  );
};
