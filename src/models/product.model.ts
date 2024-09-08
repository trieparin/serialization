export enum PRODUCT_TYPE {
  NON_DRUG = 'Non-Drug',
  HOUSEHOLD_REMEDY = 'Household Remedy',
  NON_DANGEROUS_DRUG = 'Non-Dangerous Drug',
  DANGEROUS_DRUG = 'Dangerous Drug',
  SPECIALLY_CONTROLLED_DRUG = 'Specially Controlled Drug',
}

export enum PRODUCT_STATUS {
  CREATED = 'Created',
  APPROVED = 'Approved',
  SERIALIZED = 'Serialized',
}

export interface IIngredient {
  ingredient: string;
  quantity: number;
  uom: string;
}

export interface IProduct {
  register: string;
  name: string;
  type: PRODUCT_TYPE;
  batch: string;
  size: number;
  pack: string;
  unit: string;
  amount: number;
  dosage: string;
  manufacturer: string;
  mfd: string;
  exp: string;
  ingredients: IIngredient[];
  status: PRODUCT_STATUS;
  id?: string;
  serial?: string;
  created?: number;
  updated?: number;
}
