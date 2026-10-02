import jwt, { type JwtPayload } from "jsonwebtoken";
import { connectDB } from "./db";
import { AppError } from "./errors";
import { User, type UserDocument } from "./models/User";

interface TokenPayload extends JwtPayload {
  id: string;
}

const PLACEHOLDER_SECRET = "change_me_to_a_long_random_secret";
const MIN_SECRET_LENGTH = 32;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new AppError("Server configuration error", 500);
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (
    isProduction &&
    (secret === PLACEHOLDER_SECRET || secret.length < MIN_SECRET_LENGTH)
  ) {
    console.error(
      "[auth] JWT_SECRET is missing, too short, or still the example placeholder.",
    );
    throw new AppError("Server configuration error", 500);
  }

  return secret;
}

export function generateToken(userId: string): string {
  return jwt.sign({ id: userId }, getJwtSecret(), {
    algorithm: "HS256",
    expiresIn: "30d",
  });
}

export async function authenticate(request: Request): Promise<UserDocument> {
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(\S+)$/i);

  if (!match) {
    throw new AppError("You are not logged in! Please log in to get access.", 401);
  }

  const token = match[1];
  let decoded: TokenPayload;

  try {
    decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as TokenPayload;
  } catch {
    throw new AppError("Invalid or expired token. Please log in again.", 401);
  }

  await connectDB();

  const user = await User.findById(decoded.id);

  if (!user) {
    throw new AppError("The user belonging to this token no longer exists.", 401);
  }

  return user;
}
