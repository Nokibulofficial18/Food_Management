import { useState, useEffect } from 'react';
import { resourceAPI } from '../api';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ category: '', type: '' });

  useEffect(() => {
    loadResources();
  }, [filter]);

  const loadResources = async () => {
    try {
      const params = {};
      if (filter.category) params.category = filter.category;
      if (filter.type) params.type = filter.type;
      
      const response = await resourceAPI.getResources(params);
      setResources(response.data.resources);
    } catch (error) {
      console.error('Failed to load resources:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading resources...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Sustainability Resources</h1>

      {/* Filters */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Category
            </label>
            <select
              value={filter.category}
              onChange={(e) => setFilter({ ...filter, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              <option value="fruit">Fruit</option>
              <option value="vegetable">Vegetable</option>
              <option value="dairy">Dairy</option>
              <option value="grain">Grain</option>
              <option value="protein">Protein</option>
              <option value="beverage">Beverage</option>
              <option value="snack">Snack</option>
              <option value="general">General</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Type
            </label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="input-field"
            >
              <option value="">All Types</option>
              <option value="article">Article</option>
              <option value="video">Video</option>
              <option value="guide">Guide</option>
              <option value="tip">Tip</option>
              <option value="recipe">Recipe</option>
            </select>
          </div>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resources.map((resource) => (
          <div key={resource._id} className="card hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-lg">{resource.title}</h3>
            </div>
            <p className="text-gray-600 text-sm mb-4">{resource.description}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                {resource.type}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                {resource.relatedCategory}
              </span>
            </div>
            {resource.url && (
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                Learn more →
              </a>
            )}
          </div>
        ))}
      </div>

      {resources.length === 0 && (
        <div className="card text-center py-12">
          <p className="text-gray-500">No resources found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;
