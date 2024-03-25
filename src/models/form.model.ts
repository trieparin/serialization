export enum DialogAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
}

export interface IFormAction {
  type: string;
  payload: string;
}

export interface IFormMessage {
  message: string;
}

export interface IFormDialog {
  action: DialogAction;
  open: boolean;
  path: string;
  message: string;
  approve?: boolean;
  change?: object;
  redirect?: string;
}
