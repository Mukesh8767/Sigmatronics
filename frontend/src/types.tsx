
export interface IUser {
  _id: string;
  name: string;
  email: string;
  phoneNumber?:string;
  parentUser?: string;
  resetOtp?: string;
  resetOtpExpires?: string;
  createdAt: string;
  updatedAt: string;
}
