import { apiClient } from '../lib/apiClient';
import { endpoints } from '../lib/endpoints';

class DocumentService {
  /**
   * Upload a document
   * @param {FormData} formData - FormData containing the document file and metadata
   * @returns {Promise<Object>} API response
   */
  async uploadDocument(formData) {
    try {
      const response = await apiClient.post(
        endpoints.documents.upload(),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user's documents
   * @returns {Promise<Object>} API response with user's documents
   */
  async getUserDocuments() {
    try {
      const response = await apiClient.get(endpoints.documents.myDocuments());
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} documentId - ID of the document to delete
   * @returns {Promise<Object>} API response
   */
  async deleteDocument(documentId) {
    try {
      const response = await apiClient.delete(
        endpoints.documents.delete(documentId)
      );
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all documents for staff verification
   * @param {Object} filters - Filter options (status, documentType, page, limit)
   * @returns {Promise<Object>} API response with documents
   */
  async getAllDocuments(filters = {}) {
    try {
      // Remove undefined values from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined)
      );

      const queryParams = new URLSearchParams(cleanFilters).toString();
      const baseUrl = endpoints.documents.getAll();
      const url = queryParams ? `${baseUrl}?${queryParams}` : baseUrl;

      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Verify a document (approve/reject)
   * @param {string} documentId - ID of the document to verify
   * @param {Object} verificationData - Verification data (status, rejectionReason)
   * @returns {Promise<Object>} API response
   */
  async verifyDocument(documentId, verificationData) {
    try {
      const response = await apiClient.patch(
        endpoints.documents.verify(documentId),
        verificationData
      );
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new DocumentService();
