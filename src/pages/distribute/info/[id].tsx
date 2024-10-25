import { PageTitle } from '@/components';
import { db } from '@/firebase/admin';
import { formatDate } from '@/helpers/convert.helper';
import { BaseLayout } from '@/layouts';
import { IDistributeInfo } from '@/models/distribute.model';
import { IProduct } from '@/models/product.model';
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

interface DistributeInfoProps {
  label: string;
  contract: string;
  distributes: IDistributeInfo[];
  product: IProduct;
}

export default function DistributeInfo({
  label,
  contract,
  distributes,
  product,
}: DistributeInfoProps) {
  console.log(contract);
  return (
    <BaseLayout>
      <PageTitle title={label} />
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
          <Heading marginBottom={majorScale(1)}>Active Ingredients:</Heading>
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
        {distributes.map(({ date, sender, receiver }, index) => (
          <Alert
            key={index}
            intent="success"
            title={formatDate(date)}
          >
            <Pane marginTop={majorScale(1)}>
              <Text>From: {sender.company}</Text>
              <br />
              <Text>To: {receiver.company}</Text>
            </Pane>
          </Alert>
        ))}
      </Pane>
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
    const product = (
      await db.collection('products').doc(doc?.product).get()
    ).data();

    if (!doc?.catalogs[query.address as string].includes(query.serial)) {
      return { redirect: { destination: '/404' } };
    }

    return {
      props: {
        label: doc?.label,
        contract: doc?.contract,
        distributes: doc?.distributes,
        product,
      },
    };
  } catch (e) {
    return { redirect: { destination: '/404' } };
  }
}
