const db = require('../config/database');

// Get all categories for a user
const getCategories = (req, res) => {
  const userId = req.user.id;
  
  db.all('SELECT * FROM categories WHERE userId = ?', [userId], (err, categories) => {
    if (err) {
      console.error('Error fetching categories:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    
    // Parse the fields JSON for each category
    const parsedCategories = categories.map(category => ({
      ...category,
      fields: category.fields ? JSON.parse(category.fields) : []
    }));
    
    res.json(parsedCategories);
  });
};

// Get a single category by ID
const getCategoryById = (req, res) => {
  const userId = req.user.id;
  const categoryId = req.params.id;
  
  db.get(
    'SELECT * FROM categories WHERE id = ? AND userId = ?',
    [categoryId, userId],
    (err, category) => {
      if (err) {
        console.error('Error fetching category:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      // Parse the fields JSON
      const parsedCategory = {
        ...category,
        fields: category.fields ? JSON.parse(category.fields) : []
      };
      
      res.json(parsedCategory);
    }
  );
};

// Create a new category
const createCategory = (req, res) => {
  const userId = req.user.id;
  const { name, description, fields } = req.body;
  
  if (!name || !fields || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'Name and fields array are required' });
  }

  // Validate fields structure
  const isValidFields = fields.every(field => 
    field.name && field.type && typeof field.required === 'boolean' && field.label
  );

  if (!isValidFields) {
    return res.status(400).json({ 
      error: 'Each field must have name, type, required (boolean), and label properties' 
    });
  }

  const sql = `
    INSERT INTO categories (userId, name, description, fields)
    VALUES (?, ?, ?, ?)
  `;

  db.run(sql, [userId, name, description, JSON.stringify(fields)], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      console.error('Error creating category:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    res.status(201).json({
      id: this.lastID,
      userId,
      name,
      description,
      fields
    });
  });
};

// Update a category
const updateCategory = (req, res) => {
  const userId = req.user.id;
  const categoryId = req.params.id;
  const { name, description, fields } = req.body;

  if (!name || !fields || !Array.isArray(fields)) {
    return res.status(400).json({ error: 'Name and fields array are required' });
  }

  // Validate fields structure
  const isValidFields = fields.every(field => 
    field.name && field.type && typeof field.required === 'boolean' && field.label
  );

  if (!isValidFields) {
    return res.status(400).json({ 
      error: 'Each field must have name, type, required (boolean), and label properties' 
    });
  }

  const sql = `
    UPDATE categories 
    SET name = ?, description = ?, fields = ?, updatedAt = CURRENT_TIMESTAMP
    WHERE id = ? AND userId = ?
  `;

  db.run(sql, [name, description, JSON.stringify(fields), categoryId, userId], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Category name already exists' });
      }
      console.error('Error updating category:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json({
      id: categoryId,
      userId,
      name,
      description,
      fields
    });
  });
};

// Delete a category
const deleteCategory = (req, res) => {
  const userId = req.user.id;
  const categoryId = req.params.id;

  db.run(
    'DELETE FROM categories WHERE id = ? AND userId = ?',
    [categoryId, userId],
    function(err) {
      if (err) {
        console.error('Error deleting category:', err);
        return res.status(500).json({ error: 'Internal server error' });
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Category not found' });
      }

      res.json({ message: 'Category deleted successfully' });
    }
  );
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory
}; 