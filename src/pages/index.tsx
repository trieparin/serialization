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
import { FocusEvent, useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

export default function Home() {
  const router = useRouter();
  const { profile, checkLogin } = useContext(UserContext);
  const [isOK, setIsOK] = useState(false);
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: {
      isDirty,
      isValid,
      isSubmitting,
      isSubmitSuccessful,
      defaultValues,
    },
  } = useForm({ defaultValues: { email: '', password: '' } });

  useEffect(() => {
    if (profile.role) {
      profile.role === Role.ADMIN
        ? router.replace('/user')
        : router.replace('/product');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile.role]);

  const formSubmit = async () => {
    try {
      const { email, password } = getValues();
      const fch = customFetch();
      const { data }: any = await fch.post('/auth', { email, password });
      setCookie('token', data, 1000 * 60 * 60);
      checkLogin();
      setIsOK(true);
    } catch (error) {
      toaster.danger('Invalid email or password');
    }
  };

  if (isSubmitSuccessful && !isOK) {
    reset();
  }

  return (
    <BlankLayout>
      <Card
        background="tint1"
        elevation={2}
        padding={majorScale(5)}
        minWidth="40%"
      >
        <Pane
          is="fieldset"
          border="none"
          disabled={isSubmitting || isSubmitSuccessful}
        >
          <Pane
            is="form"
            method="post"
            onSubmit={handleSubmit(formSubmit)}
            width="100%"
            display="flex"
            alignItems="center"
            flexFlow="column"
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
              isLoading={isSubmitting || isSubmitSuccessful}
            >
              Login
            </Button>
          </Pane>
        </Pane>
      </Card>
    </BlankLayout>
  );
}
