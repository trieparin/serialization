import { PageTitle, SaveCancel } from '@/components';
import { admin } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IFormMessage } from '@/models/form.model';
import { ItemType } from '@/models/inventory.model';
import { Role } from '@/models/user.model';
import {
  Pane,
  SelectField,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { FocusEvent } from 'react';
import { useForm } from 'react-hook-form';

export default function InventoryCreate() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { isDirty, isValid, isSubmitting, defaultValues },
  } = useForm({
    defaultValues: {
      name: '',
      note: '',
      type: ItemType.INGREDIENT,
    },
  });

  const formSubmit = async () => {
    try {
      const fch = customFetch();
      const { message }: IFormMessage = await fch.post('/items', getValues());
      toaster.success(message);
      router.push('/inventory');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New Item" />
      <Pane is="form" onSubmit={handleSubmit(formSubmit)}>
        <Pane is="fieldset" border="none">
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Name"
              type="text"
              id="name"
              required
              defaultValue={defaultValues?.name}
              {...register('name', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('name', event.currentTarget.value.trim());
                },
              })}
            />
            <TextInputField
              label="Note"
              type="text"
              id="note"
              defaultValue={defaultValues?.note}
              {...register('note', {
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('note', event.currentTarget.value.trim());
                },
              })}
            />
            <SelectField
              label="Type"
              id="type"
              required
              defaultValue={defaultValues?.type}
              {...register('type', { required: true })}
            >
              {Object.values(ItemType).map((type) => (
                <option key={type} value={type}>
                  {type}
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

export async function getServerSideProps({ req }: GetServerSidePropsContext) {
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (!role) return { redirect: { destination: '/' } };
    if (role !== Role.ADMIN) {
      return { redirect: { destination: '/no-permission' } };
    }
    return { props: {} };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
