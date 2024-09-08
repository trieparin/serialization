import { IProduct } from '@/models/product.model';
import { ISerialize } from '@/models/serialize.model';

export enum ROLE {
  MANUFACTURER,
  DISTRIBUTOR,
  PHARMACY,
}

export interface IDistributeInfo {
  address: string;
  company: string;
  serials: string[];
  role: ROLE;
}

export interface IDistributeContract {
  contract?: string;
  product: IProduct;
  serialize: ISerialize;
  distributes: IDistributeInfo[];
}
