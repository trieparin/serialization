import { Logo } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { auth } from '@/firebase/config';
import { setCookie } from '@/helpers/cookie.helper';
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
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/router';
import { FocusEvent, useCallback, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';

export default function Home() {
  const router = useRouter();
  const { role, token } = useContext(UserContext);
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isValid, isSubmitting, defaultValues },
  } = useForm({ defaultValues: { email: '', password: '' } });

  const redirectLogin = useCallback(() => {
    if (role) {
      setCookie('token', token!, 1000 * 60 * 60);
      role === Role.ADMIN
        ? router.replace('/user')
        : router.replace('/product');
    }
  }, [role, token, router]);

  const formSubmit = async () => {
    try {
      const { email, password } = getValues();
      await signInWithEmailAndPassword(auth, email, password);
      toaster.success('Login successfully');
    } catch (e) {
      toaster.danger('Invalid email or password');
    }
    reset();
  };

  useEffect(() => redirectLogin(), [redirectLogin]);

  return (
    <BlankLayout>
      <Card
        elevation={2}
        background="tint1"
        position="relative"
        width="40%"
        minWidth="max-content"
        padding={majorScale(5)}
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
              {...register('password', { required: true })}
            />
            <Button
              appearance="primary"
              type="submit"
              name="login"
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
