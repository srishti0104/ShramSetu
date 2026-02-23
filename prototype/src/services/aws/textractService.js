class TextractService {
  constructor() {
    this.apiUrl = import.meta.env.VITE_TEXTRACT_API_URL;
    this.useMockData = true; // Set to false when AWS Textract is working
  }

  async extractPayslipData(file) {
    // Use mock data for development
    if (this.useMockData) {
      console.log('⚠️ Using mock OCR data (Textract disabled)');
      return this.getMockPayslipData(file);
    }

    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      // Call Lambda API
      const response = await fetch(`${this.apiUrl}/extract-payslip`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image: base64 })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = `API request failed: ${response.status}`;
        
        try {
          const errorJson = JSON.parse(errorText);
          if (errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch (e) {
          // Not JSON, use status text
        }
        
        // Check if it's a subscription error
        if (errorMessage.includes('subscription') || errorMessage.includes('Access Key Id needs a subscription')) {
          console.warn('⚠️ Textract service not activated, falling back to mock data');
          return this.getMockPayslipData(file);
        }
        
        throw new Error(errorMessage);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        const errorMsg = result.error || 'Textract processing failed';
        
        // Check if it's a subscription error
        if (errorMsg.includes('subscription') || errorMsg.includes('Access Key Id needs a subscription')) {
          console.warn('⚠️ Textract service not activated, falling back to mock data');
          return this.getMockPayslipData(file);
        }
        
        throw new Error(errorMsg);
      }
      
      return result.data;
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
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
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
