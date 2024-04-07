import { PageTitle, SaveCancel } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { admin, db } from '@/firebase/admin';
import { auth } from '@/firebase/config';
import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import {
  checkPassword,
  formChangeValue,
  formHasChange,
  regExPassword,
} from '@/helpers/form.helper';
import { BaseLayout } from '@/layouts';
import { IFormAction, IFormMessage } from '@/models/form.model';
import { IUser, Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  Text,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { signOut } from 'firebase/auth';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { FocusEvent, useContext, useReducer } from 'react';
import { useForm } from 'react-hook-form';

interface UserInfoProps {
  params: ParsedUrlQuery;
  data: IUser;
}

const formReducer = (state: object, action: IFormAction) => {
  const { type, payload } = action;
  switch (type) {
    case 'SET_PASSWORD':
      return {
        ...state,
        password: payload,
      };
    case 'SET_PWD':
      return {
        ...state,
        pwd: payload,
      };
    default:
      return { ...state };
  }
};

export default function UserInfo({ params, data }: UserInfoProps) {
  const { email, displayName, firstName, lastName, role } = data;
  const pwdRegEx = regExPassword();
  const router = useRouter();
  const profile = useContext(UserContext);
  const [state, dispatch] = useReducer(formReducer, {});
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isValid, isSubmitting, dirtyFields, defaultValues },
  } = useForm({
    defaultValues: {
      password: '',
      pwd: '',
      email,
      displayName,
      firstName,
      lastName,
      role,
    },
  });

  const formSubmit = async () => {
    try {
      const { password, firstName, lastName, role } = getValues();
      const change: Record<string, string> = formChangeValue(dirtyFields, {
        firstName,
        lastName,
        role,
      });
      delete change.pwd;
      delete change.password;
      const fch = customFetch();
      if (Object.keys(change).length) {
        const displayName = `${firstName} ${lastName?.charAt(0)}.`;
        if (defaultValues?.displayName !== displayName) {
          change.displayName = displayName;
        }
        if (defaultValues?.role !== role && profile.role === Role.ADMIN) {
          change.role = role as Role;
        }
        const { message }: IFormMessage = await fch.patch(
          `/users/${params.id}`,
          change
        );
        toaster.success(message);
      }
      if (password) {
        const { message }: IFormMessage = await fch.put(`/users/${params.id}`, {
          password,
        });
        if (profile.uid === params.id) {
          toaster.success(message, {
            description: 'Please sign in again',
          });
          await signOut(auth);
          setCookie('token', '');
          router.push('/');
        } else {
          toaster.success(message);
        }
      }
      router.push(profile.role === Role.ADMIN ? '/user' : '/product');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Edit User Info" />
      <Pane is="form" onSubmit={handleSubmit(formSubmit)}>
        <Pane is="fieldset" border="none" disabled={isSubmitting}>
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Email"
              type="email"
              id="email"
              defaultValue={defaultValues?.email}
              {...register('email', { disabled: true })}
            />
            <TextInputField
              label="New Password"
              type="password"
              id="password"
              defaultValue={defaultValues?.password}
              {...register('password', {
                pattern: pwdRegEx,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'SET_PASSWORD',
                    payload: event.currentTarget.value,
                  });
                },
              })}
              isInvalid={!!state.password && !checkPassword(state.password)}
              validationMessage={
                !!state.password &&
                !checkPassword(state.password) && (
                  <Text size={300} color="red500">
                    At least 6 characters with one uppercase, lowercase and
                    number
                  </Text>
                )
              }
            />
            <TextInputField
              label="Confirm New Password"
              type="password"
              id="pwd"
              defaultValue={defaultValues?.pwd}
              {...register('pwd', {
                validate: () => state.pwd === state.password,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'SET_PWD',
                    payload: event.currentTarget.value,
                  });
                },
              })}
              isInvalid={!!state.pwd && state.pwd !== state.password}
              validationMessage={
                !!state.pwd &&
                state.pwd !== state.password && (
                  <Text size={300} color="red500">
                    Password do not match
                  </Text>
                )
              }
            />
            <TextInputField
              label="First Name"
              type="text"
              id="firstName"
              defaultValue={defaultValues?.firstName}
              {...register('firstName', {
                validate: () => formHasChange(dirtyFields),
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('firstName', event.currentTarget.value.trim());
                },
              })}
            />
            <TextInputField
              label="Last Name"
              type="text"
              id="lastName"
              defaultValue={defaultValues?.lastName}
              {...register('lastName', {
                validate: () => formHasChange(dirtyFields),
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('lastName', event.currentTarget.value.trim());
                },
              })}
            />
            <SelectField
              label="Role"
              id="role"
              defaultValue={defaultValues?.role}
              {...register('role', {
                required: true,
                disabled: profile.role !== Role.ADMIN,
                validate: () => formHasChange(dirtyFields),
              })}
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </SelectField>
          </Pane>
        </Pane>
        <SaveCancel disabled={!isDirty || !isValid} loading={isSubmitting} />
      </Pane>
    </BaseLayout>
  );
}

export async function getServerSideProps({
  req,
  params,
}: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };

    const doc = await db
      .collection('/users')
      .doc(params?.id as string)
      .get();
    const data = doc.exists && doc.data();

    return {
      props: {
        params,
        data,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
