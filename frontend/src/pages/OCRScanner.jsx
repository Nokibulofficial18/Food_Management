import { useState } from 'react';
import { ocrAPI, inventoryAPI } from '../api';

const OCRScanner = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [extractedItems, setExtractedItems] = useState([]);
  const [editingItems, setEditingItems] = useState([]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
      setExtractedItems([]);
    }
  };

  const processImage = async () => {
    if (!selectedFile) return;

    setProcessing(true);
    try {
      const response = await ocrAPI.processImage(selectedFile);
      const data = response.data;

      setResult(data);

      if (data.requiresConfirmation) {
        // Low confidence - need user confirmation
        setExtractedItems(data.extractedItems);
        setEditingItems(data.extractedItems.map(item => ({ ...item, selected: true })));
      } else {
        // High confidence - auto-added
        setExtractedItems(data.addedItems);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('Failed to process image: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const handleItemEdit = (index, field, value) => {
    const updated = [...editingItems];
    updated[index][field] = value;
    setEditingItems(updated);
  };

  const toggleItemSelection = (index) => {
    const updated = [...editingItems];
    updated[index].selected = !updated[index].selected;
    setEditingItems(updated);
  };

  const confirmAndAddItems = async () => {
    const selectedItems = editingItems.filter(item => item.selected);
    
    if (selectedItems.length === 0) {
      alert('Please select at least one item to add');
      return;
    }

    setProcessing(true);
    try {
      const response = await ocrAPI.confirmItems(selectedItems);
      alert(`Successfully added ${response.data.addedItems.length} items to inventory!`);
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl(null);
      setResult(null);
      setExtractedItems([]);
      setEditingItems([]);
    } catch (error) {
      console.error('Failed to confirm items:', error);
      alert('Failed to add items: ' + (error.response?.data?.message || error.message));
    } finally {
      setProcessing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setExtractedItems([]);
    setEditingItems([]);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card-strong">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
            <span className="text-4xl">📸</span>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">OCR Scanner</h1>
            <p className="text-gray-600">Scan receipts and labels to auto-add items to inventory</p>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <div className="text-2xl mb-2">1️⃣</div>
            <div className="font-semibold text-gray-900">Upload Image</div>
            <div className="text-sm text-gray-600">Receipt or product label</div>
          </div>
          <div className="p-4 bg-green-50 rounded-lg border-2 border-green-200">
            <div className="text-2xl mb-2">2️⃣</div>
            <div className="font-semibold text-gray-900">AI Extraction</div>
            <div className="text-sm text-gray-600">Automatic text recognition</div>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
            <div className="text-2xl mb-2">3️⃣</div>
            <div className="font-semibold text-gray-900">Auto-Add</div>
            <div className="text-sm text-gray-600">Items added to inventory</div>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      {!result && (
        <div className="glass-card-strong">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Upload Image</h2>
          
          <div className="space-y-4">
            {/* File Input */}
            <label className="block">
              <div className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                selectedFile 
                  ? 'border-green-400 bg-green-50' 
                  : 'border-gray-300 hover:border-blue-400 bg-white hover:bg-blue-50'
              }`}>
                {previewUrl ? (
                  <div className="space-y-4">
                    <img 
                      src={previewUrl} 
                      alt="Preview" 
                      className="max-h-64 mx-auto rounded-lg shadow-lg"
                    />
                    <p className="text-sm font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-xs text-gray-500">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-6xl">📷</div>
                    <div className="text-lg font-semibold text-gray-700">
                      Click to upload or drag and drop
                    </div>
                    <p className="text-sm text-gray-500">
                      Supported: JPG, PNG, GIF (max 5MB)
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
              </div>
            </label>

            {/* Action Buttons */}
            {selectedFile && (
              <div className="flex gap-3">
                <button
                  onClick={processImage}
                  disabled={processing}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {processing ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    '🔍 Scan Image'
                  )}
                </button>
                <button
                  onClick={reset}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Tips */}
          <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
            <h3 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
              💡 Tips for Best Results
            </h3>
            <ul className="text-sm text-yellow-800 space-y-1">
              <li>• Use clear, well-lit images</li>
              <li>• Ensure text is readable and not blurry</li>
              <li>• Position receipt/label flat without shadows</li>
              <li>• Crop image to show only relevant text</li>
            </ul>
          </div>
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="glass-card-strong">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Extraction Results</h2>
            <button
              onClick={reset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              ← Scan Another
            </button>
          </div>

          {/* Confidence Badge */}
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-gray-700 mb-1">OCR Confidence</div>
                <div className="text-3xl font-bold text-blue-600">{result.confidence}%</div>
              </div>
              <div className={`px-4 py-2 rounded-full font-bold ${
                result.confidence >= 80 ? 'bg-green-200 text-green-800' :
                result.confidence >= 60 ? 'bg-yellow-200 text-yellow-800' :
                'bg-red-200 text-red-800'
              }`}>
                {result.confidence >= 80 ? 'High Confidence' :
                 result.confidence >= 60 ? 'Medium Confidence' :
                 'Low Confidence'}
              </div>
            </div>
          </div>

          {/* Auto-Added Items (High Confidence) */}
          {result.autoAdded && (
            <div className="p-6 bg-green-50 border-2 border-green-300 rounded-xl mb-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="text-3xl">✅</div>
                <div>
                  <h3 className="text-xl font-bold text-green-900 mb-1">
                    Items Auto-Added to Inventory
                  </h3>
                  <p className="text-sm text-green-700">
                    {result.summary.totalAdded} items were automatically added with high confidence
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {extractedItems.map((item, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{item.itemName}</h4>
                        <div className="flex items-center gap-3 mt-1 text-sm text-gray-600">
                          <span>Qty: {item.quantity}</span>
                          <span>•</span>
                          <span className="capitalize">{item.category}</span>
                          <span>•</span>
                          <span>Expires: {new Date(item.expirationDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-2xl">✓</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requires Confirmation (Low Confidence) */}
          {result.requiresConfirmation && (
            <div>
              <div className="p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⚠️</div>
                  <div>
                    <h3 className="font-bold text-yellow-900 mb-1">Review Required</h3>
                    <p className="text-sm text-yellow-700">
                      OCR confidence is low. Please review and edit the extracted items before adding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {editingItems.map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`p-4 rounded-xl border-2 transition-all ${
                      item.selected 
                        ? 'bg-blue-50 border-blue-300' 
                        : 'bg-gray-50 border-gray-300 opacity-60'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleItemSelection(idx)}
                        className="mt-1 w-5 h-5"
                      />
                      <div className="flex-1 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Item Name
                            </label>
                            <input
                              type="text"
                              value={item.itemName}
                              onChange={(e) => handleItemEdit(idx, 'itemName', e.target.value)}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Category
                            </label>
                            <select
                              value={item.category}
                              onChange={(e) => handleItemEdit(idx, 'category', e.target.value)}
                              className="input-field"
                            >
                              <option value="fruit">Fruit</option>
                              <option value="vegetable">Vegetable</option>
                              <option value="dairy">Dairy</option>
                              <option value="protein">Protein</option>
                              <option value="grain">Grain</option>
                              <option value="beverage">Beverage</option>
                              <option value="snack">Snack</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Quantity
                            </label>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => handleItemEdit(idx, 'quantity', parseFloat(e.target.value))}
                              className="input-field"
                              min="0"
                              step="0.1"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Unit
                            </label>
                            <input
                              type="text"
                              value={item.unit}
                              onChange={(e) => handleItemEdit(idx, 'unit', e.target.value)}
                              className="input-field"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                              Expiration Date
                            </label>
                            <input
                              type="date"
                              value={item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : ''}
                              onChange={(e) => handleItemEdit(idx, 'expirationDate', new Date(e.target.value))}
                              className="input-field"
                            />
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          Raw: {item.rawText}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={confirmAndAddItems}
                disabled={processing || editingItems.filter(i => i.selected).length === 0}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding Items...
                  </span>
                ) : (
                  `✅ Add ${editingItems.filter(i => i.selected).length} Selected Items to Inventory`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OCRScanner;
