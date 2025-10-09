import { paginate } from "../lib/paginate.js";
import ActivityLog from "../model/activitylog.model.js";
import Category from "../model/category.model.js";

export const addCategory = async(req, res) => {
    try {
        const { categoryName } = req.body;
        const { id } = req.user;

        if (!categoryName) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newCategory = new Category({
            categoryName,
        })
        
        const result = await newCategory.save();
        
        await ActivityLog.create({
            actor: id,
            activity: "Created User",
            description: `You have created a new user`
        });
        
    res.status(200).json({ message: "Successfully added a category", result });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Internal server error", error: error.message });
  }
}

export const readCategory = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        
        const filter = {
            isDeleted: false, 
        };

        const result = await paginate(Category, {
            filter,
            page,
            limit,
            select: "-__v"
        });

        res.status(200).json({
            message: "Successfully fetched categories",
            ...result,
        });
    } catch (error) {
        console.error("Read Category Error:", error);
        res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { categoryName } = req.body;

    if (!categoryName) {
      return res.status(400).json({ message: "Category name is required." });
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      id, 
      { categoryName },
      { new: true, runValidators: true } 
    );

    if (!updatedCategory) {
      return res.status(404).json({ message: "Category not found." });
    }

    res.status(200).json({
      message: "Category updated successfully.",
      category: updatedCategory,
    });
  } catch (error) {
    console.error("Error updating category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCategory = async(req, res) => {
    try {
        const { id } = req.params;

        const deletedCategory = await Category.findByIdAndUpdate(
            id, 
            { isDeleted: true },
            { new: true, runValidators: true } 
        );

        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found." });
        }

        res.status(200).json({
            message: "Category deleted successfully",
            category: deleteCategory,
        });
  } catch (error) {
    console.error("Error deleting category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
}