import { SaveCancel } from '@/components';
import { IFormAction } from '@/models/form.model';
import { IProduct, ProductType } from '@/models/product.model';
import {
  Heading,
  IconButton,
  MinusIcon,
  Pane,
  PlusIcon,
  SelectField,
  TextInputField,
  majorScale,
} from 'evergreen-ui';
import { FocusEvent, useReducer } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

interface ProductFormProps {
  initForm: IProduct;
  formSubmit: (value: object, change?: object) => void;
}

export const ProductForm = ({ initForm, formSubmit }: ProductFormProps) => {
  const formReducer = (
    state: { mfd: string; exp: string },
    action: IFormAction
  ) => {
    const { type, payload } = action;
    switch (type) {
      case 'SET_MFD':
        return {
          ...state,
          mfd: payload,
        };
      case 'SET_EXP':
        return {
          ...state,
          exp: payload,
        };
      default:
        return { ...state };
    }
  };
  const [state, dispatch] = useReducer(formReducer, {
    mfd: initForm.mfd,
    exp: initForm.exp,
  });

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { isDirty, isValid, isSubmitting, dirtyFields, defaultValues },
  } = useForm<IProduct>({ defaultValues: initForm });
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

  return (
    <Pane
      is="form"
      onSubmit={handleSubmit(() => {
        formSubmit(getValues(), dirtyFields);
      })}
    >
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
            label="Batch No."
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
            label="Package"
            type="text"
            id="pack"
            defaultValue={defaultValues?.pack}
            {...register('pack', {
              required: true,
              onBlur: (event: FocusEvent<HTMLInputElement>) => {
                setValue('pack', event.currentTarget.value.trim());
              },
            })}
          />
          <TextInputField
            label="Dosage Form"
            type="text"
            id="dosage"
            defaultValue={defaultValues?.dosage}
            {...register('dosage', {
              required: true,
              onBlur: (event: FocusEvent<HTMLInputElement>) => {
                setValue('dosage', event.currentTarget.value.trim());
              },
            })}
          />
          <TextInputField
            label="Amount"
            type="number"
            id="amount"
            defaultValue={defaultValues?.amount}
            {...register('amount', { required: true, min: 0 })}
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
        <Pane display="flex" alignItems="center" justifyContent="space-between">
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
        <Heading marginBottom={majorScale(2)}>Manufacture Information</Heading>
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
                  type: 'SET_MFD',
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
                  type: 'SET_EXP',
                  payload: event.currentTarget.value,
                });
              },
            })}
          />
        </Pane>
      </Pane>
      <SaveCancel disabled={!isDirty || !isValid} loading={isSubmitting} />
    </Pane>
  );
};
