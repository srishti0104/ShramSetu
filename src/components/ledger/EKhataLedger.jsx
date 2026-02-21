/**
 * E-Khata Ledger Component
 * 
 * @fileoverview Digital wage tracking and transaction history
 */

import { useState } from 'react';
import './EKhataLedger.css';

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: 'txn_001',
    date: '2024-02-15',
    type: 'credit',
    amount: 4200,
    description: 'Construction work - 7 days',
    contractor: 'ABC Builders Pvt Ltd',
    jobTitle: 'Construction Worker',
    days: 7,
    ratePerDay: 600,
    status: 'completed',
    paymentMethod: 'UPI',
    location: 'Sector 15, Noida'
  },
  {
    id: 'txn_002',
    date: '2024-02-10',
    type: 'credit',
    amount: 3200,
    description: 'Plumbing work - 4 days',
    contractor: 'Home Services Co',
    jobTitle: 'Plumber',
    days: 4,
    ratePerDay: 800,
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    location: 'Sector 62, Noida'
  },
  {
    id: 'txn_003',
    date: '2024-02-05',
    type: 'credit',
    amount: 5400,
    description: 'Electrical work - 6 days',
    contractor: 'Power Solutions',
    jobTitle: 'Electrician',
    days: 6,
    ratePerDay: 900,
    status: 'completed',
    paymentMethod: 'Cash',
    location: 'Sector 18, Noida'
  },
  {
    id: 'txn_004',
    date: '2024-01-28',
    type: 'credit',
    amount: 2800,
    description: 'Painting work - 4 days',
    contractor: 'Color Masters',
    jobTitle: 'Painter',
    days: 4,
    ratePerDay: 700,
    status: 'pending',
    paymentMethod: 'Pending',
    location: 'Sector 50, Noida'
  },
  {
    id: 'txn_005',
    date: '2024-01-20',
    type: 'credit',
    amount: 12000,
    description: 'Monthly salary - Domestic Helper',
    contractor: 'Home Care Services',
    jobTitle: 'Domestic Helper',
    days: 30,
    ratePerDay: 400,
    status: 'completed',
    paymentMethod: 'Bank Transfer',
    location: 'Sector 25, Noida'
  },
  {
    id: 'txn_006',
    date: '2024-01-15',
    type: 'credit',
    amount: 3400,
    description: 'Carpentry work - 4 days',
    contractor: 'Wood Works Ltd',
    jobTitle: 'Carpenter',
    days: 4,
    ratePerDay: 850,
    status: 'completed',
    paymentMethod: 'UPI',
    location: 'Sector 32, Noida'
  }
];

/**
 * E-Khata Ledger Component
 */
export default function EKhataLedger() {
  const [transactions] = useState(MOCK_TRANSACTIONS);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  // Calculate statistics
  const totalEarnings = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  const pendingPayments = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  const thisMonthEarnings = transactions
    .filter(t => {
      const txnDate = new Date(t.date);
      const now = new Date();
      return txnDate.getMonth() === now.getMonth() && 
             txnDate.getFullYear() === now.getFullYear() &&
             t.status === 'completed';
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDaysWorked = transactions
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.days, 0);

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    
    if (filterMonth !== 'all') {
      const txnDate = new Date(t.date);
      const [year, month] = filterMonth.split('-');
      if (txnDate.getFullYear() !== parseInt(year) || 
          txnDate.getMonth() !== parseInt(month) - 1) {
        return false;
      }
    }
    
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  return (
    <div className="ekhata-ledger">
      <div className="ekhata-ledger__header">
        <h2>💰 E-Khata Ledger</h2>
        <p>Your digital wage tracking and payment history</p>
      </div>

      {/* Statistics Cards */}
      <div className="ekhata-ledger__stats">
        <div className="stat-card stat-card--primary">
          <div className="stat-card__icon">💵</div>
          <div className="stat-card__content">
            <div className="stat-card__label">Total Earnings</div>
            <div className="stat-card__value">{formatCurrency(totalEarnings)}</div>
          </div>
        </div>

        <div className="stat-card stat-card--warning">
          <div className="stat-card__icon">⏳</div>
          <div className="stat-card__content">
            <div className="stat-card__label">Pending Payments</div>
            <div className="stat-card__value">{formatCurrency(pendingPayments)}</div>
          </div>
        </div>

        <div className="stat-card stat-card--success">
          <div className="stat-card__icon">📅</div>
          <div className="stat-card__content">
            <div className="stat-card__label">This Month</div>
            <div className="stat-card__value">{formatCurrency(thisMonthEarnings)}</div>
          </div>
        </div>

        <div className="stat-card stat-card--info">
          <div className="stat-card__icon">🗓️</div>
          <div className="stat-card__content">
            <div className="stat-card__label">Days Worked</div>
            <div className="stat-card__value">{totalDaysWorked}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="ekhata-ledger__filters">
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="ekhata-ledger__select"
        >
          <option value="all">All Transactions</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
        </select>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="ekhata-ledger__select"
        >
          <option value="all">All Months</option>
          <option value="2024-02">February 2024</option>
          <option value="2024-01">January 2024</option>
          <option value="2023-12">December 2023</option>
        </select>
      </div>

      {/* Transaction List */}
      <div className="ekhata-ledger__transactions">
        {filteredTransactions.length === 0 ? (
          <div className="ekhata-ledger__no-data">
            <p>No transactions found</p>
          </div>
        ) : (
          filteredTransactions.map(transaction => (
            <div 
              key={transaction.id} 
              className={`transaction-card transaction-card--${transaction.status}`}
              onClick={() => setSelectedTransaction(transaction)}
            >
              <div className="transaction-card__header">
                <div className="transaction-card__date">
                  {formatDate(transaction.date)}
                </div>
                <div className={`transaction-card__status transaction-card__status--${transaction.status}`}>
                  {transaction.status === 'completed' ? '✓ Paid' : '⏳ Pending'}
                </div>
              </div>

              <div className="transaction-card__body">
                <div className="transaction-card__main">
                  <h3 className="transaction-card__title">{transaction.jobTitle}</h3>
                  <p className="transaction-card__contractor">{transaction.contractor}</p>
                  <p className="transaction-card__description">{transaction.description}</p>
                </div>

                <div className="transaction-card__amount">
                  {formatCurrency(transaction.amount)}
                </div>
              </div>

              <div className="transaction-card__footer">
                <span className="transaction-card__detail">
                  📍 {transaction.location}
                </span>
                <span className="transaction-card__detail">
                  {transaction.days} days × {formatCurrency(transaction.ratePerDay)}/day
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTransaction && (
        <div className="transaction-modal" onClick={() => setSelectedTransaction(null)}>
          <div className="transaction-modal__content" onClick={(e) => e.stopPropagation()}>
            <button
              className="transaction-modal__close"
              onClick={() => setSelectedTransaction(null)}
            >
              ×
            </button>

            <h2 className="transaction-modal__title">Transaction Details</h2>

            <div className={`transaction-modal__status-badge transaction-modal__status-badge--${selectedTransaction.status}`}>
              {selectedTransaction.status === 'completed' ? '✓ Payment Completed' : '⏳ Payment Pending'}
            </div>

            <div className="transaction-modal__amount-display">
              {formatCurrency(selectedTransaction.amount)}
            </div>

            <div className="transaction-modal__section">
              <h3>Job Information</h3>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Job Title:</span>
                <span className="transaction-modal__value">{selectedTransaction.jobTitle}</span>
              </div>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Contractor:</span>
                <span className="transaction-modal__value">{selectedTransaction.contractor}</span>
              </div>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Location:</span>
                <span className="transaction-modal__value">{selectedTransaction.location}</span>
              </div>
            </div>

            <div className="transaction-modal__section">
              <h3>Payment Details</h3>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Date:</span>
                <span className="transaction-modal__value">{formatDate(selectedTransaction.date)}</span>
              </div>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Days Worked:</span>
                <span className="transaction-modal__value">{selectedTransaction.days} days</span>
              </div>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Rate per Day:</span>
                <span className="transaction-modal__value">{formatCurrency(selectedTransaction.ratePerDay)}</span>
              </div>
              <div className="transaction-modal__row">
                <span className="transaction-modal__label">Payment Method:</span>
                <span className="transaction-modal__value">{selectedTransaction.paymentMethod}</span>
              </div>
            </div>

            <div className="transaction-modal__section">
              <h3>Calculation</h3>
              <div className="transaction-modal__calculation">
                <div className="transaction-modal__calc-row">
                  <span>{selectedTransaction.days} days</span>
                  <span>×</span>
                  <span>{formatCurrency(selectedTransaction.ratePerDay)}/day</span>
                </div>
                <div className="transaction-modal__calc-total">
                  = {formatCurrency(selectedTransaction.amount)}
                </div>
              </div>
            </div>

            <div className="transaction-modal__id">
              Transaction ID: {selectedTransaction.id}
            </div>
          </div>
        </div>
      )}

      {/* Demo Notice */}
      <div className="ekhata-ledger__demo-notice">
        <p>💡 <strong>Demo Mode:</strong> This is mock transaction data. In production, data will be stored in PostgreSQL with ACID compliance and synced with AWS.</p>
      </div>
    </div>
  );
}

