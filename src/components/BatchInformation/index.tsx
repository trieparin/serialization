import { ProductType } from '@/models/product.model';
import {
  Heading,
  Pane,
  SelectField,
  TextInputField,
  majorScale,
} from 'evergreen-ui';

export const BatchInformation = () => {
  const productTypes = Object.values(ProductType);

  return (
    <Pane display="flex" flexFlow="column">
      <Heading marginBottom={majorScale(2)}>Batch Information</Heading>
      <Pane
        display="grid"
        gridTemplateColumns="repeat(3, minmax(0, 1fr))"
        columnGap={majorScale(3)}
      >
        <TextInputField
          label="Register No."
          name="regNo"
          id="regNo"
          type="text"
          required
        />
        <TextInputField
          label="Product Name"
          name="productName"
          id="productName"
          type="text"
          required
        />
        <SelectField
          label="Product Type"
          name="productType"
          id="productType"
          required
        >
          {productTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </SelectField>
        <TextInputField
          label="Batch"
          name="batch"
          id="batch"
          type="text"
          required
        />
        <TextInputField
          label="Size"
          name="size"
          id="size"
          type="number"
          min={0}
          required
        />
        <TextInputField
          label="Unit"
          name="unit"
          id="unit"
          type="text"
          required
        />
        <TextInputField
          label="Manufacturer"
          name="manufacturer"
          id="manufacturer"
          type="text"
          required
        />
        <TextInputField
          label="Manufactured Date"
          name="mfd"
          id="mfd"
          type="date"
          required
        />
        <TextInputField
          label="Expired Date"
          name="exp"
          id="exp"
          type="date"
          required
        />
      </Pane>
    </Pane>
  );
};
