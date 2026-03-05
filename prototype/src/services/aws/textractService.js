/**
 * AWS Textract Service
 * 
 * Handles document OCR and text extraction
 * LAMBDA PROXY ONLY - No direct SDK calls, no credentials in browser
 */

class TextractService {
  constructor() {
    console.log('🔍 Textract Service Initialization:');
    console.log('🔐 Using Lambda Proxy API (NO SDK)');
    
    // Lambda API endpoint
    this.apiUrl = import.meta.env.VITE_TEXTRACT_API_URL || 'https://ynexgp3tq8.execute-api.ap-south-1.amazonaws.com/prod';
    
    console.log('📍 API URL:', this.apiUrl);
  }

  async extractPayslipData(file) {
    try {
      console.log('🔄 Using Lambda Proxy for Textract...');
      
      // Convert file to base64
      const base64 = await this.fileToBase64(file);

      // Call Lambda API
      const response = await fetch(`${this.apiUrl}/extract-payslip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: base64,
          fileName: file.name,
          fileType: file.type
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || error.message || 'Textract API call failed');
      }

      const result = await response.json();
      console.log('✅ Textract Lambda call successful!', result);
      
      // Lambda returns { success: true, data: {...} }
      const payslipData = result.data || result;
      
      return {
        ...payslipData,
        extractedAt: new Date().toISOString(),
        source: 'textract-lambda'
      };
      
    } catch (error) {
      console.error('Textract service error:', error);

      // If it's a subscription error, fall back to mock data
      if (error.message.includes('subscription') || error.message.includes('Access Key Id needs a subscription')) {
        console.warn('⚠️ Textract service not activated, falling back to mock data');
        return this.getMockPayslipData(file);
      }

      throw error;
    }
  }

  // Mock data generator for development
  getMockPayslipData(file) {
    return new Promise((resolve) => {
      // Simulate API delay
      setTimeout(() => {
        // Generate random mock data
        const mockData = [
          {
            employerName: 'ABC Builders Pvt Ltd',
            workerName: 'Rajesh Kumar',
            period: 'February 2024',
            daysWorked: 26,
            ratePerDay: 600,
            grossPay: 15600,
            deductions: 0,
            netPay: 15600,
            minimumWage: 592,
            compliance: 'compliant'
          },
          {
            employerName: 'XYZ Construction Co',
            workerName: 'Amit Singh',
            period: 'January 2024',
            daysWorked: 24,
            ratePerDay: 450,
            grossPay: 10800,
            deductions: 500,
            netPay: 10300,
            minimumWage: 592,
            compliance: 'non-compliant'
          },
          {
            employerName: 'Modern Infra Ltd',
            workerName: 'Priya Sharma',
            period: 'March 2024',
            daysWorked: 28,
            ratePerDay: 650,
            grossPay: 18200,
            deductions: 200,
            netPay: 18000,
            minimumWage: 592,
            compliance: 'compliant'
          }
        ];

        // Pick a random mock result
        const randomIndex = Math.floor(Math.random() * mockData.length);
        const result = mockData[randomIndex];

        resolve({
          ...result,
          rawText: `Mock OCR text from ${file.name}`,
          confidence: 0.95,
          extractedAt: new Date().toISOString(),
          source: 'mock'
        });
      }, 1500); // 1.5 second delay to simulate processing
    });
  }

  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // Remove data URL prefix (e.g., "data:image/png;base64,")
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });
  }

  // Helper method to validate image file
  isValidImageFile(file) {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      throw new Error('Invalid file type. Please upload a JPEG, PNG, or WebP image.');
    }

    if (file.size > maxSize) {
      throw new Error('File size too large. Maximum size is 5MB.');
    }

    return true;
  }
}

export default new TextractService();
