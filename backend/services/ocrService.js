import Tesseract from 'tesseract.js';
import { createWorker } from 'tesseract.js';

/**
 * OCR Service for processing receipt and label images
 * Extracts item names, quantities, and expiration dates
 */

/**
 * Process image using Tesseract.js OCR
 * @param {String} imagePath - Path to the uploaded image
 * @returns {Object} - Extracted text and confidence
 */
export const processImageOCR = async (imagePath) => {
  try {
    const worker = await createWorker('eng');
    
    const { data: { text, confidence } } = await worker.recognize(imagePath);
    
    await worker.terminate();
    
    return {
      text,
      confidence: Math.round(confidence),
      success: true
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw new Error('Failed to process image with OCR');
  }
};

/**
 * Extract structured data from OCR text
 * @param {String} text - Raw OCR text
 * @param {Number} confidence - OCR confidence score
 * @returns {Object} - Extracted items with metadata
 */
export const extractItemsFromText = (text, confidence) => {
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  const extractedItems = [];
  const lowConfidenceThreshold = 70;

  // Common food-related keywords for item detection
  const foodKeywords = [
    'milk', 'bread', 'egg', 'cheese', 'chicken', 'beef', 'pork', 'fish',
    'apple', 'banana', 'orange', 'lettuce', 'tomato', 'carrot', 'onion',
    'rice', 'pasta', 'cereal', 'yogurt', 'butter', 'oil', 'juice',
    'vegetable', 'fruit', 'meat', 'dairy', 'protein', 'grain', 'beverage'
  ];

  // Regex patterns
  const quantityPattern = /(\d+(?:\.\d+)?)\s*(lb|lbs|oz|kg|g|ml|l|pcs?|pieces?|units?|count|dozen)/i;
  const pricePattern = /\$?\s*(\d+\.\d{2})/;
  const expirationPatterns = [
    /exp(?:iry)?(?:\s*date)?[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /use\s*by[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /best\s*before[:\s]+(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i,
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/
  ];

  let currentItem = null;
  let expirationDate = null;

  // First pass: Look for expiration date
  for (const line of lines) {
    for (const pattern of expirationPatterns) {
      const match = line.match(pattern);
      if (match) {
        expirationDate = parseDate(match[1]);
        break;
      }
    }
  }

  // Second pass: Extract items
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineLower = line.toLowerCase();

    // Skip common non-item lines
    if (lineLower.includes('total') || 
        lineLower.includes('subtotal') ||
        lineLower.includes('tax') ||
        lineLower.includes('change') ||
        lineLower.includes('cash') ||
        line.length < 3) {
      continue;
    }

    // Check if line contains food keyword or looks like an item
    const containsFoodKeyword = foodKeywords.some(keyword => 
      lineLower.includes(keyword)
    );

    const quantityMatch = line.match(quantityPattern);
    const priceMatch = line.match(pricePattern);

    // Likely an item if it has food keywords, quantity, or price
    if (containsFoodKeyword || quantityMatch || (priceMatch && i < lines.length - 5)) {
      const itemName = extractItemName(line, quantityMatch, priceMatch);
      
      if (itemName && itemName.length > 2) {
        const quantity = quantityMatch 
          ? parseFloat(quantityMatch[1]) 
          : 1;
        
        const unit = quantityMatch 
          ? quantityMatch[2].toLowerCase() 
          : 'item';

        const category = categorizeItem(itemName);

        extractedItems.push({
          itemName: capitalizeWords(itemName),
          quantity,
          unit,
          category,
          expirationDate: expirationDate || calculateDefaultExpiration(category),
          confidence: confidence,
          needsConfirmation: confidence < lowConfidenceThreshold,
          rawText: line
        });
      }
    }
  }

  // If no items found, try a more aggressive extraction
  if (extractedItems.length === 0) {
    for (const line of lines) {
      if (line.length > 3 && !line.match(/^[\d\s\$\.\-]+$/)) {
        const cleaned = line.replace(/[\$\d\.\-]/g, '').trim();
        if (cleaned.length > 2) {
          const category = categorizeItem(cleaned);
          extractedItems.push({
            itemName: capitalizeWords(cleaned),
            quantity: 1,
            unit: 'item',
            category,
            expirationDate: calculateDefaultExpiration(category),
            confidence: confidence,
            needsConfirmation: true,
            rawText: line
          });
        }
      }
    }
  }

  return {
    items: extractedItems.slice(0, 20), // Limit to 20 items max
    overallConfidence: confidence,
    requiresConfirmation: confidence < lowConfidenceThreshold || extractedItems.some(item => item.needsConfirmation),
    rawText: text
  };
};

/**
 * Extract clean item name from line
 */
const extractItemName = (line, quantityMatch, priceMatch) => {
  let itemName = line;

  // Remove quantity
  if (quantityMatch) {
    itemName = itemName.replace(quantityMatch[0], '');
  }

  // Remove price
  if (priceMatch) {
    itemName = itemName.replace(priceMatch[0], '');
  }

  // Remove common prefixes/suffixes
  itemName = itemName.replace(/^[\d\s\.\-]+/, ''); // Leading numbers
  itemName = itemName.replace(/[\$\d\.]+$/, ''); // Trailing prices
  itemName = itemName.replace(/\s+/g, ' '); // Multiple spaces
  itemName = itemName.trim();

  return itemName;
};

/**
 * Parse date string to Date object
 */
const parseDate = (dateStr) => {
  try {
    // Handle different date formats
    const parts = dateStr.split(/[\/\-]/);
    
    if (parts.length === 3) {
      let month, day, year;
      
      // Determine format (MM/DD/YYYY or DD/MM/YYYY)
      if (parseInt(parts[0]) > 12) {
        // DD/MM/YYYY
        day = parseInt(parts[0]);
        month = parseInt(parts[1]) - 1;
        year = parseInt(parts[2]);
      } else {
        // MM/DD/YYYY
        month = parseInt(parts[0]) - 1;
        day = parseInt(parts[1]);
        year = parseInt(parts[2]);
      }
      
      // Handle 2-digit years
      if (year < 100) {
        year += year < 50 ? 2000 : 1900;
      }
      
      const date = new Date(year, month, day);
      
      // Validate date
      if (date instanceof Date && !isNaN(date) && date > new Date()) {
        return date;
      }
    }
  } catch (error) {
    console.error('Date parsing error:', error);
  }
  
  return null;
};

/**
 * Categorize item based on name
 */
const categorizeItem = (itemName) => {
  const nameLower = itemName.toLowerCase();

  const categories = {
    fruit: ['apple', 'banana', 'orange', 'grape', 'berry', 'strawberry', 'melon', 'peach', 'pear', 'plum', 'cherry', 'kiwi', 'mango', 'pineapple'],
    vegetable: ['lettuce', 'tomato', 'carrot', 'onion', 'potato', 'broccoli', 'spinach', 'pepper', 'cucumber', 'celery', 'cabbage', 'kale', 'zucchini', 'squash'],
    dairy: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'sour cream', 'cottage cheese', 'ice cream'],
    protein: ['chicken', 'beef', 'pork', 'fish', 'salmon', 'tuna', 'turkey', 'ham', 'bacon', 'egg', 'tofu', 'beans', 'lentil'],
    grain: ['bread', 'rice', 'pasta', 'cereal', 'oat', 'wheat', 'flour', 'tortilla', 'bagel', 'muffin', 'cracker'],
    beverage: ['juice', 'soda', 'water', 'coffee', 'tea', 'beer', 'wine', 'milk', 'drink'],
    snack: ['chip', 'cookie', 'candy', 'chocolate', 'nut', 'popcorn', 'pretzel', 'cracker', 'bar']
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some(keyword => nameLower.includes(keyword))) {
      return category;
    }
  }

  return 'other';
};

/**
 * Calculate default expiration date based on category
 */
const calculateDefaultExpiration = (category) => {
  const today = new Date();
  const daysToAdd = {
    fruit: 7,
    vegetable: 7,
    dairy: 7,
    protein: 3,
    grain: 14,
    beverage: 30,
    snack: 60,
    other: 14
  };

  const days = daysToAdd[category] || 14;
  const expirationDate = new Date(today);
  expirationDate.setDate(expirationDate.getDate() + days);

  return expirationDate;
};

/**
 * Capitalize words in a string
 */
const capitalizeWords = (str) => {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Alternative: Google Vision API placeholder
 * Can be implemented when API key is available
 */
export const processImageWithGoogleVision = async (imagePath) => {
  // Placeholder for Google Vision API integration
  // Requires: npm install @google-cloud/vision
  // And GOOGLE_APPLICATION_CREDENTIALS environment variable
  
  throw new Error('Google Vision API not configured. Using Tesseract.js instead.');
  
  /* Example implementation:
  const vision = require('@google-cloud/vision');
  const client = new vision.ImageAnnotatorClient();
  
  const [result] = await client.textDetection(imagePath);
  const detections = result.textAnnotations;
  
  return {
    text: detections[0]?.description || '',
    confidence: 95,
    success: true
  };
  */
};

export default {
  processImageOCR,
  extractItemsFromText,
  processImageWithGoogleVision
};
