export enum ROLE {
  MANUFACTURER,
  DISTRIBUTOR,
  PHARMACY,
}

export interface ICompanyInfo {
  address: string;
  company: string;
  role: ROLE;
}

export interface IDistributeInfo {
  sender: ICompanyInfo;
  receiver: ICompanyInfo;
  shipment: string[];
  date: string;
}

export interface IDistribute {
  label: string;
  contract: string;
  product: string;
  serialize: string;
  catalogs: Record<string, string[]>;
  distributes: IDistributeInfo[];
  id?: string;
}
