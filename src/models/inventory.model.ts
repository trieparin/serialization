export enum ItemType {
  INGREDIENT = 'Ingredient',
  REG_NO = 'Register No.',
}

export interface IItem {
  name: string;
  type: ItemType;
  note?: string;
  id?: string;
}
