import ConsumptionLog from '../models/ConsumptionLog.js';

// @desc    Get all consumption logs for user
// @route   GET /api/consumption
// @access  Private
export const getLogs = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let query = { userId: req.userId };

    // Add filters if provided
    if (category) query.category = category;
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const logs = await ConsumptionLog.find(query).sort({ date: -1 });
    
    res.json({ logs, count: logs.length });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Error fetching logs', error: error.message });
  }
};

// @desc    Create consumption log
// @route   POST /api/consumption
// @access  Private
export const createLog = async (req, res) => {
  try {
    const { itemName, quantity, category, date, notes } = req.body;

    const log = await ConsumptionLog.create({
      userId: req.userId,
      itemName,
      quantity,
      category,
      date: date || Date.now(),
      notes
    });

    res.status(201).json({ message: 'Consumption log created', log });
  } catch (error) {
    console.error('Create log error:', error);
    res.status(500).json({ message: 'Error creating log', error: error.message });
  }
};

// @desc    Get single consumption log
// @route   GET /api/consumption/:id
// @access  Private
export const getLogById = async (req, res) => {
  try {
    const log = await ConsumptionLog.findOne({ _id: req.params.id, userId: req.userId });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({ log });
  } catch (error) {
    console.error('Get log error:', error);
    res.status(500).json({ message: 'Error fetching log', error: error.message });
  }
};

// @desc    Update consumption log
// @route   PUT /api/consumption/:id
// @access  Private
export const updateLog = async (req, res) => {
  try {
    const { itemName, quantity, category, date, notes } = req.body;

    const log = await ConsumptionLog.findOne({ _id: req.params.id, userId: req.userId });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    if (itemName !== undefined) log.itemName = itemName;
    if (quantity !== undefined) log.quantity = quantity;
    if (category !== undefined) log.category = category;
    if (date !== undefined) log.date = date;
    if (notes !== undefined) log.notes = notes;

    await log.save();

    res.json({ message: 'Log updated successfully', log });
  } catch (error) {
    console.error('Update log error:', error);
    res.status(500).json({ message: 'Error updating log', error: error.message });
  }
};

// @desc    Delete consumption log
// @route   DELETE /api/consumption/:id
// @access  Private
export const deleteLog = async (req, res) => {
  try {
    const log = await ConsumptionLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });

    if (!log) {
      return res.status(404).json({ message: 'Log not found' });
    }

    res.json({ message: 'Log deleted successfully' });
  } catch (error) {
    console.error('Delete log error:', error);
    res.status(500).json({ message: 'Error deleting log', error: error.message });
  }
};
