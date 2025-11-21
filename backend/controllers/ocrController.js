import { processImageOCR, extractItemsFromText } from '../services/ocrService.js';
import InventoryItem from '../models/InventoryItem.js';
import path from 'path';
import fs from 'fs';

/**
 * @desc    Process uploaded image with OCR and extract inventory items
 * @route   POST /api/ocr/process-image
 * @access  Private
 */
export const processImage = async (req, res) => {
  try {
    const userId = req.user.id;

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'No image file uploaded' });
    }

    const imagePath = req.file.path;

    // 1. Process image with OCR
    console.log('🔍 Processing image with OCR:', imagePath);
    const ocrResult = await processImageOCR(imagePath);

    if (!ocrResult.success) {
      return res.status(500).json({ 
        message: 'OCR processing failed',
        error: 'Could not extract text from image'
      });
    }

    // 2. Extract structured item data from OCR text
    console.log('📝 Extracting items from OCR text...');
    const extractedData = extractItemsFromText(ocrResult.text, ocrResult.confidence);

    // 3. Determine if user confirmation is needed
    const requiresConfirmation = extractedData.requiresConfirmation;

    if (requiresConfirmation) {
      // Low confidence - return data for user confirmation
      return res.json({
        success: true,
        requiresConfirmation: true,
        confidence: extractedData.overallConfidence,
        message: 'OCR confidence is low. Please review and confirm the extracted items.',
        extractedItems: extractedData.items.map(item => ({
          itemName: item.itemName,
          quantity: item.quantity,
          unit: item.unit,
          category: item.category,
          expirationDate: item.expirationDate,
          confidence: item.confidence,
          rawText: item.rawText
        })),
        rawText: extractedData.rawText,
        autoAdded: false
      });
    }

    // 4. High confidence - auto-add to inventory
    console.log('✅ High confidence detected. Auto-adding items to inventory...');
    const addedItems = [];
    const failedItems = [];

    for (const item of extractedData.items) {
      try {
        const inventoryItem = await InventoryItem.create({
          userId,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          purchaseDate: new Date(),
          expirationDate: item.expirationDate,
          notes: `Auto-added via OCR (Confidence: ${item.confidence}%)`
        });

        addedItems.push({
          id: inventoryItem._id,
          itemName: inventoryItem.itemName,
          quantity: inventoryItem.quantity,
          category: inventoryItem.category,
          expirationDate: inventoryItem.expirationDate
        });
      } catch (error) {
        console.error('Failed to add item:', item.itemName, error);
        failedItems.push({
          itemName: item.itemName,
          error: error.message
        });
      }
    }

    // Clean up uploaded file
    try {
      fs.unlinkSync(imagePath);
    } catch (err) {
      console.error('Failed to delete uploaded file:', err);
    }

    res.json({
      success: true,
      requiresConfirmation: false,
      confidence: extractedData.overallConfidence,
      message: `Successfully added ${addedItems.length} items to inventory`,
      addedItems,
      failedItems,
      autoAdded: true,
      summary: {
        totalExtracted: extractedData.items.length,
        totalAdded: addedItems.length,
        totalFailed: failedItems.length
      }
    });

  } catch (error) {
    console.error('OCR processing error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (err) {
        console.error('Failed to delete uploaded file:', err);
      }
    }

    res.status(500).json({ 
      message: 'Failed to process image', 
      error: error.message 
    });
  }
};

/**
 * @desc    Confirm and add OCR-extracted items to inventory
 * @route   POST /api/ocr/confirm-items
 * @access  Private
 */
export const confirmItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'No items provided for confirmation' });
    }

    const addedItems = [];
    const failedItems = [];

    for (const item of items) {
      try {
        // Validate required fields
        if (!item.itemName || !item.category) {
          failedItems.push({
            itemName: item.itemName || 'Unknown',
            error: 'Missing required fields'
          });
          continue;
        }

        const inventoryItem = await InventoryItem.create({
          userId,
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity || 1,
          purchaseDate: new Date(),
          expirationDate: item.expirationDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          notes: item.notes || 'Added via OCR confirmation'
        });

        addedItems.push({
          id: inventoryItem._id,
          itemName: inventoryItem.itemName,
          quantity: inventoryItem.quantity,
          category: inventoryItem.category,
          expirationDate: inventoryItem.expirationDate
        });
      } catch (error) {
        console.error('Failed to add item:', item.itemName, error);
        failedItems.push({
          itemName: item.itemName,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      message: `Successfully added ${addedItems.length} items to inventory`,
      addedItems,
      failedItems,
      summary: {
        totalConfirmed: items.length,
        totalAdded: addedItems.length,
        totalFailed: failedItems.length
      }
    });

  } catch (error) {
    console.error('Item confirmation error:', error);
    res.status(500).json({ 
      message: 'Failed to confirm items', 
      error: error.message 
    });
  }
};

/**
 * @desc    Get OCR processing status/info
 * @route   GET /api/ocr/info
 * @access  Private
 */
export const getOCRInfo = async (req, res) => {
  try {
    res.json({
      available: true,
      engine: 'Tesseract.js',
      version: '4.0',
      supportedFormats: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
      maxFileSize: '5MB',
      features: [
        'Automatic item name extraction',
        'Quantity detection',
        'Expiration date parsing',
        'Category classification',
        'Confidence-based confirmation',
        'Auto-add to inventory (high confidence)',
        'Manual confirmation (low confidence)'
      ],
      confidenceThreshold: 70,
      tips: [
        'Use clear, well-lit images',
        'Ensure text is readable and not blurry',
        'Position the receipt/label flat',
        'Avoid shadows and reflections',
        'Crop the image to show only the relevant text'
      ]
    });
  } catch (error) {
    console.error('OCR info error:', error);
    res.status(500).json({ 
      message: 'Failed to get OCR info', 
      error: error.message 
    });
  }
};
