export enum ItemType {
  INGREDIENT = 'Ingredient',
  REG_NO = 'Register No.',
}

export interface IItem {
  name: string;
  note: string;
  type: ItemType;
  id?: string;
}
