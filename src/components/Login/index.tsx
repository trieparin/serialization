import { Logo } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import customFetch from '@/helpers/fetch.helper';
import { Role } from '@/models/user.model';
import {
  Button,
  Card,
  Pane,
  TextInputField,
  majorScale,
  minorScale,
  toaster,
} from 'evergreen-ui';
import router from 'next/router';
import { FormEvent, useContext, useEffect } from 'react';

export const Login = () => {
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const { profile, checkLogin } = useContext(UserContext);

  useEffect(() => {
    switch (profile.role) {
      case Role.ADMIN:
        router.replace('/user');
        break;
      case Role.SUPERVISOR:
        router.replace('/product');
        break;
      case Role.OPERATOR:
        router.replace('/product');
        break;
      default:
        break;
    }
  }, [profile]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startLoading();
    try {
      const target = e.currentTarget;
      const fch = customFetch();
      const { data }: any = await fch.post('/auth/login', {
        email: target.email.value,
        password: target.password.value,
      });
      const date = new Date();
      date.setTime(date.getTime() + 1000 * 60 * 59);
      document.cookie = `token=${data}; path=/; expires=${date.toUTCString()};`;
      checkLogin(true);
    } catch (err) {
      toaster.danger('Invalid Email or Password');
      stopLoading();
    }
  };

  return (
    <Card
      background="tint1"
      elevation={2}
      padding={majorScale(5)}
      minWidth="40%"
    >
      <Pane is="fieldset" border="none" disabled={isLoading}>
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
            name="email"
            id="email"
            type="text"
            width="70%"
            required
          />
          <TextInputField
            label="Password"
            name="password"
            id="password"
            type="password"
            width="70%"
            required
          />
          <Button appearance="primary" size="large" isLoading={isLoading}>
            Login
          </Button>
        </Pane>
      </Pane>
    </Card>
  );
};
