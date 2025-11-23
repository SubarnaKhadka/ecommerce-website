import { Exclude } from "class-transformer";

export class UserDto {
  id: number;
  email_address: string;
  phone_address: string;
  role: string;

  @Exclude({ toPlainOnly: true })
  password: string;

  @Exclude({ toPlainOnly: true })
  refresh_token: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }
}
