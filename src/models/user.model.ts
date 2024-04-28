export enum Role {
  OPERATOR = 'Operator',
  SUPERVISOR = 'Supervisor',
  ADMIN = 'Admin',
}

export interface IUser {
  email?: string;
  displayName?: string;
  firstName?: string;
  lastName?: string;
  role?: Role;
}

export interface IUserForm extends IUser {
  password?: string;
  pwd?: string;
}

export interface IUserContext extends IUser {
  uid?: string;
  token?: string;
}
