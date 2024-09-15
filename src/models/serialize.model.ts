export enum SERIALIZE_STATUS {
  LABELED = 'Labeled',
  VERIFIED = 'Verified',
  DISTRIBUTED = 'Distributed',
}

export interface ISerialize {
  serials: string[];
  status: SERIALIZE_STATUS;
  label: string;
  id?: string;
  product?: string;
  created?: number;
  updated?: number;
}
