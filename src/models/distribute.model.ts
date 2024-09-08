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
  from: ICompanyInfo;
  to: ICompanyInfo;
  serials: string[];
  date: string;
}

export interface IDistributeContract {
  contract: string;
  product: string;
  serialize: string;
  distributes: IDistributeInfo[];
}
