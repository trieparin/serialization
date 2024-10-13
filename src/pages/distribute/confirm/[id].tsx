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

interface DistributeInfoProps {
  id: string;
  label: string;
  contract: string;
  product: string;
  serialize: string;
  distribute: IDistributeInfo;
}

export default function DistributeInfo({
  id,
  label,
  contract,
  product,
  serialize,
  distribute,
}: DistributeInfoProps) {
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
      const fch = customFetch();
      const [{ data: productData }, { data: serializeData }] =
        await Promise.all([
          await fch.get(`/products/${product}`),
          await fch.get(`/serials/${serialize}`),
        ]);
      const [productHash, serializeHash, distributeHash, shipmentHash] =
        await Promise.all([
          hashMessage(JSON.stringify(productData)),
          hashMessage(JSON.stringify(serializeData)),
          hashMessage(JSON.stringify(distribute)),
          hashMessage(JSON.stringify(distribute.shipment)),
        ]);
      console.log(productHash, serializeHash, distributeHash, shipmentHash);
      const provider = await connectWallet();
      let signer;
      if (checkWallet()) {
        signer = await provider.getSigner(0);
      } else {
        const idx = parseInt(prompt('Input test account index')!);
        signer = await provider.getSigner(idx);
      }
      const { message }: IFormMessage = await fch.patch(`/distributes/${id}`, {
        mode: MODE.CONFIRM,
        data: {
          [signer.address]: distribute.shipment,
        },
      });
      const distribution = new Contract(contract, Traceability.abi, signer);
      const shipment = await distribution.shipmentConfirm(
        productHash,
        serializeHash,
        distributeHash,
        shipmentHash,
        distribute.sender.address
      );
      console.log(shipment);
      toaster.success(message);
      router.push(`/distribute/request/${id}?address=${signer.address}`);
    } catch (e) {
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
        Save Information ({label})
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

    return {
      props: {
        id: query.id,
        label: data?.label,
        product: data?.product,
        serialize: data?.serialize,
        contract: data?.contract,
        distribute: getDistribute(),
      },
    };
  } catch (e) {
    return { redirect: { destination: '/' } };
  }
}
