import { Logo } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { BlankLayout } from '@/layouts';
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
import { useRouter } from 'next/router';
import { FormEvent, useContext, useEffect } from 'react';

export default function Home() {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const { profile, checkLogin } = useContext(UserContext);

  useEffect(() => {
    const redirectRole = () => {
      if (profile.role === Role.ADMIN) {
        router.replace('/user');
      } else {
        router.replace('/product');
      }
    };
    if (profile.role) redirectRole();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.role]);

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      startLoading();
      const target = event.currentTarget;
      const fch = customFetch();
      const { data }: any = await fch.post('/auth', {
        email: target.email.value,
        password: target.password.value,
      });
      setCookie('token', data, 1000 * 60 * 60);
      checkLogin();
    } catch (error) {
      toaster.danger('Invalid email or password');
      stopLoading();
    }
  };

  return (
    <BlankLayout>
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
    </BlankLayout>
  );
}
