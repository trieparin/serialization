import { PageTitle, SaveCancel } from '@/components';
import { BaseLayout } from '@/layouts';
import { ProductType } from '@/models/product.model';
import {
  Heading,
  Pane,
  SelectField,
  TextInputField,
  majorScale,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { ChangeEvent, FocusEvent } from 'react';
import { useForm } from 'react-hook-form';

export default function ProductCreate() {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    formState: { defaultValues },
  } = useForm({
    defaultValues: {
      register: '',
      name: '',
      type: ProductType.NON_DRUG,
      batch: '',
      size: 0,
      unit: '',
      manufacturer: '',
      mfd: '',
      exp: '',
    },
  });

  const formSubmit = () => {
    const form = getValues();
    console.log(form);
  };

  return (
    <BaseLayout>
      <PageTitle title="Create New Product" />
      <Pane is="form" onSubmit={handleSubmit(formSubmit)}>
        <Pane is="fieldset" border="none">
          <Pane display="flex" flexFlow="column">
            <Heading marginBottom={majorScale(2)}>Batch Information</Heading>
            <Pane
              display="grid"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
              columnGap={majorScale(3)}
            >
              <TextInputField
                label="Register No."
                type="text"
                id="register"
                defaultValue={defaultValues?.register}
                {...register('register', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('register', event.currentTarget.value.trim());
                  },
                })}
              />
              <TextInputField
                label="Product Name"
                type="text"
                id="name"
                defaultValue={defaultValues?.name}
                {...register('name', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('name', event.currentTarget.value.trim());
                  },
                })}
              />
              <SelectField
                label="Product Type"
                id="type"
                defaultValue={defaultValues?.type}
                {...register('type', {
                  required: true,
                  onChange: (event: ChangeEvent<HTMLSelectElement>) => {
                    setValue('type', event.currentTarget.value as ProductType);
                  },
                })}
              >
                {Object.values(ProductType).map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </SelectField>
              <TextInputField
                label="Batch"
                type="text"
                id="batch"
                defaultValue={defaultValues?.batch}
                {...register('batch', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('batch', event.currentTarget.value.trim());
                  },
                })}
              />
              <TextInputField
                label="Size"
                type="number"
                id="size"
                defaultValue={defaultValues?.size}
                {...register('size', {
                  required: true,
                  min: 0,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('size', parseInt(event.currentTarget.value));
                  },
                })}
              />
              <TextInputField
                label="Unit"
                type="text"
                id="unit"
                defaultValue={defaultValues?.unit}
                {...register('unit', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('unit', event.currentTarget.value.trim());
                  },
                })}
              />
              <TextInputField
                label="Manufacturer"
                type="text"
                id="manufacturer"
                defaultValue={defaultValues?.manufacturer}
                {...register('manufacturer', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('manufacturer', event.currentTarget.value.trim());
                  },
                })}
              />
              <TextInputField
                label="Manufactured Date"
                type="date"
                id="mfd"
                defaultValue={defaultValues?.mfd}
                {...register('mfd', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('mfd', event.currentTarget.value.trim());
                  },
                })}
              />
              <TextInputField
                label="Expired Date"
                type="date"
                id="exp"
                defaultValue={defaultValues?.exp}
                {...register('exp', {
                  required: true,
                  onBlur: (event: FocusEvent<HTMLInputElement>) => {
                    setValue('exp', event.currentTarget.value.trim());
                  },
                })}
              />
            </Pane>
          </Pane>
        </Pane>
        <SaveCancel disabled={false} loading={false} />
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
