import Traceability from '@/Traceability.json';
import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { db } from '@/firebase/admin';
import customFetch from '@/helpers/fetch.helper';
import { checkWallet, connectWallet } from '@/helpers/wallet.helpers';
import { BaseLayout } from '@/layouts';
import { IDistributeInfo, MODE, ROLE } from '@/models/distribute.model';
import { IFormMessage } from '@/models/form.model';
import { Contract, hashMessage } from 'ethers';
import {
  Heading,
  majorScale,
  Pane,
  TagInput,
  TextInputField,
  toaster,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useRouter } from 'next/router';
import { FormEvent, useContext } from 'react';

interface DistributeConfirmProps {
  id: string;
  label: string;
  contract: string;
  product: string;
  serialize: string;
  catalogs: Record<string, string[]>;
  distribute: IDistributeInfo;
}

export default function DistributeConfirm({
  id,
  label,
  contract,
  product,
  serialize,
  catalogs,
  distribute,
}: DistributeConfirmProps) {
  const router = useRouter();
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);

  const getRole = (role: ROLE) => {
    if (role === ROLE.DISTRIBUTOR) {
      return 'Distributor';
    } else {
      return 'Manufacturer';
    }
  };

  const formSubmit = async (e: FormEvent) => {
    e.preventDefault();
    startLoading();
    try {
      // Get raw product and serial data
      const fch = customFetch();
      const [{ data: productData }, { data: serializeData }] =
        await Promise.all([
          await fch.get(`/products/${product}`),
          await fch.get(`/serials/${serialize}`),
        ]);

      // Connect to wallet eg. MetaMask
      const provider = await connectWallet();
      let signer;
      if (checkWallet()) {
        signer = await provider.getSigner();
      } else {
        const idx = parseInt(prompt('Signer account?')!);
        signer = await provider.getSigner(idx);
      }

      // Hash and update data in smart contract
      const [productHash, serializeHash, distributeHash, shipmentHash] =
        await Promise.all([
          hashMessage(JSON.stringify(productData)),
          hashMessage(JSON.stringify(serializeData)),
          hashMessage(JSON.stringify(distribute)),
          hashMessage(JSON.stringify(distribute.shipment)),
        ]);
      const distribution = new Contract(contract, Traceability.abi, signer);
      const transaction = await distribution.shipmentConfirm(
        productHash,
        serializeHash,
        distributeHash,
        shipmentHash,
        distribute.sender.address
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
        distribute: {
          data: distribute,
          hash: distributeHash,
        },
        shipment: {
          data: distribute.shipment,
          hash: shipmentHash,
        },
        transaction,
      });

      // Update distribute data in database
      const update = { ...catalogs, [signer.address]: distribute.shipment };
      const { message }: IFormMessage = await fch.patch(`/distributes/${id}`, {
        mode: MODE.CONFIRM,
        update,
      });
      toaster.success(message);
      router.push('/scan');
    } catch (e) {
      console.log(e);
      toaster.danger('An error occurred');
    }
    stopLoading();
  };

  return (
    <BaseLayout>
      <PageTitle title="Distribute Confirmation" />
      <Heading
        is="h2"
        size={600}
        marginBottom={majorScale(2)}
      >
        Confirm Information {label}
      </Heading>
      <Pane
        is="form"
        onSubmit={(e: FormEvent) => formSubmit(e)}
      >
        <Pane
          is="fieldset"
          border="none"
          disabled={loading}
        >
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Sender Address"
              type="text"
              id="address"
              disabled
              defaultValue={distribute.sender.address}
            />
            <TextInputField
              label="Sender Company"
              type="text"
              id="company"
              disabled
              defaultValue={distribute.sender.company}
            />
            <TextInputField
              label="Sender Role"
              type="text"
              id="role"
              disabled
              defaultValue={getRole(distribute.sender.role)}
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
              <TagInput
                width="100%"
                values={distribute.shipment}
                disabled
              />
            </Pane>
          </Pane>
        </Pane>
        <SaveCancel
          disabled={false}
          loading={loading}
          text="Confirm"
        />
      </Pane>
    </BaseLayout>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  try {
    if (!query.address) return { redirect: { destination: '/404' } };

    const doc = (
      await db
        .collection('distributes')
        .doc(query.id as string)
        .get()
    ).data();

    const getDistribute = () => {
      return doc?.distributes.filter(
        ({ receiver }: IDistributeInfo) => receiver.address === query.address
      )[0];
    };

    if (doc?.catalogs[query.address as string]) {
      return { redirect: { destination: '/no-permission' } };
    }

    return {
      props: {
        id: query.id,
        label: doc?.label,
        product: doc?.product,
        serialize: doc?.serialize,
        contract: doc?.contract,
        catalogs: doc?.catalogs,
        distribute: getDistribute(),
      },
    };
  } catch (e) {
    return { redirect: { destination: '/404' } };
  }
}
