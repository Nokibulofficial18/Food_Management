import Resource from '../models/Resource.js';

// @desc    Get all resources
// @route   GET /api/resources
// @access  Public
export const getResources = async (req, res) => {
  try {
    const { category, type, search } = req.query;
    
    let query = {};

    if (category) query.relatedCategory = category;
    if (type) query.type = type;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const resources = await Resource.find(query).sort({ createdAt: -1 });
    
    res.json({ resources, count: resources.length });
  } catch (error) {
    console.error('Get resources error:', error);
    res.status(500).json({ message: 'Error fetching resources', error: error.message });
  }
};

// @desc    Get single resource
// @route   GET /api/resources/:id
// @access  Public
export const getResourceById = async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({ resource });
  } catch (error) {
    console.error('Get resource error:', error);
    res.status(500).json({ message: 'Error fetching resource', error: error.message });
  }
};
