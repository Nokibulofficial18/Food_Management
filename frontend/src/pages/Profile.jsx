import { useState, useEffect } from 'react';
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

  useEffect(() => {
    loadProfile();
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
    const preferences = e.target.value.split(',').map(p => p.trim());
    setProfile({ ...profile, dietaryPreferences: preferences });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      await userAPI.updateProfile(profile);
      setMessage('Profile updated successfully!');
    } catch (error) {
      setMessage('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

      {message && (
        <div className={`p-4 rounded-lg mb-6 ${
          message.includes('success') ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={profile.fullName}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email
          </label>
          <input
            type="email"
            value={profile.email}
            disabled
            className="input-field bg-gray-100 cursor-not-allowed"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Household Size
          </label>
          <input
            type="number"
            name="householdSize"
            value={profile.householdSize}
            onChange={handleChange}
            min={1}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dietary Preferences (comma-separated)
          </label>
          <input
            type="text"
            value={profile.dietaryPreferences.join(', ')}
            onChange={handleDietaryPreferences}
            className="input-field"
            placeholder="vegetarian, gluten-free, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Location
          </label>
          <input
            type="text"
            name="location"
            value={profile.location}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Monthly Budget Preference ($)
          </label>
          <input
            type="number"
            name="budgetPreference"
            value={profile.budgetPreference}
            onChange={handleChange}
            min={0}
            className="input-field"
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default Profile;
