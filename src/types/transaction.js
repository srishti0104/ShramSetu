/**
 * @fileoverview Transaction and financial ledger type definitions for E-Khata system
 */

/**
 * Transaction type enumeration
 * @typedef {'wage_payment' | 'advance' | 'deduction' | 'bonus' | 'overtime' | 'penalty'} TransactionType
 */

/**
 * Payment method enumeration
 * @typedef {'cash' | 'upi' | 'bank_transfer' | 'cheque' | 'digital_wallet'} PaymentMethod
 */

/**
 * Transaction status enumeration
 * @typedef {'pending' | 'completed' | 'failed' | 'disputed' | 'cancelled'} TransactionStatus
 */

/**
 * Employment type enumeration
 * @typedef {'daily_wage' | 'piece_rate' | 'monthly' | 'contract' | 'hourly'} EmploymentType
 */

/**
 * Violation severity enumeration
 * @typedef {'critical' | 'high' | 'medium' | 'low'} ViolationSeverity
 */

/**
 * Violation type enumeration
 * @typedef {'minimum_wage' | 'overtime' | 'holiday_pay' | 'working_hours' | 'safety' | 'documentation'} ViolationType
 */

/**
 * Financial transaction record
 * @typedef {Object} Transaction
 * @property {string} transactionId - Unique transaction identifier (UUID)
 * @property {string} workerId - Worker's user ID
 * @property {string} contractorId - Contractor's user ID
 * @property {string} jobId - Associated job ID (optional)
 * @property {TransactionType} type - Type of transaction
 * @property {number} amount - Transaction amount in INR
 * @property {PaymentMethod} paymentMethod - Method of payment
 * @property {TransactionStatus} status - Current transaction status
 * @property {string} description - Transaction description
 * @property {Date} transactionDate - Date of transaction
 * @property {Date} createdAt - Record creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {Object} metadata - Additional transaction metadata
 * @property {string} [metadata.referenceNumber] - Payment reference number
 * @property {string} [metadata.receiptUrl] - S3 URL of receipt/proof
 * @property {string} [metadata.notes] - Additional notes
 * @property {boolean} isVerified - Whether transaction is verified by both parties
 * @property {string} [disputeReason] - Reason for dispute if status is 'disputed'
 */

/**
 * Wage calculation details
 * @typedef {Object} WageCalculation
 * @property {string} calculationId - Unique calculation identifier
 * @property {string} workerId - Worker's user ID
 * @property {string} contractorId - Contractor's user ID
 * @property {string} jobId - Associated job ID
 * @property {EmploymentType} employmentType - Type of employment
 * @property {Date} periodStart - Calculation period start date
 * @property {Date} periodEnd - Calculation period end date
 * @property {number} hoursWorked - Total hours worked
 * @property {number} daysWorked - Total days worked
 * @property {number} unitsCompleted - Units completed (for piece-rate work)
 * @property {number} baseWage - Base wage amount
 * @property {number} overtimeHours - Overtime hours worked
 * @property {number} overtimeAmount - Overtime payment amount
 * @property {number} bonusAmount - Bonus amount
 * @property {number} advanceDeducted - Advance amount deducted
 * @property {number} penaltyDeducted - Penalty amount deducted
 * @property {number} totalGross - Total gross amount before deductions
 * @property {number} totalDeductions - Total deductions
 * @property {number} netPayable - Net amount payable to worker
 * @property {string} state - State for minimum wage reference
 * @property {string} occupation - Occupation category
 * @property {Date} calculatedAt - Calculation timestamp
 * @property {Object} breakdown - Detailed wage breakdown
 * @property {number} breakdown.regularPay - Regular working hours pay
 * @property {number} breakdown.overtimePay - Overtime pay
 * @property {number} breakdown.holidayPay - Holiday pay
 * @property {number} breakdown.bonuses - Total bonuses
 * @property {number} breakdown.advances - Total advances
 * @property {number} breakdown.penalties - Total penalties
 */

/**
 * Compliance check result
 * @typedef {Object} ComplianceCheck
 * @property {string} checkId - Unique check identifier
 * @property {string} calculationId - Associated wage calculation ID
 * @property {string} workerId - Worker's user ID
 * @property {string} contractorId - Contractor's user ID
 * @property {Date} checkDate - Date of compliance check
 * @property {boolean} isCompliant - Overall compliance status
 * @property {Violation[]} violations - List of detected violations
 * @property {Object} minimumWageCheck - Minimum wage compliance details
 * @property {number} minimumWageCheck.applicableRate - Applicable minimum wage rate
 * @property {number} minimumWageCheck.actualRate - Actual wage rate paid
 * @property {boolean} minimumWageCheck.isCompliant - Minimum wage compliance status
 * @property {string} minimumWageCheck.state - State jurisdiction
 * @property {string} minimumWageCheck.occupation - Occupation category
 * @property {Object} overtimeCheck - Overtime compliance details
 * @property {number} overtimeCheck.maxHoursPerDay - Maximum hours per day limit
 * @property {number} overtimeCheck.actualHoursPerDay - Actual hours worked per day
 * @property {boolean} overtimeCheck.isCompliant - Overtime compliance status
 * @property {number} overtimeCheck.overtimeRate - Required overtime rate multiplier
 * @property {Object} holidayCheck - Holiday pay compliance details
 * @property {number} holidayCheck.holidaysWorked - Number of holidays worked
 * @property {boolean} holidayCheck.holidayPayProvided - Whether holiday pay was provided
 * @property {boolean} holidayCheck.isCompliant - Holiday pay compliance status
 * @property {Object} pmShramYogiCheck - PM Shram Yogi Maandhan eligibility
 * @property {boolean} pmShramYogiCheck.isEligible - Eligibility status
 * @property {string} pmShramYogiCheck.reason - Eligibility reason/explanation
 * @property {number} pmShramYogiCheck.monthlyIncome - Monthly income for eligibility check
 * @property {string[]} recommendations - Compliance recommendations
 * @property {Date} createdAt - Check creation timestamp
 */

/**
 * Labour law violation details
 * @typedef {Object} Violation
 * @property {string} violationId - Unique violation identifier
 * @property {ViolationType} type - Type of violation
 * @property {ViolationSeverity} severity - Severity level
 * @property {string} description - Human-readable violation description
 * @property {string} lawReference - Reference to specific law/act/section
 * @property {Object} details - Violation-specific details
 * @property {number} [details.expectedAmount] - Expected amount (for wage violations)
 * @property {number} [details.actualAmount] - Actual amount paid
 * @property {number} [details.shortfall] - Shortfall amount
 * @property {number} [details.expectedHours] - Expected hours (for working hours violations)
 * @property {number} [details.actualHours] - Actual hours worked
 * @property {string} remediation - Suggested remediation action
 * @property {boolean} isAutoFlagged - Whether violation was auto-detected
 * @property {Date} detectedAt - Detection timestamp
 */

/**
 * Minimum wage rate reference
 * @typedef {Object} MinimumWageRate
 * @property {string} state - State name
 * @property {string} occupation - Occupation category
 * @property {number} dailyRate - Daily minimum wage rate in INR
 * @property {number} monthlyRate - Monthly minimum wage rate in INR
 * @property {Date} effectiveFrom - Effective start date
 * @property {Date} [effectiveTo] - Effective end date (null if current)
 * @property {string} source - Source of wage rate data
 * @property {Date} lastUpdated - Last update timestamp
 */

export {};
