import User from '../models/User.js';

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { fullName, householdSize, dietaryPreferences, location, budgetPreference } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if provided
    if (fullName !== undefined) user.fullName = fullName;
    if (householdSize !== undefined) user.householdSize = householdSize;
    if (dietaryPreferences !== undefined) user.dietaryPreferences = dietaryPreferences;
    if (location !== undefined) user.location = location;
    if (budgetPreference !== undefined) user.budgetPreference = budgetPreference;

    await user.save();

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        householdSize: user.householdSize,
        dietaryPreferences: user.dietaryPreferences,
        location: user.location,
        budgetPreference: user.budgetPreference
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};
