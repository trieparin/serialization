import { SaveCancel } from '@/components';
import { convertQuery } from '@/helpers/convert.helper';
import customFetch from '@/helpers/fetch.helper';
import { IFormAction } from '@/models/form.model';
import { IItem, ItemType } from '@/models/inventory.model';
import { IProduct, ProductType } from '@/models/product.model';
import {
  Autocomplete,
  Heading,
  IconButton,
  MinusIcon,
  Pane,
  PlusIcon,
  SelectField,
  TextInputField,
  majorScale,
} from 'evergreen-ui';
import { FocusEvent, useCallback, useReducer, useState } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';

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

  const [items, setItems] = useState<string[]>([]);
  const searchItem = async (query: string) => {
    const fch = customFetch();
    const { data }: { data: IItem[] } = await fch.get(`/items/filter?${query}`);
    const items = data.map((item) => item.name);
    setItems(items);
  };
  const debounceSearch = useCallback((search: Record<string, string>) => {
    const timeout = setTimeout(() => {
      const query = convertQuery(search);
      searchItem(query);
    }, 500);
    return () => clearTimeout(timeout);
  }, []);

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
      onSubmit={handleSubmit(() => formSubmit(getValues(), dirtyFields))}
    >
      <Pane is="fieldset" border="none">
        <Heading marginBottom={majorScale(2)}>Batch Information</Heading>
        <Pane
          display="grid"
          gridTemplateColumns="repeat(3, minmax(0, 1fr))"
          columnGap={majorScale(3)}
        >
          <Controller
            name="register"
            control={control}
            rules={{ required: true }}
            render={({ field }) => {
              const { onChange, ...rest } = field;
              return (
                <Autocomplete
                  {...rest}
                  items={items}
                  position="bottom-left"
                  onChange={(selected) => {
                    onChange(() => setValue('register', selected));
                  }}
                  initialInputValue={defaultValues?.register}
                >
                  {({ getInputProps, getRef, inputValue }) => (
                    <TextInputField
                      label="Register No."
                      type="text"
                      required
                      ref={getRef}
                      {...getInputProps({
                        id: 'register',
                        onChange: () => {
                          debounceSearch({
                            name: inputValue,
                            type: ItemType.REG_NO,
                          });
                        },
                      })}
                    />
                  )}
                </Autocomplete>
              );
            }}
          />
          <TextInputField
            label="Product Name"
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
          <SelectField
            label="Product Type"
            id="type"
            required
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
            required
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
            required
            min={0}
            defaultValue={defaultValues?.size}
            {...register('size', { required: true, min: 0 })}
          />
          <TextInputField
            label="Package"
            type="text"
            id="pack"
            required
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
            required
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
            required
            min={0}
            defaultValue={defaultValues?.amount}
            {...register('amount', { required: true, min: 0 })}
          />
          <TextInputField
            label="Unit"
            type="text"
            id="unit"
            required
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
              title="Append"
              size="small"
              intent="success"
              icon={PlusIcon}
              onClick={addIngredient}
            />
          )}
        </Pane>
        {fields.map((item, index) => (
          <Pane
            key={item.id}
            position="relative"
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <Controller
              name={`ingredients.${index}.ingredient`}
              control={control}
              rules={{ required: true }}
              render={({ field }) => {
                const { onChange, ...rest } = field;
                return (
                  <Autocomplete
                    {...rest}
                    items={items}
                    position="bottom-left"
                    onChange={(selected) => {
                      onChange(() =>
                        setValue(`ingredients.${index}.ingredient`, selected)
                      );
                    }}
                    initialInputValue={item.ingredient}
                  >
                    {({ getInputProps, getRef, inputValue }) => (
                      <TextInputField
                        label="Ingredient Name"
                        type="text"
                        required
                        ref={getRef}
                        {...getInputProps({
                          id: `ingredients.${index}.ingredient`,
                          onChange: () => {
                            debounceSearch({
                              name: inputValue,
                              type: ItemType.INGREDIENT,
                            });
                          },
                        })}
                      />
                    )}
                  </Autocomplete>
                );
              }}
            />
            <TextInputField
              label="Quantity"
              type="number"
              id={`quantity-${index}`}
              required
              min={0}
              defaultValue={item.quantity}
              {...register(`ingredients.${index}.quantity`, {
                required: true,
                min: 0,
              })}
            />
            <TextInputField
              label="Unit of Measurement"
              type="text"
              id={`uom-${index}`}
              required
              defaultValue={item.uom}
              width={fields.length > 1 ? '90%' : '100%'}
              {...register(`ingredients.${index}.uom`, {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue(
                    `ingredients.${index}.uom`,
                    event.currentTarget.value.trim()
                  );
                },
              })}
            />
            {fields.length > 1 && (
              <IconButton
                position="absolute"
                top="50%"
                right={0}
                transform="translateY(-50%)"
                type="button"
                name="remove"
                title="Remove"
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
            required
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
            required
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
            required
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
