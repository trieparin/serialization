export enum SerializeStatus {
  CREATED = 'Created',
  LABELED = 'Labeled',
  DISTRIBUTED = 'Distributed',
}

export interface ISerialize {
  serials: string[];
  status: SerializeStatus;
  id?: string;
  product?: string;
}
