import generateToken from "../lib/generateToken.js";
import User from "../model/user.model.js";
import bcrypt from "bcrypt";

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid credential" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credential" });
    }

    generateToken(res, user);

    res.status(200).json({ message: "Successfully logged in" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};

export const checkAuth = async(req, res) => {
  try {
    const { id } = req.user;

    res.status(200).json({ message: "Successfully logged in", data: id});
  } catch (error) {
  res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "development",
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};
