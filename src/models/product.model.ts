export enum ProductType {
  NON_DRUG = 'Non-Drug',
  HOUSEHOLD_REMEDY = 'Household Remedy',
  NON_DANGEROUS_DRUG = 'Non-Dangerous Drug',
  DANGEROUS_DRUG = 'Dangerous Drug',
  SPECIALLY_CONTROLLED_DRUG = 'Specially Controlled Drug',
}

export enum ProductStatus {
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
  type: ProductType;
  batch: string;
  size: number;
  pack: string;
  dosage: string;
  amount: number;
  unit: string;
  manufacturer: string;
  mfd: string;
  exp: string;
  ingredients: IIngredient[];
  status: ProductStatus;
  id?: string;
  serial?: string;
}
