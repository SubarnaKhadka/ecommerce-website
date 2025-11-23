export interface ICreateUser {
  email: string;
  password?: string;
  phone?: string;
}

export interface IUser {
  id: number;
  email_address: string;
  phone_address: string;
  role: string;
  password: string;
  refresh_token: string;
}
