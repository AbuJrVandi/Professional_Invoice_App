const express = require('express');
const router = express.Router();
const { authenticateJWT } = require('../middleware/auth');
const {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

// All routes require authentication
router.use(authenticateJWT);

// Get all categories
router.get('/', getCategories);

// Get single category
router.get('/:id', getCategoryById);

// Create new category
router.post('/', createCategory);

// Update category
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

module.exports = router; 