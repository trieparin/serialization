import { PageTitle } from '@/components';
import { db } from '@/firebase/admin';
import { formatDate } from '@/helpers/convert.helper';
import customFetch from '@/helpers/fetch.helper';
import { connectWallet } from '@/helpers/wallet.helpers';
import { BaseLayout } from '@/layouts';
import { IDistributeInfo } from '@/models/distribute.model';
import { IProduct } from '@/models/product.model';
import { ISerialize } from '@/models/serialize.model';
import Traceability from '@/Traceability.json';
import { Contract, hashMessage } from 'ethers';
import {
  Alert,
  Heading,
  ListItem,
  majorScale,
  OrderedList,
  Pane,
  Text,
} from 'evergreen-ui';
import { GetServerSidePropsContext } from 'next';
import { useEffect, useState } from 'react';

interface IDistributeInfoCheck extends IDistributeInfo {
  error: boolean;
}

interface DistributeInfoProps {
  serialId: string;
  label: string;
  contract: string;
  distributes: IDistributeInfo[];
  product: IProduct;
}

export default function DistributeInfo({
  serialId,
  label,
  contract,
  distributes,
  product,
}: DistributeInfoProps) {
  const [checked, setChecked] = useState<boolean>(false);
  const [checkedInfo, setCheckedInfo] = useState<boolean>(false);
  const [checkedDist, setCheckedDist] = useState<IDistributeInfoCheck[]>([]);

  useEffect(() => {
    const checkDistribution = async () => {
      try {
        // Get raw product and serial data
        const fch = customFetch();
        const { data }: { data: ISerialize } = await fch.get(
          `/serials/${serialId}`
        );

        // Connect to wallet eg. MetaMask
        const provider = await connectWallet();

        // Hash to check raw data
        const [productHash, serializeHash] = await Promise.all([
          hashMessage(JSON.stringify(product)),
          hashMessage(JSON.stringify(data)),
        ]);
        const distributesHash = distributes.map((dist) =>
          hashMessage(JSON.stringify(dist))
        );

        // Check raw data with hash in smart contract
        const distribution = new Contract(contract, Traceability.abi, provider);
        await distribution.checkInfo(productHash, serializeHash);
        const checkDist = distributes as IDistributeInfoCheck[];
        distributesHash.forEach(async (dist, index) => {
          try {
            await distribution.checkDistribute(
              dist,
              checkDist[index].sender.address,
              checkDist[index].receiver.address
            );
          } catch (e) {
            checkDist[index].error = true;
          }
        });
        setCheckedDist(checkDist);
        setCheckedInfo(true);
        console.log(checkDist);
      } catch (e) {
        console.log(e);
      }
    };
    checkDistribution();
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <BaseLayout>
      <PageTitle title={label} />
      {checked && (
        <>
          <Alert
            intent={checkedInfo ? 'success' : 'danger'}
            title={
              checkedInfo
                ? 'Product and serialize data is validated'
                : 'Warning modified product or serialize data'
            }
            marginBottom={majorScale(2)}
          />
          <Pane
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            gap={majorScale(2)}
          >
            <Pane>
              <Heading marginBottom={majorScale(1)}>Register No:</Heading>
              <Text>{product.register}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Product Name:</Heading>
              <Text>{product.name}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Product Type:</Heading>
              <Text>{product.type}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Batch No:</Heading>
              <Text>{product.batch}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Batch Size:</Heading>
              <Text>{`${product.size} ${product.pack}`}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Package Info:</Heading>
              <Text>{`${product.unit} of ${product.amount} ${product.dosage} / Package`}</Text>
            </Pane>
            <Pane gridColumn="span 3">
              <Heading marginBottom={majorScale(1)}>
                Active Ingredients:
              </Heading>
              <OrderedList>
                {product.ingredients.map(({ ingredient, quantity, uom }) => (
                  <ListItem key={ingredient}>
                    {`${ingredient} ${quantity} ${uom}`}
                  </ListItem>
                ))}
              </OrderedList>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Manufacturer:</Heading>
              <Text>{product.manufacturer}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Manufacture Date:</Heading>
              <Text>{formatDate(product.mfd)}</Text>
            </Pane>
            <Pane>
              <Heading marginBottom={majorScale(1)}>Expiration Date:</Heading>
              <Text>{formatDate(product.exp)}</Text>
            </Pane>
          </Pane>
          <Pane
            display="flex"
            flexDirection="column"
            gap={majorScale(2)}
          >
            <Heading marginTop={majorScale(2)}>Distribution:</Heading>
            {checkedDist.map(({ date, sender, receiver, error }, index) => (
              <Alert
                key={index}
                intent={error ? 'danger' : 'success'}
                title={
                  error
                    ? `${formatDate(date)} (Warning modified distribution data)`
                    : `${formatDate(date)}`
                }
              >
                <Pane marginTop={majorScale(1)}>
                  <Text>From: {sender.company}</Text>
                  <br />
                  <Text>To: {receiver.company}</Text>
                </Pane>
              </Alert>
            ))}
          </Pane>
        </>
      )}
    </BaseLayout>
  );
}

export async function getServerSideProps({ query }: GetServerSidePropsContext) {
  try {
    if (!query.address || !query.serial)
      return { redirect: { destination: '/404' } };

    const doc = (
      await db
        .collection('distributes')
        .doc(query.id as string)
        .get()
    ).data();

    if (!doc?.catalogs[query.address as string].includes(query.serial)) {
      return { redirect: { destination: '/404' } };
    }

    const product = (
      await db.collection('products').doc(doc.product).get()
    ).data();

    const list: IDistributeInfo[] = [];
    const findDistribute = (address: string) => {
      const dist = doc.distributes.find(
        (dist: IDistributeInfo) => dist.receiver.address === address
      );
      if (dist) {
        list.push(dist);
        findDistribute(dist.sender.address);
      }
    };
    findDistribute(query.address as string);

    return {
      props: {
        serialId: doc.serialize,
        label: doc.label,
        contract: doc.contract,
        distributes: list,
        product,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/404' } };
  }
}
