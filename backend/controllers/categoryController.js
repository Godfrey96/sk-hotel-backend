import asyncHandler from 'express-async-handler';
import Category from '../models/categoryModel.js';

// Create a new category
const createCategory = asyncHandler(async (req, res) => {
    let category = new Category({
        name: req.body.name
    });
    category = await category.save();

    if (!category) {
        return res.status(400).send('the category cannot be created!');
    }
    res.send(category);
});

// Fetch all categories
const getCategories = asyncHandler(async (req, res) => {
    const categoryList = await Category.find();

    if (!categoryList) {
        res.status(500).json({ success: false });
    }
    res.status(200).send(categoryList);
});

// Fetch category by id
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id)

    if (!category) {
        res.status(500).json({ message: 'The category with the given ID was not found' })
    }
    res.status(200).send(category)
})

// Update category 
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findByIdAndUpdate(req.params.id, {
        name: req.body.name,
        icon: req.body.icon,
        color: req.body.color
    },
        { new: true }
    )
    if (!category) {
        return res.status(404).send('the category cannot be updated!');
    }
    res.send(category)
})

// delete category
const deleteCategory = asyncHandler(async (req, res) => {
    Category.findByIdAndRemove(req.params.id).then(category => {
        if (category) {
            return res.status(200).json({ success: true, message: 'the category is deleted' });
        } else {
            return res.status(404).json({ success: false, message: 'category not found' })
        }
    }).catch(err => {
        return res.status(400).json({ success: false, error: Err })
    })
})

export {
    createCategory,
    getCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
}