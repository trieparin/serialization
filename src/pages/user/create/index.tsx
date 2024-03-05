import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { db, temp } from '@/firebase/config';
import { ValidatePassword } from '@/helpers/validate.helper';
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
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  useContext,
  useReducer,
  useState,
} from 'react';

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
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const [passwordValue, setPasswordValue] = useState('');
  const [state, dispatch] = useReducer(formReducer, {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'Admin',
  });

  const hasEmpty = Object.values(state).some((value) => value === '');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!hasEmpty && passwordValue === state.password) {
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
      toaster.success('Create New User Successfully');
      router.push('/user');
    } else {
      stopLoading();
      toaster.danger('An Error Occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New User" />
      <Pane is="form" onSubmit={handleSubmit}>
        <Pane is="fieldset" border="none" disabled={isLoading}>
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Email"
              name="email"
              id="email"
              type="email"
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                dispatch({ type: 'set_email', payload: e.currentTarget.value });
              }}
              required
            />
            <TextInputField
              label="Password"
              name="password"
              id="password"
              type="password"
              isInvalid={!!passwordValue && !ValidatePassword(passwordValue)}
              validationMessage={
                !!passwordValue &&
                !ValidatePassword(passwordValue) && (
                  <Text size={300} color="red500">
                    Must contain at least 6 characters with upper and lower
                    case.
                  </Text>
                )
              }
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                setPasswordValue(e.currentTarget.value);
              }}
              required
            />
            <TextInputField
              label="Confirm Password"
              name="cfmPassword"
              id="cfmPassword"
              type="password"
              isInvalid={!!state.password && passwordValue !== state.password}
              validationMessage={
                !!state.password &&
                passwordValue !== state.password && (
                  <Text size={300} color="red500">
                    Password do not match.
                  </Text>
                )
              }
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                dispatch({
                  type: 'set_password',
                  payload: e.currentTarget.value,
                });
              }}
              required
            />
            <TextInputField
              label="First Name"
              name="firstName"
              id="firstName"
              type="text"
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                dispatch({
                  type: 'set_first_name',
                  payload: e.currentTarget.value,
                });
              }}
              required
            />
            <TextInputField
              label="Last Name"
              name="lastName"
              id="lastName"
              type="text"
              onBlur={(e: FocusEvent<HTMLInputElement>) => {
                dispatch({
                  type: 'set_last_name',
                  payload: e.currentTarget.value,
                });
              }}
              required
            />
            <SelectField
              label="Role"
              name="userRole"
              id="userRole"
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                dispatch({
                  type: 'set_role',
                  payload: e.currentTarget.value,
                });
              }}
              required
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </SelectField>
          </Pane>
        </Pane>
        <SaveCancel disabled={hasEmpty} loading={isLoading} />
      </Pane>
    </BaseLayout>
  );
}
