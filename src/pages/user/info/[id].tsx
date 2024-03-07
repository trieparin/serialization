import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { UserContext } from '@/contexts/UserContext';
import customFetch from '@/helpers/fetch.helper';
import { ValidatePassword } from '@/helpers/validate.helper';
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
  FormEvent,
  useContext,
  useEffect,
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
  const router = useRouter();
  const { isLoading, startLoading } = useContext(LoadingContext);
  const { profile, checkLogin } = useContext(UserContext);
  const [user, setUser] = useState<IUser>({});
  const [password, setPassword] = useState('');
  const [state, dispatch] = useReducer(formReducer, {});

  useEffect(() => {
    userInfo();
  }, []);

  const userInfo = async () => {
    if (profile.uid === params.id) {
      setUser(profile);
    } else {
      try {
        const fch = customFetch();
        const { data }: any = await fch.get(`/users/${params.id}`);
        setUser(data);
      } catch (error) {
        throw error;
      }
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      startLoading();
      const fch = customFetch();
      const { message }: any = await fch.patch(`/users/${params.id}`, state);
      toaster.success(message);
      checkLogin();
      router.push(profile.role === Role.ADMIN ? '/user' : '/product');
    } catch (error) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Edit User Info" />
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
              defaultValue={user.email}
              required
              disabled
            />
            <TextInputField
              label="New Password"
              name="password"
              id="password"
              type="password"
              isInvalid={!!password && !ValidatePassword(password)}
              validationMessage={
                !!password &&
                !ValidatePassword(password) && (
                  <Text size={300} color="red500">
                    At least 6 characters with one uppercase and one lowercase.
                  </Text>
                )
              }
              onBlur={(event: FocusEvent<HTMLInputElement>) => {
                setPassword(event.currentTarget.value);
              }}
              disabled={profile.uid !== params.id}
            />
            <TextInputField
              label="Confirm Password"
              name="cfmPassword"
              id="cfmPassword"
              type="password"
              isInvalid={!!state.password && password !== state.password}
              validationMessage={
                !!state.password &&
                password !== state.password && (
                  <Text size={300} color="red500">
                    Password do not match.
                  </Text>
                )
              }
              onBlur={(event: FocusEvent<HTMLInputElement>) => {
                dispatch({
                  type: 'set_password',
                  payload: event.currentTarget.value,
                });
              }}
              disabled={profile.uid !== params.id}
            />
            <TextInputField
              label="First Name"
              name="firstName"
              id="firstName"
              type="text"
              defaultValue={user.firstName}
              onBlur={(event: FocusEvent<HTMLInputElement>) => {
                if (event.currentTarget.value !== user.firstName) {
                  dispatch({
                    type: 'set_first_name',
                    payload: event.currentTarget.value.trim(),
                  });
                }
              }}
              required
            />
            <TextInputField
              label="Last Name"
              name="lastName"
              id="lastName"
              type="text"
              defaultValue={user.lastName}
              onBlur={(event: FocusEvent<HTMLInputElement>) => {
                if (event.currentTarget.value !== user.lastName) {
                  dispatch({
                    type: 'set_last_name',
                    payload: event.currentTarget.value.trim(),
                  });
                }
              }}
              required
            />
            <SelectField
              label="Role"
              name="userRole"
              id="userRole"
              value={user.role}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => {
                setUser({ ...user, role: event.currentTarget.value as Role });
                if (event.currentTarget.value !== user.role) {
                  dispatch({
                    type: 'set_role',
                    payload: event.currentTarget.value,
                  });
                }
              }}
              required
              disabled={profile.role !== Role.ADMIN}
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </SelectField>
          </Pane>
        </Pane>
        <SaveCancel disabled={false} loading={isLoading} />
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
