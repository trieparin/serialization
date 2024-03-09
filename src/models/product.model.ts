export enum ProductType {
  NON_DRUG = 'Non-Drug',
  HOUSEHOLD_REMEDY = 'Household Remedy',
  NON_DANGEROUS_DRUG = 'Non-Dangerous Drug',
  DANGEROUS_DRUG = 'Dangerous Drug',
  SPECIALLY_CONTROLLED_DRUG = 'Specially Controlled Drug',
}

export interface IActiveIngredient {
  name: string;
  quantity: number;
  uom: string;
}

export interface IProduct {
  regNo: string;
  name: string;
  type: ProductType;
  batch: string;
  size: number;
  unit: string;
  manufacturer: string;
  mfd: string;
  exp: string;
  activeIngredients: IActiveIngredient[];
}
