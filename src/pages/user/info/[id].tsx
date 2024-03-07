import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import { SetCookie } from '@/helpers/cookie.helper';
import customFetch from '@/helpers/fetch.helper';
import { RegExPassword, ValidatePassword } from '@/helpers/validate.helper';
import { BaseLayout } from '@/layouts';
import { IUser, Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  Text,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  FocusEvent,
  useContext,
  useEffect,
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
    case 'reset':
      return {};
    default:
      return { ...state };
  }
};

export default function UserInfo({ params }: any) {
  const pwdRegEx = RegExPassword();
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const { profile, checkLogin } = useContext(UserContext);
  const [user, setUser] = useState<IUser>({});
  const [password, setPassword] = useState('');
  const [state, dispatch] = useReducer(formReducer, {});
  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm();

  useEffect(() => {
    const userInfo = async () => {
      const fch = customFetch();
      const { data }: any = await fch.get(`/users/${params.id}`);
      setUser(data);
    };
    userInfo();
  }, [params.id]);

  const formSubmit = async () => {
    try {
      startLoading();
      const fch = customFetch();
      const { password, ...info } = state;
      if (Object.keys(info).length) {
        const { message }: any = await fch.patch(`/users/${params.id}`, {
          info,
        });
        toaster.success(message);
      }
      if (password) {
        const { message }: any = await fch.put(`/auth`, { password });
        toaster.success(message, {
          description: 'Please sign in again',
        });
        SetCookie('token', '');
        stopLoading();
      }
      checkLogin();
      router.push(profile.role === Role.ADMIN ? '/user' : '/product');
    } catch (error) {
      toaster.danger('An error occurred');
      stopLoading();
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Edit User Info" />
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
              defaultValue={user.email}
              {...register('email', { disabled: true })}
            />
            <TextInputField
              label="New Password"
              type="password"
              {...register('password', {
                pattern: pwdRegEx,
                disabled: profile.uid !== params.id,
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
              {...register('cfmPassword', {
                pattern: pwdRegEx,
                disabled: profile.uid !== params.id,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_password',
                    payload: event.currentTarget.value,
                  });
                },
              })}
              isInvalid={!!state.password && password !== state.password}
              validationMessage={
                !!state.password &&
                password !== state.password && (
                  <Text size={300} color="red500">
                    Password do not match
                  </Text>
                )
              }
            />
            <TextInputField
              label="First Name"
              type="text"
              defaultValue={user.firstName}
              {...register('firstName', {
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  if (event.currentTarget.value !== user.firstName) {
                    dispatch({
                      type: 'set_first_name',
                      payload: event.currentTarget.value.trim(),
                    });
                  }
                },
              })}
            />
            <TextInputField
              label="Last Name"
              type="text"
              defaultValue={user.lastName}
              {...register('lastName', {
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  if (event.currentTarget.value !== user.lastName) {
                    dispatch({
                      type: 'set_last_name',
                      payload: event.currentTarget.value.trim(),
                    });
                  }
                },
              })}
            />
            <SelectField
              label="Role"
              value={user.role}
              {...register('userRole', {
                required: true,
                disabled: profile.role !== Role.ADMIN,
                onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                  setUser({ ...user, role: event.currentTarget.value as Role });
                  if (event.currentTarget.value !== user.role) {
                    dispatch({
                      type: 'set_role',
                      payload: event.currentTarget.value,
                    });
                  }
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

export function getServerSideProps({ req, params }: GetServerSidePropsContext) {
  const token = req.cookies.token;
  if (!token) {
    return {
      redirect: {
        destination: '/',
      },
    };
  }
  return {
    props: {
      params,
    },
  };
}
