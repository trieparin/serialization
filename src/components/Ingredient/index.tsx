import {
  Heading,
  IconButton,
  MinusIcon,
  Pane,
  PlusIcon,
  TextInputField,
  majorScale,
} from 'evergreen-ui';
import { MouseEvent, useState } from 'react';

export const Ingredient = () => {
  const simpleId = () => {
    return Math.random().toString(36).substring(2, 6);
  };
  const [ingredientList, setIngredientList] = useState([
    {
      id: simpleId(),
    },
  ]);
  const addActiveIngredient = () => {
    setIngredientList([
      ...ingredientList,
      {
        id: simpleId(),
      },
    ]);
  };
  const removeActiveIngredient = (event: MouseEvent) => {
    const removed = ingredientList.filter(
      ({ id }) => id !== event.currentTarget.id
    );
    setIngredientList(removed);
  };

  return (
    <Pane display="flex" flexFlow="column">
      <Heading marginBottom={majorScale(1)}>
        Active Ingredients
        <IconButton
          type="button"
          icon={PlusIcon}
          size="small"
          intent="success"
          marginLeft={majorScale(1)}
          onClick={addActiveIngredient}
        />
      </Heading>
      <Pane id="ingredientList">
        {ingredientList.map(({ id }) => (
          <Pane
            key={id}
            position="relative"
            display="grid"
            gridTemplateColumns="repeat(3, minmax(0, 1fr))"
            columnGap={majorScale(3)}
          >
            <TextInputField
              label="Ingredient Name"
              name="ingredientName"
              id="ingredientName"
              type="text"
              required
            />
            <TextInputField
              label="Quantity"
              name="quantity"
              id="quantity"
              type="number"
              min={0}
              required
            />
            <TextInputField
              width="90%"
              label="Unit of Measurement"
              name="uom"
              id="uom"
              type="text"
              required
            />
            <IconButton
              id={id}
              position="absolute"
              top="50%"
              transform="translateY(-50%)"
              right={0}
              type="button"
              icon={MinusIcon}
              size="small"
              intent="danger"
              onClick={removeActiveIngredient}
            />
          </Pane>
        ))}
      </Pane>
    </Pane>
  );
};
