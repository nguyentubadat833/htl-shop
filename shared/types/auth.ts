export enum  VarCookie {
  G_LOGIN= 'G_LOGIN',
  G_ID_TOKEN= 'G_ID_TOKEN',
}

// export enum UserRole {
//   ADMIN = "ADMIN"
// }

export interface UserAuthClient {
  name?: string;
  email: string;
  picture?: string;
  role?: string
}
