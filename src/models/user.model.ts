export enum Role {
  ADMIN = 'Admin',
  SUPERVISOR = 'Supervisor',
  OPERATOR = 'Operator',
}

export interface IUser {
  uid: string;
  firstName: string;
  lastName: string;
  role: Role;
}
