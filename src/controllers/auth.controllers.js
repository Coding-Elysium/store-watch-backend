import generateToken from "../lib/generateToken.js";
import User from "../model/user.model.js";

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

    console.log(res);

    const token = generateToken({ id: user._id, res });

    res.status(200).json({ message: "Successfully logged in", token });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
};
