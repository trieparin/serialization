import { Logo } from '@/components';
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
  toaster,
} from 'evergreen-ui';
import { useRouter } from 'next/router';
import { FocusEvent, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function Home() {
  const router = useRouter();
  const { profile, checkLogin } = useContext(UserContext);
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isValid, isSubmitting, defaultValues },
  } = useForm({ defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (profile.uid) {
      profile.role === Role.ADMIN
        ? router.replace('/user')
        : router.replace('/product');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const formSubmit = async () => {
    try {
      const { email, password } = getValues();
      const fch = customFetch();
      const { data }: any = await fch.post('/auth', { email, password });
      setCookie('token', data, 1000 * 60 * 60);
      checkLogin();
    } catch (error) {
      toaster.danger('Invalid email or password');
    }
    reset();
  };

  return (
    <BlankLayout>
      <Card
        elevation={2}
        background="tint1"
        position="relative"
        padding={majorScale(5)}
        minWidth="40%"
      >
        <Pane is="fieldset" border="none" disabled={isSubmitting}>
          <Pane
            is="form"
            method="post"
            width="100%"
            display="flex"
            flexFlow="column"
            alignItems="center"
            onSubmit={handleSubmit(formSubmit)}
          >
            <Pane marginBottom={majorScale(3)}>
              <Logo />
            </Pane>
            <TextInputField
              label="Email"
              type="email"
              id="email"
              width="80%"
              defaultValue={defaultValues?.email}
              {...register('email', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('email', event.currentTarget.value.trim());
                },
              })}
            />
            <TextInputField
              label="Password"
              type="password"
              id="password"
              width="80%"
              defaultValue={defaultValues?.password}
              {...register('password', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('password', event.currentTarget.value);
                },
              })}
            />
            <Button
              appearance="primary"
              size="large"
              disabled={!isDirty || !isValid}
              isLoading={isSubmitting}
            >
              Login
            </Button>
          </Pane>
        </Pane>
      </Card>
    </BlankLayout>
  );
}
