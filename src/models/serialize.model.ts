export enum SerializeStatus {
  LABELED = 'Labeled',
  VERIFIED = 'Verified',
  DISTRIBUTED = 'Distributed',
}

export interface ISerialize {
  serials: string[];
  status: SerializeStatus;
  label: string;
  id?: string;
  product?: string;
}
