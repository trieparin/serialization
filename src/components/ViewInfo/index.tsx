import { formatDate } from '@/helpers/convert.helper';
import { IProduct } from '@/models/product.model';
import {
  Heading,
  ListItem,
  OrderedList,
  Pane,
  Text,
  majorScale,
} from 'evergreen-ui';

export const ViewInfo = ({ product }: { product: IProduct }) => {
  return (
    <Pane
      display="grid"
      gridTemplateColumns="repeat(2, minmax(0, 1fr))"
      gap={majorScale(2)}
    >
      <Pane gridColumn="span 2">
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
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Package Info:</Heading>
        <Text>{`${product.dosage} of ${product.amount} ${product.unit} / Package`}</Text>
      </Pane>
      <Pane gridColumn="span 2">
        <Heading marginBottom={majorScale(1)}>Active Ingredients:</Heading>
        <OrderedList>
          {product.ingredients.map(({ ingredient, quantity, uom }) => (
            <ListItem key={ingredient}>
              {`${ingredient} ${quantity} ${uom}`}
            </ListItem>
          ))}
        </OrderedList>
      </Pane>
      <Pane gridColumn="span 2">
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
  );
};
