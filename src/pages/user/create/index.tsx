import { PageTitle, SaveCancel } from '@/components';
import { db, temp } from '@/firebase/config';
import { checkPassword, regExPassword } from '@/helpers/form.helper';
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
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ChangeEvent, FocusEvent, useReducer } from 'react';
import { useForm } from 'react-hook-form';

interface FormAction {
  type: string;
  payload: string;
}

const formReducer = (state: any, action: FormAction) => {
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

export default function UserCreate() {
  const pwdRegEx = regExPassword();
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, {});
  const {
    reset,
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isValid, isSubmitting, defaultValues },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      pwd: '',
      firstName: '',
      lastName: '',
      role: 'Admin',
    },
  });

  const formSubmit = async () => {
    try {
      const { email, password, firstName, lastName, role } = getValues();
      const { user } = await createUserWithEmailAndPassword(
        temp,
        email,
        password
      );
      await updateProfile(user, {
        displayName: `${firstName} ${lastName.charAt(0)}.`,
      });
      await setDoc(doc(db, 'users', user.uid), {
        email,
        firstName,
        lastName,
        role,
      });
      await signOut(temp);
      toaster.success('Create new user successfully');
      router.push('/user');
    } catch (error) {
      toaster.danger('An error occurred');
    }
    reset();
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New User" />
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
              defaultValue={defaultValues?.password}
              {...register('password', {
                required: true,
                pattern: pwdRegEx,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_password',
                    payload: event.currentTarget.value,
                  });
                  setValue('password', event.currentTarget.value);
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
                required: true,
                pattern: pwdRegEx,
                validate: () => state.pwd === state.password,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_pwd',
                    payload: event.currentTarget.value,
                  });
                  setValue('pwd', event.currentTarget.value);
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
                required: true,
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
                required: true,
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
                onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                  setValue('role', event.currentTarget.value);
                },
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

export function getServerSideProps({ req }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {},
  };
}
