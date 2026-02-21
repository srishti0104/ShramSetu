/**
 * Payslip Auditor Component
 * 
 * @fileoverview OCR-powered payslip processing with Minimum Wage Act validation
 */

import { useState, useRef } from 'react';
import './PayslipAuditor.css';

// Mock OCR results
const MOCK_OCR_RESULTS = [
  {
    employerName: 'ABC Builders Pvt Ltd',
    workerName: 'Rajesh Kumar',
    period: 'February 2024',
    daysWorked: 26,
    ratePerDay: 600,
    grossPay: 15600,
    deductions: 0,
    netPay: 15600,
    paymentDate: '2024-03-01',
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
    paymentDate: '2024-02-05',
    minimumWage: 592,
    compliance: 'non-compliant'
  }
];

/**
 * Payslip Auditor Component
 */
export default function PayslipAuditor() {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrResult, setOcrResult] = useState(null);
  const [uploadHistory, setUploadHistory] = useState([]);
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setUploadedFile(file);
        setOcrResult(null);
      } else {
        alert('Please upload an image (JPG, PNG) or PDF file');
      }
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      if (file.type.startsWith('image/') || file.type === 'application/pdf') {
        setUploadedFile(file);
        setOcrResult(null);
      } else {
        alert('Please upload an image (JPG, PNG) or PDF file');
      }
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const processPayslip = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);

    // Simulate OCR processing delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    // Mock: Randomly select an OCR result
    const mockResult = MOCK_OCR_RESULTS[Math.floor(Math.random() * MOCK_OCR_RESULTS.length)];
    
    const result = {
      ...mockResult,
      fileName: uploadedFile.name,
      uploadDate: new Date().toISOString(),
      confidence: 0.95
    };

    setOcrResult(result);
    setUploadHistory([result, ...uploadHistory]);
    setIsProcessing(false);
  };

  const resetUpload = () => {
    setUploadedFile(null);
    setOcrResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getComplianceColor = (compliance) => {
    return compliance === 'compliant' ? 'success' : 'danger';
  };

  const getComplianceIcon = (compliance) => {
    return compliance === 'compliant' ? '✓' : '⚠';
  };

  const getComplianceMessage = (result) => {
    if (result.compliance === 'compliant') {
      return `Payment is compliant with Minimum Wage Act 1948. Rate per day (₹${result.ratePerDay}) exceeds minimum wage (₹${result.minimumWage}).`;
    } else {
      const shortfall = result.minimumWage - result.ratePerDay;
      return `⚠️ Non-compliant! Rate per day (₹${result.ratePerDay}) is below minimum wage (₹${result.minimumWage}). Shortfall: ₹${shortfall}/day.`;
    }
  };

  return (
    <div className="payslip-auditor">
      <div className="payslip-auditor__header">
        <h2>📄 Payslip Auditor</h2>
        <p>Upload payslip for OCR processing and wage compliance check</p>
      </div>

      {!ocrResult ? (
        <>
          {/* Upload Area */}
          <div
            className="payslip-auditor__upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileSelect}
              style={{ display: 'none' }}
            />

            {!uploadedFile ? (
              <div className="payslip-auditor__upload-prompt">
                <div className="payslip-auditor__upload-icon">📤</div>
                <h3>Upload Payslip</h3>
                <p>Drag and drop or click to select</p>
                <p className="payslip-auditor__upload-formats">
                  Supports: JPG, PNG, PDF
                </p>
              </div>
            ) : (
              <div className="payslip-auditor__file-preview">
                <div className="payslip-auditor__file-icon">
                  {uploadedFile.type === 'application/pdf' ? '📄' : '🖼️'}
                </div>
                <div className="payslip-auditor__file-info">
                  <div className="payslip-auditor__file-name">{uploadedFile.name}</div>
                  <div className="payslip-auditor__file-size">
                    {(uploadedFile.size / 1024).toFixed(2)} KB
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetUpload();
                  }}
                  className="payslip-auditor__remove-btn"
                >
                  ×
                </button>
              </div>
            )}
          </div>

          {/* Process Button */}
          {uploadedFile && !isProcessing && (
            <button
              onClick={processPayslip}
              className="payslip-auditor__process-btn"
            >
              🔍 Process Payslip
            </button>
          )}

          {/* Processing State */}
          {isProcessing && (
            <div className="payslip-auditor__processing">
              <div className="payslip-auditor__spinner"></div>
              <p>Processing payslip with OCR...</p>
              <p className="payslip-auditor__processing-steps">
                Extracting text → Analyzing data → Checking compliance
              </p>
            </div>
          )}
        </>
      ) : (
        <>
          {/* OCR Results */}
          <div className="payslip-auditor__results">
            <div className="payslip-auditor__results-header">
              <h3>📊 Analysis Results</h3>
              <button
                onClick={resetUpload}
                className="payslip-auditor__new-btn"
              >
                Upload New Payslip
              </button>
            </div>

            {/* Compliance Badge */}
            <div className={`compliance-badge compliance-badge--${getComplianceColor(ocrResult.compliance)}`}>
              <span className="compliance-badge__icon">
                {getComplianceIcon(ocrResult.compliance)}
              </span>
              <span className="compliance-badge__text">
                {ocrResult.compliance === 'compliant' ? 'Wage Compliant' : 'Non-Compliant'}
              </span>
            </div>

            {/* Compliance Message */}
            <div className={`compliance-message compliance-message--${getComplianceColor(ocrResult.compliance)}`}>
              {getComplianceMessage(ocrResult)}
            </div>

            {/* Extracted Data */}
            <div className="payslip-auditor__data-grid">
              <div className="data-card">
                <div className="data-card__label">Employer</div>
                <div className="data-card__value">{ocrResult.employerName}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Worker</div>
                <div className="data-card__value">{ocrResult.workerName}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Period</div>
                <div className="data-card__value">{ocrResult.period}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Days Worked</div>
                <div className="data-card__value">{ocrResult.daysWorked}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Rate per Day</div>
                <div className="data-card__value">{formatCurrency(ocrResult.ratePerDay)}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Minimum Wage</div>
                <div className="data-card__value">{formatCurrency(ocrResult.minimumWage)}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Gross Pay</div>
                <div className="data-card__value">{formatCurrency(ocrResult.grossPay)}</div>
              </div>

              <div className="data-card">
                <div className="data-card__label">Deductions</div>
                <div className="data-card__value">{formatCurrency(ocrResult.deductions)}</div>
              </div>

              <div className="data-card data-card--highlight">
                <div className="data-card__label">Net Pay</div>
                <div className="data-card__value">{formatCurrency(ocrResult.netPay)}</div>
              </div>
            </div>

            {/* Calculation Breakdown */}
            <div className="payslip-auditor__calculation">
              <h4>Calculation Breakdown</h4>
              <div className="calculation-row">
                <span>Days Worked × Rate per Day</span>
                <span>{ocrResult.daysWorked} × {formatCurrency(ocrResult.ratePerDay)}</span>
              </div>
              <div className="calculation-row">
                <span>Gross Pay</span>
                <span>{formatCurrency(ocrResult.grossPay)}</span>
              </div>
              <div className="calculation-row">
                <span>Deductions</span>
                <span>- {formatCurrency(ocrResult.deductions)}</span>
              </div>
              <div className="calculation-row calculation-row--total">
                <span>Net Pay</span>
                <span>{formatCurrency(ocrResult.netPay)}</span>
              </div>
            </div>

            {/* OCR Confidence */}
            <div className="payslip-auditor__confidence">
              <span>OCR Confidence: </span>
              <span className="confidence-value">{(ocrResult.confidence * 100).toFixed(1)}%</span>
            </div>
          </div>
        </>
      )}

      {/* Upload History */}
      {uploadHistory.length > 0 && (
        <div className="payslip-auditor__history">
          <h3>📋 Recent Uploads</h3>
          <div className="history-list">
            {uploadHistory.slice(0, 5).map((item, index) => (
              <div key={index} className="history-item">
                <div className="history-item__icon">
                  {item.compliance === 'compliant' ? '✓' : '⚠'}
                </div>
                <div className="history-item__content">
                  <div className="history-item__name">{item.fileName}</div>
                  <div className="history-item__details">
                    {item.employerName} • {item.period} • {formatCurrency(item.netPay)}
                  </div>
                </div>
                <div className={`history-item__badge history-item__badge--${getComplianceColor(item.compliance)}`}>
                  {item.compliance === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="payslip-auditor__demo-notice">
        <p>💡 <strong>Demo Mode:</strong> This is a mock OCR simulation. In production, it will use Amazon Textract for real payslip processing and validate against Minimum Wage Act 1948 data.</p>
      </div>
    </div>
  );
}
