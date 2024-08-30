export enum PageSize {
  PER_PAGE = 10,
}

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
  data?: Record<string, unknown>;
}

export interface IFormDialog {
  action: DialogAction;
  open: boolean;
  path: string;
  message: string;
  confirm?: boolean;
  change?: object;
  redirect?: string;
}
