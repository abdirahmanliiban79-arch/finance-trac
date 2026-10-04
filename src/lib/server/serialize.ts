import type { UserDocument } from "./models/User";

export interface SerializedUser {
  _id: string;
  id: string;
  username: string;
  email: string;
  role: string;
  profilePic: string;
}

export function serializeUser(user: UserDocument): SerializedUser {
  const id = String(user._id);
  return {
    _id: id,
    id,
    username: user.username,
    email: user.email,
    role: user.role,
    profilePic: user.profilePic ?? "",
  };
}
