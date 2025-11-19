import InventoryItem from '../models/InventoryItem.js';

// @desc    Get all inventory items for user
// @route   GET /api/inventory
// @access  Private
export const getInventory = async (req, res) => {
  try {
    const { category, expired } = req.query;
    
    let query = { userId: req.userId };

    if (category) query.category = category;

    const items = await InventoryItem.find(query).sort({ expirationDate: 1 });

    // Filter expired items if requested
    let filteredItems = items;
    if (expired === 'true') {
      filteredItems = items.filter(item => item.expirationDate < new Date());
    } else if (expired === 'false') {
      filteredItems = items.filter(item => item.expirationDate >= new Date());
    }

    res.json({ items: filteredItems, count: filteredItems.length });
  } catch (error) {
    console.error('Get inventory error:', error);
    res.status(500).json({ message: 'Error fetching inventory', error: error.message });
  }
};

// @desc    Create inventory item
// @route   POST /api/inventory
// @access  Private
export const createItem = async (req, res) => {
  try {
    const { itemName, category, quantity, purchaseDate, expirationDate, notes, imageUrl } = req.body;

    const item = await InventoryItem.create({
      userId: req.userId,
      itemName,
      category,
      quantity,
      purchaseDate: purchaseDate || Date.now(),
      expirationDate,
      notes,
      imageUrl
    });

    res.status(201).json({ message: 'Inventory item created', item });
  } catch (error) {
    console.error('Create item error:', error);
    res.status(500).json({ message: 'Error creating item', error: error.message });
  }
};

// @desc    Get single inventory item
// @route   GET /api/inventory/:id
// @access  Private
export const getItemById = async (req, res) => {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ item });
  } catch (error) {
    console.error('Get item error:', error);
    res.status(500).json({ message: 'Error fetching item', error: error.message });
  }
};

// @desc    Update inventory item
// @route   PUT /api/inventory/:id
// @access  Private
export const updateItem = async (req, res) => {
  try {
    const { itemName, category, quantity, purchaseDate, expirationDate, notes, imageUrl } = req.body;

    const item = await InventoryItem.findOne({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (itemName !== undefined) item.itemName = itemName;
    if (category !== undefined) item.category = category;
    if (quantity !== undefined) item.quantity = quantity;
    if (purchaseDate !== undefined) item.purchaseDate = purchaseDate;
    if (expirationDate !== undefined) item.expirationDate = expirationDate;
    if (notes !== undefined) item.notes = notes;
    if (imageUrl !== undefined) item.imageUrl = imageUrl;

    await item.save();

    res.json({ message: 'Item updated successfully', item });
  } catch (error) {
    console.error('Update item error:', error);
    res.status(500).json({ message: 'Error updating item', error: error.message });
  }
};

// @desc    Delete inventory item
// @route   DELETE /api/inventory/:id
// @access  Private
export const deleteItem = async (req, res) => {
  try {
    const item = await InventoryItem.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    console.error('Delete item error:', error);
    res.status(500).json({ message: 'Error deleting item', error: error.message });
  }
};
