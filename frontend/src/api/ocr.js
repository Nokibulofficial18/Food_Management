import { useState } from 'react';
import axios from './axios';

const API_URL = '/api/ocr';

export const ocrAPI = {
  /**
   * Process image with OCR
   */
  processImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    return axios.post(`${API_URL}/process-image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  /**
   * Confirm and add extracted items
   */
  confirmItems: async (items) => {
    return axios.post(`${API_URL}/confirm-items`, { items });
  },

  /**
   * Get OCR service info
   */
  getInfo: async () => {
    return axios.get(`${API_URL}/info`);
  }
};
