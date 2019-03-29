import jwt from "jsonwebtoken";

export const createToken = async (user, secret) => {
  const token = await jwt.sign(user, secret, {
    expiresIn: "7d"
  });

  return token;
};
