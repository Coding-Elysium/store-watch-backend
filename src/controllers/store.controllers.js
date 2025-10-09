export const addStore = async (req, res) => {
  try {
  } catch (error) {
    console.log("Error in addStore controller:", error);
    res
      .status(500)
      .json({ message: "Error adding store", error: error.message });
  }
};
