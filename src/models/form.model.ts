export enum PAGE_SIZE {
  PER_PAGE = 10,
}

export enum DIALOG_ACTION {
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
  action: DIALOG_ACTION;
  open: boolean;
  path: string;
  message: string;
  confirm?: boolean;
  change?: Record<string, unknown>;
  redirect?: string;
}
