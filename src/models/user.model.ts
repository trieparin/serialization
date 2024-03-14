export enum Role {
  OPERATOR = 'Operator',
  SUPERVISOR = 'Supervisor',
  ADMIN = 'Admin',
}

export interface IUser {
  uid: string;
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
  token?: string;
}
