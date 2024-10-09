import { PageTitle, SaveCancel } from '@/components';
import { db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { BaseLayout } from '@/layouts';
import { IFormMessage } from '@/models/form.model';
import {
  Heading,
  majorScale,
  Pane,
  TagInput,
  TextInputField,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import router from 'next/router';
import { FocusEvent, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface DistributeInfoProps {
  id: string;
  label: string;
  contract: string;
  catalog: string[];
}

export default function DistributeInfo({
  id,
  label,
  contract,
  catalog,
}: DistributeInfoProps) {
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    control,
    formState: { isDirty, isValid, isSubmitting, defaultValues },
  } = useForm({
    defaultValues: {
      address: '',
      company: '',
      shipment: catalog,
    },
  });

  const [items, setItems] = useState(catalog);
  const autoCompleteItems = useMemo(() => {
    return defaultValues?.shipment?.filter((item) => {
      return !items.includes(item as string);
    });
  }, [defaultValues?.shipment, items]);

  const formSubmit = async () => {
    try {
      // TODO: Distribute
      const fch = customFetch();
      const { message }: IFormMessage = await fch.patch(
        `/distributes/${id}`,
        getValues()
      );
      toaster.success(message);
      router.push('/scan');
    } catch (e) {
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Distribute Info" />
      <Heading
        is="h2"
        size={600}
        marginBottom={majorScale(2)}
      >
        {label}
      </Heading>
      <Pane
        is="form"
        onSubmit={handleSubmit(formSubmit)}
      >
        <Pane
          is="fieldset"
          border="none"
        >
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Contract Address"
              type="text"
              id="contract"
              disabled
              defaultValue={contract}
            />
            <TextInputField
              label="Receiver Address"
              type="text"
              id="address"
              required
              defaultValue={defaultValues?.address}
              {...register('address', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('address', event.currentTarget.value.trim());
                },
              })}
            />
            <TextInputField
              label="Receiver Company"
              type="text"
              id="company"
              required
              defaultValue={defaultValues?.company}
              {...register('company', {
                required: true,
                onBlur: (event: FocusEvent<HTMLInputElement>) => {
                  setValue('company', event.currentTarget.value.trim());
                },
              })}
            />
            <Pane
              gridColumn="span 3"
              marginBottom={majorScale(3)}
            >
              <Heading
                is="h3"
                size={400}
                marginBottom={majorScale(1)}
              >
                Shipment
              </Heading>
              <Controller
                name="shipment"
                control={control}
                rules={{ required: true }}
                render={({ field }) => {
                  const { onChange, ...rest } = field;
                  return (
                    <TagInput
                      {...rest}
                      width="100%"
                      inputProps={{ placeholder: 'Serial Number' }}
                      autocompleteItems={autoCompleteItems as string[]}
                      values={items}
                      onChange={(values) => {
                        onChange(() => {
                          setItems(values);
                          setValue('shipment', values);
                        });
                      }}
                    />
                  );
                }}
              />
            </Pane>
          </Pane>
        </Pane>
        <SaveCancel
          disabled={!isDirty || !isValid}
          loading={isSubmitting}
        />
      </Pane>
    </BaseLayout>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  try {
    if (!query.address) return { redirect: { destination: '/404' } };
    const doc = await db
      .collection('distributes')
      .doc(query.id as string)
      .get();
    const data = doc.data();

    return {
      props: {
        id: query.id,
        label: data?.label,
        contract: data?.contract,
        catalog: data?.catalogs[query.address as string],
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
