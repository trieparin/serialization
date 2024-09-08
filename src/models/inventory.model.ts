export enum ITEM_TYPE {
  INGREDIENT = 'Ingredient',
  REG_NO = 'Register No.',
}

export interface IItem {
  name: string;
  note: string;
  type: ITEM_TYPE;
  id?: string;
}
