import { SaveCancel } from '@/components';
import { UserContext } from '@/contexts/UserContext';
import {
  checkPassword,
  formHasChange,
  regExPassword,
} from '@/helpers/form.helper';
import { IFormAction } from '@/models/form.model';
import { IUserForm, Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  Text,
  TextInputField,
  majorScale,
} from 'evergreen-ui';
import { FocusEvent, useContext, useReducer } from 'react';
import { useForm } from 'react-hook-form';

interface UserFormProps {
  initForm: IUserForm;
  formSubmit: (value: IUserForm, change?: object) => void;
  edit?: boolean;
}

export const UserForm = ({ initForm, formSubmit, edit }: UserFormProps) => {
  const pwdRegEx = regExPassword();
  const profile = useContext(UserContext);
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
  const [state, dispatch] = useReducer(formReducer, {});
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isValid, isSubmitting, dirtyFields, defaultValues },
  } = useForm({
    defaultValues: initForm,
  });
  return (
    <Pane
      is="form"
      onSubmit={handleSubmit(() => formSubmit(getValues(), dirtyFields))}
    >
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
            required
            defaultValue={defaultValues?.email}
            {...register('email', {
              required: true,
              disabled: edit,
              onBlur: (event: FocusEvent<HTMLInputElement>) => {
                setValue('email', event.currentTarget.value.trim());
              },
            })}
          />
          <TextInputField
            label="New Password"
            type="password"
            id="password"
            required={!edit}
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
                  At least 6 characters with one uppercase, lowercase and number
                </Text>
              )
            }
          />
          <TextInputField
            label="Confirm New Password"
            type="password"
            id="pwd"
            required={!edit}
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
            required
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
            required
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
            required
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
  );
};
