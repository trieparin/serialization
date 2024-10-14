import { PageTitle, SaveCancel } from '@/components';
import { db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { checkWallet, connectWallet } from '@/helpers/wallet.helpers';
import { BaseLayout } from '@/layouts';
import {
  ICompanyInfo,
  IDistributeInfo,
  MODE,
  ROLE,
} from '@/models/distribute.model';
import { IFormMessage } from '@/models/form.model';
import Traceability from '@/Traceability.json';
import { Contract, hashMessage } from 'ethers';
import {
  Heading,
  majorScale,
  Pane,
  SelectField,
  TagInput,
  TextInputField,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { FocusEvent, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

interface DistributeRequestProps {
  id: string;
  label: string;
  contract: string;
  product: string;
  serialize: string;
  catalogs: Record<string, string[]>;
  sender: ICompanyInfo;
}

export default function DistributeRequest({
  id,
  label,
  contract,
  product,
  serialize,
  catalogs,
  sender,
}: DistributeRequestProps) {
  const catalog = catalogs[sender.address];
  const router = useRouter();
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
      role: ROLE.DISTRIBUTOR,
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
      // Get raw product and serial data
      const fch = customFetch();
      const values = getValues();
      const [{ data: productData }, { data: serializeData }] =
        await Promise.all([
          await fch.get(`/products/${product}`),
          await fch.get(`/serials/${serialize}`),
        ]);

      // Connect to wallet eg. MetaMask
      const provider = await connectWallet();
      let signer;
      if (checkWallet()) {
        signer = await provider.getSigner(0);
      } else {
        const idx = parseInt(prompt('Input test account index')!);
        signer = await provider.getSigner(idx);
      }

      // Hash and update data in smart contract
      const update = catalog.filter((item) => !values.shipment.includes(item));
      const [productHash, serializeHash, catalogHash, updateHash] =
        await Promise.all([
          hashMessage(JSON.stringify(productData)),
          hashMessage(JSON.stringify(serializeData)),
          hashMessage(JSON.stringify(catalog)),
          hashMessage(JSON.stringify(update)),
        ]);
      const distribution = new Contract(contract, Traceability.abi, signer);
      const transaction = await distribution.shipmentRequest(
        productHash,
        serializeHash,
        catalogHash,
        updateHash,
        values.address,
        values.role as ROLE
      );

      console.log({
        product: {
          data: productData,
          hash: productHash,
        },
        serialize: {
          data: serializeData,
          hash: serializeHash,
        },
        catalog: {
          data: catalog,
          hash: catalogHash,
        },
        update: {
          data: update,
          hash: updateHash,
        },
        transaction,
      });

      // Update distribute data in database
      const distribute = {
        mode: MODE.REQUEST,
        catalogs: { ...catalogs, [signer.address]: update },
        info: {
          sender: {
            address: signer.address,
            company: sender.company,
            role: sender.role as ROLE,
          },
          receiver: {
            address: values.address,
            company: values.company,
            role: values.role as ROLE,
          },
          shipment: values.shipment,
        },
      };
      const { message }: IFormMessage = await fch.patch(
        `/distributes/${id}`,
        distribute
      );
      toaster.success(message);
      router.reload();
    } catch (e) {
      console.log(e);
      toaster.danger('An error occurred');
    }
  };

  return (
    <BaseLayout>
      <PageTitle title="Distribute Request" />
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
            <SelectField
              label="Receiver Role"
              id="role"
              required
              defaultValue={defaultValues?.role}
              {...register('role', { required: true })}
            >
              <option
                key={ROLE.DISTRIBUTOR}
                value={ROLE.DISTRIBUTOR}
              >
                Distributor
              </option>
              <option
                key={ROLE.PHARMACY}
                value={ROLE.PHARMACY}
              >
                Pharmacy
              </option>
            </SelectField>
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

    const getDistribute = () => {
      return data?.distributes.filter(
        ({ receiver }: IDistributeInfo) => receiver.address === query.address
      )[0];
    };
    const sender = getDistribute().receiver;

    if (
      sender.role === ROLE.PHARMACY ||
      !data?.catalogs[sender.address].length
    ) {
      return { redirect: { destination: '/no-permission' } };
    }

    return {
      props: {
        id: query.id,
        label: data?.label,
        product: data?.product,
        serialize: data?.serialize,
        contract: data?.contract,
        catalogs: data?.catalogs,
        sender,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
