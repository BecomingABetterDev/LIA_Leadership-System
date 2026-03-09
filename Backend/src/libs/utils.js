import jwt from "jsonwebtoken"

export const generateToken = (userId, res, type = "student") => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  const cookieName =
    type === "student" ? "studentToken" : type === "club" ? "clubToken" : "adminToken";

  res.cookie(cookieName, token, {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
    secure: process.env.NODE_ENV !== "development",
    path: "/",
  });

  return token;
};