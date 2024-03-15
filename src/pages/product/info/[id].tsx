import { PageTitle, SaveCancel } from '@/components';
import { admin, db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { formChangeValue } from '@/helpers/form.helper';
import { BaseLayout } from '@/layouts';
import { IFormAction, IFormMessage } from '@/models/form.model';
import { IProduct, ProductType } from '@/models/product.model';
import { Role } from '@/models/user.model';
import {
  Heading,
  IconButton,
  MinusIcon,
  Pane,
  PlusIcon,
  SelectField,
  TextInputField,
  majorScale,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { ParsedUrlQuery } from 'querystring';
import { FocusEvent, useReducer } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface ProductInfoProps {
  params: ParsedUrlQuery;
  data: IProduct;
}

const formReducer = (state: object, action: IFormAction) => {
  const { type, payload } = action;
  switch (type) {
    case 'set_mfd':
      return {
        ...state,
        mfd: payload,
      };
    case 'set_exp':
      return {
        ...state,
        exp: payload,
      };
    default:
      return { ...state };
  }
};

export default function ProductInfo({ params, data }: ProductInfoProps) {
  const router = useRouter();
  const [state, dispatch] = useReducer(formReducer, {});
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { isDirty, isValid, isSubmitting, dirtyFields, defaultValues },
  } = useForm({
    defaultValues: data,
  });
  const { fields, append, remove } = useFieldArray({
    name: 'ingredients',
    control,
  });

  const addIngredient = () => {
    if (fields.length < 3) {
      append({ ingredient: '', quantity: 0, uom: '' });
    }
  };

  const removeIngredient = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const formSubmit = async () => {
    try {
      const data: object = formChangeValue(dirtyFields, getValues());
      const fch = customFetch();
      const { message }: IFormMessage = await fch.patch(
        `/products/${params.id}`,
        data
      );
      toaster.success(message);
      router.push('/product');
    } catch (error) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Edit Product Info" />
      <Pane is="form" onSubmit={handleSubmit(formSubmit)}>
        <Pane is="fieldset" border="none">
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
              {...register('type', { required: true })}
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
              {...register('size', { required: true, min: 0 })}
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
          </Pane>
          <Pane
            display="flex"
            alignItems="center"
            justifyContent="space-between"
          >
            <Heading position="relative" marginBottom={majorScale(2)}>
              Active Ingredients
            </Heading>
            {fields.length < 3 && (
              <IconButton
                type="button"
                name="append"
                title="append"
                size="small"
                intent="success"
                icon={PlusIcon}
                onClick={addIngredient}
              />
            )}
          </Pane>
          {fields.map((field, index) => (
            <Pane
              key={field.id}
              position="relative"
              display="grid"
              gridTemplateColumns="repeat(3, minmax(0, 1fr))"
              columnGap={majorScale(3)}
            >
              <TextInputField
                label="Ingredient Name"
                type="text"
                id={`ingredient-${index}`}
                {...register(`ingredients.${index}.ingredient`, {
                  required: true,
                })}
              />
              <TextInputField
                label="Quantity"
                type="number"
                id={`quantity-${index}`}
                {...register(`ingredients.${index}.quantity`, {
                  required: true,
                  min: 0,
                })}
              />
              <TextInputField
                label="Unit of Measurement"
                type="text"
                id={`uom-${index}`}
                width={fields.length > 1 ? '90%' : '100%'}
                {...register(`ingredients.${index}.uom`, { required: true })}
              />
              {fields.length > 1 && (
                <IconButton
                  position="absolute"
                  top="50%"
                  right={0}
                  transform="translateY(-50%)"
                  type="button"
                  name="remove"
                  title="remove"
                  size="small"
                  intent="danger"
                  icon={MinusIcon}
                  onClick={() => removeIngredient(index)}
                />
              )}
            </Pane>
          ))}
          <Heading marginBottom={majorScale(2)}>
            Manufacture Information
          </Heading>
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
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
              label="Manufacture Date"
              type="date"
              id="mfd"
              max={state.exp}
              defaultValue={defaultValues?.mfd}
              {...register('mfd', {
                required: true,
                max: state.exp,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_mfd',
                    payload: event.currentTarget.value,
                  });
                },
              })}
            />
            <TextInputField
              label="Expiration Date"
              type="date"
              id="exp"
              min={state.mfd}
              defaultValue={defaultValues?.exp}
              {...register('exp', {
                required: true,
                min: state.mfd,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  dispatch({
                    type: 'set_exp',
                    payload: event.currentTarget.value,
                  });
                },
              })}
            />
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
  try {
    const { role } = await admin.verifyIdToken(req.cookies.token!);
    if (role === Role.ADMIN) return { redirect: { destination: '/' } };

    const doc = await db
      .collection('/products')
      .doc(params?.id as string)
      .get();
    const data = doc.exists && doc.data();

    return {
      props: {
        params,
        data,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
