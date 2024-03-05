import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { Role } from '@/models/user.model';
import { Pane, SelectField, TextInputField, majorScale } from 'evergreen-ui';
import { useRouter } from 'next/router';
import {
  ChangeEvent,
  FocusEvent,
  FormEvent,
  useContext,
  useEffect,
  useReducer,
} from 'react';

interface FormAction {
  type: string;
  payload: string;
}

const formReducer = (state: any, action: FormAction) => {
  const { type, payload } = action;
  switch (type) {
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
    case 'initial':
      const { email, firstName, lastName, role } = JSON.parse(payload);
      return {
        email,
        firstName,
        lastName,
        role,
      };
    default:
      return { ...state };
  }
};

export default function UserEdit() {
  const router = useRouter();
  const { isLoading, startLoading, stopLoading } = useContext(LoadingContext);
  const [state, dispatch] = useReducer(formReducer, {});

  useEffect(() => {
    userInfo();
    stopLoading();
  }, []);

  const userInfo = async () => {
    try {
      const fch = customFetch();
      const { data }: any = await fch.get(`/users/${router.query.id}`);
      dispatch({ type: 'initial', payload: JSON.stringify(data) });
    } catch (err) {
      throw err;
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startLoading();
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
              defaultValue={state.email}
              required
              disabled
            />
            <TextInputField
              label="First Name"
              name="firstName"
              id="firstName"
              type="text"
              defaultValue={state.firstName}
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
              defaultValue={state.lastName}
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
              defaultValue={state.role}
              onChange={(e: ChangeEvent<HTMLSelectElement>) => {
                dispatch({
                  type: 'set_role',
                  payload: e.currentTarget.value,
                });
              }}
              required
            >
              {Object.values(Role).map((role) => (
                <option key={role} value={role} selected={role === state.role}>
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
