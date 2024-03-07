import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { db, temp } from '@/firebase/config';
import { RegExPassword, ValidatePassword } from '@/helpers/validate.helper';
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
import {
  ChangeEvent,
  FocusEvent,
  useContext,
  useReducer,
  useState,
} from 'react';
import { useForm } from 'react-hook-form';

interface FormAction {
  type: string;
  payload: string;
}

const formReducer = (state: any, action: FormAction) => {
  const { type, payload } = action;
  switch (type) {
    case 'set_email':
      return {
        ...state,
        email: payload,
      };
    case 'set_password':
      return {
        ...state,
        password: payload,
      };
    case 'set_first_name':
      return {
        ...state,
        firstName: payload,
      };
    case 'set_last_name':
      return {
        ...state,
        lastName: payload,
      };
    case 'set_role':
      return {
        ...state,
        role: payload,
      };
    default:
      return { ...state };
  }
};

export default function UserCreate() {
  const pwdRegEx = RegExPassword();
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const [password, setPassword] = useState('');
  const [state, dispatch] = useReducer(formReducer, {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Admin',
  });
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm();

  const formSubmit = async () => {
    try {
      startLoading();
      const { user } = await createUserWithEmailAndPassword(
        temp,
        state.email,
        state.password
      );
      await updateProfile(user, {
        displayName: `${state.firstName} ${state.lastName.charAt(0)}.`,
      });
      await setDoc(doc(db, 'users', user.uid), {
        email: state.email,
        firstName: state.firstName,
        lastName: state.lastName,
        role: state.role,
      });
      await signOut(temp);
      toaster.success('Create new user successfully');
      router.push('/user');
    } catch (error) {
      toaster.danger('An error occurred');
      stopLoading();
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New User" />
      <Pane is="form" onSubmit={handleSubmit(formSubmit)}>
        <Pane is="fieldset" border="none" disabled={isLoading}>
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Email"
              type="email"
              defaultValue={state.email}
              {...register('email', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_email',
                    payload: event.currentTarget.value.trim(),
                  });
                },
              })}
            />
            <TextInputField
              label="Password"
              type="password"
              defaultValue={password}
              {...register('password', {
                pattern: pwdRegEx,
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setPassword(event.currentTarget.value);
                },
              })}
              isInvalid={!!password && !ValidatePassword(password)}
              validationMessage={
                !!password &&
                !ValidatePassword(password) && (
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
              defaultValue={state.password}
              {...register('cfmPassword', {
                pattern: pwdRegEx,
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_password',
                    payload: event.currentTarget.value,
                  });
                },
              })}
              isInvalid={!!state.password && state.password !== password}
              validationMessage={
                !!state.password &&
                state.password !== password && (
                  <Text size={300} color="red500">
                    Password do not match
                  </Text>
                )
              }
            />
            <TextInputField
              label="First Name"
              type="text"
              defaultValue={state.firstName}
              {...register('firstName', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_first_name',
                    payload: event.currentTarget.value.trim(),
                  });
                },
              })}
            />
            <TextInputField
              label="Last Name"
              type="text"
              defaultValue={state.lastName}
              {...register('lastName', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_last_name',
                    payload: event.currentTarget.value.trim(),
                  });
                },
              })}
            />
            <SelectField
              label="Role"
              value={state.role}
              {...register('userRole', {
                required: true,
                onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                  dispatch({
                    type: 'set_role',
                    payload: event.currentTarget.value,
                  });
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
        <SaveCancel disabled={!isValid} loading={isLoading} />
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
