import jwt from "jsonwebtoken";

const generateToken = ({ id, res }) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    cookies: { httpOnly: true, secure: true, sameSite: "none" },
    expiresIn: "30d",
  });
};

export default generateToken;
