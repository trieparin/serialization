import customFetch from '@/helpers/fetch.helper';
import { IProduct } from '@/models/product.model';
import {
  Heading,
  ListItem,
  OrderedList,
  Pane,
  Spinner,
  Text,
  majorScale,
} from 'evergreen-ui';
import { useEffect, useState } from 'react';

export const ViewInfo = ({ id }: { id: string }) => {
  const [viewInfo, setViewInfo] = useState<IProduct>(null!);

  useEffect(() => {
    const getInfo = async () => {
      const fch = customFetch();
      const { data }: { data: IProduct } = await fch.get(`/products/${id}`);
      setViewInfo(data);
    };
    getInfo();
  }, [id]);

  return viewInfo ? (
    <Pane
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      gap={majorScale(2)}
    >
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Register No.:</Heading>
        <Text>{viewInfo.register}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Product Name:</Heading>
        <Text>{viewInfo.name}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Product Type:</Heading>
        <Text>{viewInfo.type}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Batch No.:</Heading>
        <Text>{viewInfo.batch}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Batch Size:</Heading>
        <Text>{`${viewInfo.size} ${viewInfo.container}`}</Text>
      </Pane>
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Active Ingredients:</Heading>
        <OrderedList>
          {viewInfo.ingredients.map(({ ingredient, quantity, uom }, index) => (
            <ListItem key={index}>
              {`${ingredient} ${quantity} ${uom}`}
            </ListItem>
          ))}
        </OrderedList>
      </Pane>
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Manufacturer:</Heading>
        <Text>{viewInfo.manufacturer}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Manufacture Date:</Heading>
        <Text>{viewInfo.mfd}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Expiration Date:</Heading>
        <Text>{viewInfo.exp}</Text>
      </Pane>
    </Pane>
  ) : (
    <Spinner marginX="auto" />
  );
};
