import { PageTitle, SaveCancel } from '@/components';
import { BaseLayout } from '@/layouts';
import { Pane, SelectField, TextInputField, majorScale } from 'evergreen-ui';
import { useState } from 'react';

export default function ProductCreate() {
  const [product, setProduct] = useState({});

  return (
    <BaseLayout>
      <PageTitle title="New Product" />
      <Pane is="form">
        <Pane
          is="fieldset"
          display="grid"
          gridTemplateColumns="repeat(3, minmax(0, 1fr))"
          columnGap={majorScale(3)}
          border="none"
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
            <option value="1">Type 1</option>
            <option value="2">Type 2</option>
            <option value="3">Type 3</option>
            <option value="4">Type 4</option>
            <option value="Non-Drug">Non-Drug</option>
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
        <SaveCancel />
      </Pane>
    </BaseLayout>
  );
}
