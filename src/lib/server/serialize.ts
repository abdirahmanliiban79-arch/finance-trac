import type { IUser, UserDocument } from "./models/User";

export function serializeUser(user: UserDocument): Partial<IUser> {
  const safeUser = user.toObject() as Partial<IUser>;
  delete safeUser.password;
  return safeUser;
}
