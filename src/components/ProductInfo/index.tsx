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

export const ProductInfo = ({ id }: { id: string }) => {
  const [productInfo, setProductInfo] = useState<IProduct>(null!);

  useEffect(() => {
    const getInfo = async () => {
      const fch = customFetch();
      const { data }: { data: IProduct } = await fch.get(`/products/${id}`);
      setProductInfo(data);
    };
    getInfo();
  }, [id]);

  return productInfo ? (
    <Pane
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      gap={majorScale(2)}
    >
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Register No.:</Heading>
        <Text>{productInfo.register}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Product Name:</Heading>
        <Text>{productInfo.name}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Product Type:</Heading>
        <Text>{productInfo.type}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Batch No.:</Heading>
        <Text>{productInfo.batch}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Batch Size:</Heading>
        <Text>{`${productInfo.size} ${productInfo.unit}`}</Text>
      </Pane>
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Active Ingredients:</Heading>
        <OrderedList>
          {productInfo.ingredients.map(
            ({ ingredient, quantity, uom }, index) => (
              <ListItem
                key={index}
              >{`${ingredient} ${quantity} ${uom}`}</ListItem>
            )
          )}
        </OrderedList>
      </Pane>
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Manufacturer:</Heading>
        <Text>{productInfo.manufacturer}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Manufacture Date:</Heading>
        <Text>{productInfo.mfd}</Text>
      </Pane>
      <Pane>
        <Heading marginBottom={majorScale(1)}>Expiration Date:</Heading>
        <Text>{productInfo.exp}</Text>
      </Pane>
    </Pane>
  ) : (
    <Spinner marginX="auto" />
  );
};
