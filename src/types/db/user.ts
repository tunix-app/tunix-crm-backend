export type User = {
  id: string;
  email: string;
  role: UserRole;
  phone: string;
  bio: string;
  first_name: string;
  last_name: string;
};

export enum UserRole {
  ADMIN = 'Admin',
  COACH = 'Coach',
  CLIENT = 'Client',
}
