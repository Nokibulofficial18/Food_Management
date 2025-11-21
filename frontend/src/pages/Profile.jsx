import { useState, useEffect, useRef } from 'react';
import { userAPI } from '../api';

const Profile = () => {
  const [profile, setProfile] = useState({
    fullName: '',
    email: '',
    householdSize: 1,
    dietaryPreferences: [],
    location: '',
    budgetPreference: 0
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [focusedField, setFocusedField] = useState('');
  const [newPreference, setNewPreference] = useState('');
  const [removingPref, setRemovingPref] = useState(null);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const nameInputRef = useRef(null);

  useEffect(() => {
    loadProfile();
    // Simulate budget calculation (would come from actual spending data)
    const calculateBudgetUsed = () => {
      const used = Math.floor(Math.random() * 100); // Replace with actual API call
      setBudgetUsed(used);
    };
    calculateBudgetUsed();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await userAPI.getProfile();
      setProfile(response.data.user);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const handleDietaryPreferences = (e) => {
    if (e.key === 'Enter' && newPreference.trim()) {
      e.preventDefault();
      if (!profile.dietaryPreferences.includes(newPreference.trim())) {
        setProfile({ 
          ...profile, 
          dietaryPreferences: [...profile.dietaryPreferences, newPreference.trim()] 
        });
      }
      setNewPreference('');
    }
  };

  const removeDietaryPreference = (prefToRemove) => {
    setRemovingPref(prefToRemove);
    setTimeout(() => {
      setProfile({
        ...profile,
        dietaryPreferences: profile.dietaryPreferences.filter(p => p !== prefToRemove)
      });
      setRemovingPref(null);
    }, 300);
  };

  const getBudgetPercentage = () => {
    if (!profile.budgetPreference || profile.budgetPreference === 0) return 0;
    return Math.min((budgetUsed / profile.budgetPreference) * 100, 100);
  };

  const getBudgetColor = () => {
    const percentage = getBudgetPercentage();
    if (percentage < 50) return 'from-green-400 to-green-500';
    if (percentage < 80) return 'from-yellow-400 to-yellow-500';
    return 'from-red-400 to-red-500';
  };

  const getPrefColor = (index) => {
    const colors = [
      'bg-pink-100 text-pink-700 border-pink-300',
      'bg-blue-100 text-blue-700 border-blue-300',
      'bg-green-100 text-green-700 border-green-300',
      'bg-purple-100 text-purple-700 border-purple-300',
      'bg-yellow-100 text-yellow-700 border-yellow-300',
      'bg-indigo-100 text-indigo-700 border-indigo-300',
      'bg-red-100 text-red-700 border-red-300',
      'bg-teal-100 text-teal-700 border-teal-300',
    ];
    return colors[index % colors.length];
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    // Simulate save delay for animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await userAPI.updateProfile(profile);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Failed to update profile');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </div>

      {/* Success/Error Message */}
      {message && (
        <div className={`p-4 rounded-lg mb-6 animate-fade-in-up glass-card ${
          message.includes('success') 
            ? 'bg-green-100/40 text-green-700 border-2 border-green-300/50' 
            : 'bg-red-100/40 text-red-700 border-2 border-red-300/50'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-xl">{message.includes('success') ? '✓' : '✕'}</span>
            <span className="font-medium">{message}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Full Name with Animated Glow */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <div className="relative">
            <input
              ref={nameInputRef}
              type="text"
              name="fullName"
              value={profile.fullName}
              onChange={handleChange}
              onFocus={() => setFocusedField('fullName')}
              onBlur={() => setFocusedField('')}
              className={`input-field transition-all duration-300 ${
                focusedField === 'fullName' ? 'input-glow-blue' : ''
              }`}
              placeholder="Enter your full name"
            />
          </div>
        </div>

        {/* Email (Disabled) */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={profile.email}
              disabled
              className="input-field bg-gray-100 cursor-not-allowed"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">Verified</span>
            </div>
          </div>
        </div>

        {/* Household Size */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Household Size
          </label>
          <input
            type="number"
            name="householdSize"
            value={profile.householdSize}
            onChange={handleChange}
            onFocus={() => setFocusedField('householdSize')}
            onBlur={() => setFocusedField('')}
            min={1}
            max={20}
            className={`input-field transition-all duration-300 ${
              focusedField === 'householdSize' ? 'input-glow-blue' : ''
            }`}
          />
          <p className="text-xs text-gray-500 mt-2">👥 Number of people in your household</p>
        </div>

        {/* Dietary Preferences with Animated Pills */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="mb-3">
            <input
              type="text"
              value={newPreference}
              onChange={(e) => setNewPreference(e.target.value)}
              onKeyDown={handleDietaryPreferences}
              onFocus={() => setFocusedField('dietaryPreferences')}
              onBlur={() => setFocusedField('')}
              className={`input-field transition-all duration-300 ${
                focusedField === 'dietaryPreferences' ? 'input-glow-blue' : ''
              }`}
              placeholder="Type and press Enter to add (e.g., vegetarian, gluten-free)"
            />
          </div>
          
          {/* Animated Pill Badges */}
          {profile.dietaryPreferences.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {profile.dietaryPreferences.map((pref, index) => (
                <div
                  key={pref}
                  className={`
                    px-4 py-2 rounded-full border-2 font-semibold text-sm
                    transition-all duration-300 transform
                    ${getPrefColor(index)}
                    ${removingPref === pref ? 'wiggle-out' : 'wiggle-in'}
                    hover:scale-110 cursor-pointer
                    animate-wiggle
                  `}
                  onClick={() => removeDietaryPreference(pref)}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <span>{pref}</span>
                  <span className="ml-2 text-xs opacity-70">✕</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <p className="text-gray-500 text-sm">No dietary preferences added yet</p>
              <p className="text-gray-400 text-xs mt-1">Type above and press Enter to add</p>
            </div>
          )}
        </div>

        {/* Location */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            onFocus={() => setFocusedField('location')}
            onBlur={() => setFocusedField('')}
            className={`input-field transition-all duration-300 ${
              focusedField === 'location' ? 'input-glow-blue' : ''
            }`}
            placeholder="City, State/Country"
          />
        </div>

        {/* Monthly Budget with Progress Bar */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Budget Preference ($)
          </label>
          <input
            type="number"
            name="budgetPreference"
            value={profile.budgetPreference}
            onChange={handleChange}
            onFocus={() => setFocusedField('budgetPreference')}
            onBlur={() => setFocusedField('')}
            min={0}
            step={10}
            className={`input-field transition-all duration-300 ${
              focusedField === 'budgetPreference' ? 'input-glow-blue' : ''
            }`}
            placeholder="Set your monthly food budget"
          />
          
          {/* Budget Progress Bar */}
          {profile.budgetPreference > 0 && (
            <div className="mt-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-700">
                  Budget Progress: {getBudgetPercentage().toFixed(1)}% used
                </span>
                <span className="text-sm text-gray-600">
                  ${budgetUsed} / ${profile.budgetPreference}
                </span>
              </div>
              
              {/* Progress Bar Container */}
              <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                {/* Animated Progress Fill */}
                <div
                  className={`h-full bg-gradient-to-r ${getBudgetColor()} transition-all duration-1000 ease-out relative overflow-hidden`}
                  style={{ width: `${getBudgetPercentage()}%` }}
                >
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                </div>
                
                {/* Percentage Text Overlay */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700 drop-shadow">
                    {getBudgetPercentage() > 5 && `${getBudgetPercentage().toFixed(0)}%`}
                  </span>
                </div>
              </div>
              
              {/* Budget Status Message */}
              <p className="text-xs text-gray-500 mt-2">
                {getBudgetPercentage() < 50 && '💰 You\'re doing great! Plenty of budget remaining.'}
                {getBudgetPercentage() >= 50 && getBudgetPercentage() < 80 && '⚠️ You\'ve used over half your budget.'}
                {getBudgetPercentage() >= 80 && '🚨 Careful! You\'re approaching your budget limit.'}
              </p>
            </div>
          )}
        </div>

        {/* Animated Save Button */}
        <div className="glass-card-strong bg-gradient-to-br from-white/60 to-green-100/40">
          <button
            type="submit"
            disabled={saving}
            className={`
              w-full py-4 px-6 rounded-lg font-bold text-lg
              transition-all duration-300 transform
              ${saving 
                ? 'bg-green-400 scale-95 cursor-wait' 
                : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-105 hover:shadow-xl active:scale-95'
              }
              text-white shadow-lg
              disabled:opacity-90
            `}
          >
            {saving ? (
              <span className="flex items-center justify-center gap-3">
                {/* Spinning Loader */}
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Saving...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <span>💾</span>
                <span>Save Changes</span>
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;
