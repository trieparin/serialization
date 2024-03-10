import { PageTitle, SaveCancel } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import { db } from '@/firebase/config';
import { setCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import {
  checkPassword,
  formChangeValue,
  formHasChange,
  regExPassword,
} from '@/helpers/form.helper';
import { BaseLayout } from '@/layouts';
import { IFormAction } from '@/models/form.model';
import { IUser, Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  Text,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { doc, getDoc } from 'firebase/firestore';
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
    case 'set_password':
      return {
        ...state,
        password: payload,
      };
    case 'set_pwd':
      return {
        ...state,
        pwd: payload,
      };
    default:
      return { ...state };
  }
};

export default function UserInfo({ params, data }: UserInfoProps) {
  const { email, firstName, lastName, role } = data;
  const pwdRegEx = regExPassword();
  const router = useRouter();
  const { profile, checkLogin } = useContext(UserContext);
  const [state, dispatch] = useReducer(formReducer, {});
  const {
    reset,
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
      firstName,
      lastName,
      role,
    },
  });

  const formSubmit = async () => {
    try {
      const { password, firstName, lastName, role } = getValues();
      const data: any = formChangeValue(dirtyFields, {
        firstName,
        lastName,
        role,
      });
      const fch = customFetch();
      if (data.firstName || data.lastName || data.role) {
        const { message }: any = await fch.patch(`/users/${params.id}`, {
          data,
        });
        toaster.success(message);
      }
      if (password) {
        const { message }: any = await fch.put(`/auth`, { password });
        toaster.success(message, {
          description: 'Please sign in again',
        });
        setCookie('token', '');
      }
      checkLogin();
      router.push(profile.role === Role.ADMIN ? '/user' : '/product');
    } catch (error) {
      toaster.danger('An error occurred');
      reset();
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
                disabled: profile.uid !== params.id,
                pattern: pwdRegEx,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_password',
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
              label="Confirm Password"
              type="password"
              id="pwd"
              defaultValue={defaultValues?.pwd}
              {...register('pwd', {
                disabled: profile.uid !== params.id,
                validate: () => state.pwd === state.password,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_pwd',
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
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  const snapshot = await getDoc(doc(db, 'users', params?.id as string));
  const data = snapshot.exists() && snapshot.data();
  return {
    props: {
      params,
      data,
    },
  };
}
