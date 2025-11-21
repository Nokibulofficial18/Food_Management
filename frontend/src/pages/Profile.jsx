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
  const [focusedField, setFocusedField] = useState('fullName');
  const [newPreference, setNewPreference] = useState('');
  const [removingPref, setRemovingPref] = useState(null);
  const [budgetUsed, setBudgetUsed] = useState(0);
  const [showDietarySuggestions, setShowDietarySuggestions] = useState(false);
  const [showLocationMap, setShowLocationMap] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const nameInputRef = useRef(null);
  const locationInputRef = useRef(null);
  const locationDebounceRef = useRef(null);

  const dietarySuggestions = ['Vegan', 'Keto', 'Paleo', 'Pescatarian', 'Dairy-Free', 'Nut-Free', 'Low-Carb', 'Mediterranean'];

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
      const userData = response.data.user;
      // Set default dietary preferences if empty
      if (!userData.dietaryPreferences || userData.dietaryPreferences.length === 0) {
        userData.dietaryPreferences = ['Vegetarian', 'Gluten-Free'];
      }
      setProfile(userData);
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async (query) => {
    if (!query || query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    try {
      // Using OpenStreetMap Nominatim - completely free, no API key needed
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FoodSaver App' // Required by Nominatim
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setLocationSuggestions(data);
      }
    } catch (error) {
      console.error('Location search failed:', error);
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (suggestion) => {
    setSelectedPlace({
      name: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon)
    });
    setProfile({ ...profile, location: suggestion.display_name });
    setLocationSuggestions([]);
    setShowLocationMap(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({ ...profile, [name]: value });
  };

  const incrementHouseholdSize = () => {
    setProfile({ ...profile, householdSize: Math.min(profile.householdSize + 1, 20) });
  };

  const decrementHouseholdSize = () => {
    setProfile({ ...profile, householdSize: Math.max(profile.householdSize - 1, 1) });
  };

  const addDietaryPreference = (pref) => {
    if (!profile.dietaryPreferences.includes(pref)) {
      setProfile({ 
        ...profile, 
        dietaryPreferences: [...profile.dietaryPreferences, pref] 
      });
    }
    setNewPreference('');
    setShowDietarySuggestions(false);
  };

  const handleDietaryPreferences = (e) => {
    const value = e.target.value;
    setNewPreference(value);
    setShowDietarySuggestions(value.length > 0);
    
    if (e.key === 'Enter' && value.trim()) {
      e.preventDefault();
      if (!profile.dietaryPreferences.includes(value.trim())) {
        setProfile({ 
          ...profile, 
          dietaryPreferences: [...profile.dietaryPreferences, value.trim()] 
        });
      }
      setNewPreference('');
      setShowDietarySuggestions(false);
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
              className="input-field bg-gray-100 cursor-not-allowed pr-32"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1.5 rounded-full font-semibold border border-green-300">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verified
              </span>
            </div>
          </div>
        </div>

        {/* Household Size */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Household Size
          </label>
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={decrementHouseholdSize}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-bold text-xl hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={profile.householdSize <= 1}
            >
              −
            </button>
            <div className="flex-1 text-center">
              <div className="text-4xl font-bold text-gray-900 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg py-4 border-2 border-blue-200">
                {profile.householdSize}
              </div>
              <p className="text-xs text-gray-500 mt-2">👥 Number of people</p>
            </div>
            <button
              type="button"
              onClick={incrementHouseholdSize}
              className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg font-bold text-xl hover:from-blue-600 hover:to-blue-700 active:scale-95 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={profile.householdSize >= 20}
            >
              +
            </button>
          </div>
        </div>

        {/* Dietary Preferences with Animated Pills */}
        <div className="glass-card">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences
          </label>
          <div className="mb-3 relative">
            <input
              type="text"
              value={newPreference}
              onChange={(e) => {
                setNewPreference(e.target.value);
                setShowDietarySuggestions(e.target.value.length > 0);
              }}
              onKeyDown={handleDietaryPreferences}
              onFocus={() => {
                setFocusedField('dietaryPreferences');
                if (newPreference) setShowDietarySuggestions(true);
              }}
              onBlur={() => {
                setFocusedField('');
                setTimeout(() => setShowDietarySuggestions(false), 200);
              }}
              className={`input-field transition-all duration-300 ${
                focusedField === 'dietaryPreferences' ? 'input-glow-blue' : ''
              }`}
              placeholder="Type to see suggestions (e.g., Vegetarian, Gluten-Free)"
            />
            
            {/* Suggestions Dropdown */}
            {showDietarySuggestions && (
              <div className="absolute z-20 w-full mt-2 glass-card-strong bg-white/95 border-2 border-blue-200 rounded-lg shadow-xl max-h-48 overflow-y-auto animate-fade-in-up">
                <div className="p-2">
                  <p className="text-xs font-bold text-gray-500 px-3 py-2">Suggestions:</p>
                  {dietarySuggestions
                    .filter(sug => 
                      sug.toLowerCase().includes(newPreference.toLowerCase()) &&
                      !profile.dietaryPreferences.includes(sug)
                    )
                    .map((suggestion, index) => (
                      <button
                        key={suggestion}
                        type="button"
                        onClick={() => addDietaryPreference(suggestion)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-gray-700 hover:text-blue-700"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  {newPreference && !dietarySuggestions.some(s => s.toLowerCase() === newPreference.toLowerCase()) && (
                    <button
                      type="button"
                      onClick={() => addDietaryPreference(newPreference)}
                      className="w-full text-left px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-sm font-semibold text-green-700 border border-green-200"
                    >
                      ✓ Add "{newPreference}"
                    </button>
                  )}
                </div>
              </div>
            )}
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
        <div className="glass-card relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <div className="relative">
            <input
              ref={locationInputRef}
              type="text"
              name="location"
              value={profile.location}
              onChange={(e) => {
                handleChange(e);
                // Debounce search
                if (locationDebounceRef.current) {
                  clearTimeout(locationDebounceRef.current);
                }
                locationDebounceRef.current = setTimeout(() => {
                  searchLocation(e.target.value);
                }, 500);
              }}
              onFocus={() => {
                setFocusedField('location');
                if (profile.location) searchLocation(profile.location);
              }}
              onBlur={() => {
                setFocusedField('');
                setTimeout(() => {
                  setLocationSuggestions([]);
                  setShowLocationMap(false);
                }, 300);
              }}
              className={`input-field pl-10 transition-all duration-300 ${
                focusedField === 'location' ? 'input-glow-blue' : ''
              }`}
              placeholder="Search for a city..."
            />
            {/* Map Pin Icon */}
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          {/* Location Suggestions Dropdown */}
          {locationSuggestions.length > 0 && (
            <div className="absolute z-40 left-0 right-0 mt-2 glass-card-strong bg-white/95 border-2 border-blue-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {locationSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => selectLocation(suggestion)}
                  className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3"
                >
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {suggestion.address?.city || suggestion.address?.town || suggestion.address?.village || suggestion.name || suggestion.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{suggestion.display_name}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Mini Map Overlay */}
          {showLocationMap && selectedPlace && (
            <div className="absolute z-30 left-0 right-0 mt-2 glass-card-strong bg-white/95 border-2 border-blue-200 rounded-lg shadow-xl p-4 animate-fade-in-up">
              <div className="bg-gradient-to-br from-blue-100 to-green-100 rounded-lg h-48 flex items-center justify-center relative overflow-hidden">
                {/* Placeholder Map Pattern */}
                <div className="absolute inset-0 opacity-20" style={{
                  backgroundImage: 'repeating-linear-gradient(0deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 20px), repeating-linear-gradient(90deg, #3b82f6 0px, #3b82f6 1px, transparent 1px, transparent 20px)'
                }}></div>
                
                {/* Location Pin */}
                <div className="relative z-10 text-center animate-bounce-subtle">
                  <svg className="w-16 h-16 text-red-500 mx-auto drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-700 mt-2 bg-white/90 px-3 py-1 rounded-full">
                    {profile.location || 'Search for a location'}
                  </p>
                  {selectedPlace && (
                    <p className="text-xs text-gray-500 mt-1">
                      📍 {selectedPlace.lat.toFixed(4)}, {selectedPlace.lng.toFixed(4)}
                    </p>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">🗺️ Powered by OpenStreetMap • Free & Open Source</p>
            </div>
          )}
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
          {profile.budgetPreference > 0 ? (
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
          ) : (
            <div className="mt-4 animate-fade-in-up">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-blue-600">
                  Budget Progress: Set a Goal!
                </span>
              </div>
              
              {/* Empty Progress Bar */}
              <div className="relative h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full overflow-hidden shadow-inner">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-500">
                    🎯 Set your monthly budget above
                  </span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 mt-2">
                💡 Enter a budget amount to start tracking your spending!
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
