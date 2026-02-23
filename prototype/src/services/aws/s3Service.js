/**
 * Amazon S3 Service
 * 
 * Handles file uploads to S3 for audio recordings, images, and documents
 */

import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

class S3Service {
  constructor() {
    this.client = new S3Client({
      region: import.meta.env.VITE_AWS_REGION || 'ap-south-1',
      credentials: {
        accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
        secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY
      }
    });
    
    this.bucketName = import.meta.env.VITE_S3_BUCKET_NAME || 'shram-setu-uploads';
  }

  /**
   * Upload file to S3
   * @param {File} file - File object to upload
   * @param {string} folder - Folder path in S3 (e.g., 'audio', 'images', 'documents')
   * @param {string} userId - User ID for organizing files
   * @returns {Promise<Object>} Upload result with file URL
   */
  async uploadFile(file, folder = 'uploads', userId = 'anonymous') {
    try {
      const timestamp = Date.now();
      const fileName = `${folder}/${userId}/${timestamp}-${file.name}`;
      
      // Convert file to buffer
      const buffer = await file.arrayBuffer();
      
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
        Metadata: {
          originalName: file.name,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString()
        }
      });

      await this.client.send(command);

      const fileUrl = `https://${this.bucketName}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${fileName}`;

      console.log('✅ File uploaded to S3:', fileUrl);

      return {
        success: true,
        fileUrl,
        fileName,
        bucket: this.bucketName,
        key: fileName
      };
    } catch (error) {
      console.error('❌ S3 upload error:', error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Upload audio recording
   * @param {Blob} audioBlob - Audio blob from recording
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadAudio(audioBlob, userId = 'anonymous') {
    const file = new File([audioBlob], `recording-${Date.now()}.webm`, {
      type: 'audio/webm'
    });
    
    return this.uploadFile(file, 'audio', userId);
  }

  /**
   * Upload image
   * @param {File} imageFile - Image file
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadImage(imageFile, userId = 'anonymous') {
    return this.uploadFile(imageFile, 'images', userId);
  }

  /**
   * Upload document (payslip, etc.)
   * @param {File} documentFile - Document file
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Upload result
   */
  async uploadDocument(documentFile, userId = 'anonymous') {
    return this.uploadFile(documentFile, 'documents', userId);
  }

  /**
   * Get signed URL for private file access
   * @param {string} key - S3 object key
   * @param {number} expiresIn - URL expiration in seconds (default: 1 hour)
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(key, expiresIn = 3600) {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error('❌ Error generating signed URL:', error);
      throw new Error(`Failed to generate signed URL: ${error.message}`);
    }
  }

  /**
   * Delete file from S3
   * @param {string} key - S3 object key
   * @returns {Promise<Object>} Delete result
   */
  async deleteFile(key) {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key
      });

      await this.client.send(command);

      console.log('✅ File deleted from S3:', key);

      return {
        success: true,
        message: 'File deleted successfully',
        key
      };
    } catch (error) {
      console.error('❌ S3 delete error:', error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Generate public URL for file
   * @param {string} key - S3 object key
   * @returns {string} Public URL
   */
  getPublicUrl(key) {
    return `https://${this.bucketName}.s3.${import.meta.env.VITE_AWS_REGION}.amazonaws.com/${key}`;
  }
}

export default new S3Service();
