import { PageTitle, SaveCancel } from '@/components';
import { LoadingContext } from '@/contexts/LoadingContext';
import { db } from '@/firebase/admin';
import { downloadFile } from '@/helpers/convert.helper';
import { BaseLayout } from '@/layouts';
import { IDistributeInfo, ROLE } from '@/models/distribute.model';
import { Heading, majorScale, Pane, SelectField } from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { ChangeEvent, FormEvent, useContext, useState } from 'react';
import QRCode from 'react-qr-code';

interface DistributePrintProps {
  id: string;
  address: string;
  label: string;
  catalog: string[];
}

export default function DistributePrint({
  id,
  address,
  label,
  catalog,
}: DistributePrintProps) {
  const { loading, startLoading, stopLoading } = useContext(LoadingContext);
  const [selected, setSelected] = useState('');

  const formSubmit = async (e: FormEvent) => {
    e.preventDefault();
    startLoading();
    const qrCode = document.getElementById('QRCode');
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const img = new Image();
    img.onload = () => {
      const context = canvas.getContext('2d');
      context?.drawImage(img, 0, 0);
      const name = label.replaceAll(' ', '');
      downloadFile(canvas.toDataURL('image/png'), `${name}_${selected}.png`);
    };
    img.src = `data:image/svg+xml;base64,${window.btoa(
      qrCode?.outerHTML as string
    )}`;
    stopLoading();
  };

  return (
    <BaseLayout>
      <PageTitle title={label} />
      <Heading
        is="h2"
        size={600}
        marginBottom={majorScale(2)}
      >
        Download QR Code
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
          <SelectField
            label="Select Serial"
            id="serial"
            value={selected}
            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
              setSelected(e.currentTarget.value)
            }
          >
            <option
              value=""
              disabled
            >
              -- Select Serial --
            </option>
            {catalog.map((item) => (
              <option
                key={item}
                value={item}
              >
                {item}
              </option>
            ))}
          </SelectField>
        </Pane>
        {selected && (
          <Pane
            textAlign="center"
            marginBottom={majorScale(3)}
          >
            <QRCode
              id="QRCode"
              value={`${id}?address=${address}&serial=${selected}`}
            />
            <Heading is="h3">{selected}</Heading>
          </Pane>
        )}
        <SaveCancel
          disabled={false}
          loading={loading}
          text="Download"
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
    const sender = getDistribute().receiver;

    if (
      parseInt(sender.role) !== ROLE.PHARMACY ||
      !doc?.catalogs[query.address as string].length
    ) {
      return { redirect: { destination: '/no-permission' } };
    }

    return {
      props: {
        id: query.id,
        address: query.address,
        label: doc.label,
        catalog: doc.catalogs[query.address as string],
      },
    };
  } catch (e) {
    return { redirect: { destination: '/404' } };
  }
}
