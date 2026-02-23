-- shram-Setu PostgreSQL Database Initialization Script
-- This script creates the financial ledger tables with ACID compliance

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id VARCHAR(255) NOT NULL,
    contractor_id VARCHAR(255) NOT NULL,
    job_id VARCHAR(255),
    type VARCHAR(50) NOT NULL CHECK (type IN ('wage', 'advance', 'deduction', 'bonus')),
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    currency VARCHAR(3) DEFAULT 'INR',
    date DATE NOT NULL,
    work_description TEXT,
    payment_method VARCHAR(50) CHECK (payment_method IN ('cash', 'upi', 'bank_transfer', 'cheque')),
    receipt_url TEXT,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'disputed')),
    hours_worked DECIMAL(5, 2) CHECK (hours_worked >= 0),
    overtime_hours DECIMAL(5, 2) CHECK (overtime_hours >= 0),
    compliance_checked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for transactions
CREATE INDEX idx_worker_id ON transactions(worker_id);
CREATE INDEX idx_contractor_id ON transactions(contractor_id);
CREATE INDEX idx_date ON transactions(date);
CREATE INDEX idx_status ON transactions(status);
CREATE INDEX idx_created_at ON transactions(created_at);

-- Wage Calculations Table
CREATE TABLE IF NOT EXISTS wage_calculations (
    calculation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    worker_id VARCHAR(255) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    gross_wage DECIMAL(10, 2) NOT NULL CHECK (gross_wage >= 0),
    advances DECIMAL(10, 2) DEFAULT 0 CHECK (advances >= 0),
    deductions DECIMAL(10, 2) DEFAULT 0 CHECK (deductions >= 0),
    net_wage DECIMAL(10, 2) NOT NULL,
    hours_worked DECIMAL(6, 2) CHECK (hours_worked >= 0),
    overtime_hours DECIMAL(6, 2) CHECK (overtime_hours >= 0),
    overtime_pay DECIMAL(10, 2) DEFAULT 0 CHECK (overtime_pay >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for wage_calculations
CREATE INDEX idx_worker_period ON wage_calculations(worker_id, period_start, period_end);

-- Compliance Checks Table
CREATE TABLE IF NOT EXISTS compliance_checks (
    check_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID REFERENCES transactions(transaction_id) ON DELETE CASCADE,
    is_compliant BOOLEAN NOT NULL,
    minimum_wage DECIMAL(10, 2),
    actual_wage DECIMAL(10, 2),
    state VARCHAR(100),
    industry VARCHAR(100),
    violations JSONB,
    checked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for compliance_checks
CREATE INDEX idx_transaction_id ON compliance_checks(transaction_id);
CREATE INDEX idx_is_compliant ON compliance_checks(is_compliant);
CREATE INDEX idx_checked_at ON compliance_checks(checked_at);

-- Minimum Wage Rates Table
CREATE TABLE IF NOT EXISTS minimum_wage_rates (
    rate_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state VARCHAR(100) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    skill_level VARCHAR(50) CHECK (skill_level IN ('unskilled', 'semi_skilled', 'skilled')),
    daily_rate DECIMAL(10, 2) NOT NULL CHECK (daily_rate >= 0),
    hourly_rate DECIMAL(10, 2) NOT NULL CHECK (hourly_rate >= 0),
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_date_range CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Indexes for minimum_wage_rates
CREATE INDEX idx_state_industry ON minimum_wage_rates(state, industry);
CREATE INDEX idx_effective_dates ON minimum_wage_rates(effective_from, effective_to);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample minimum wage rates for major Indian states (2024 rates)
INSERT INTO minimum_wage_rates (state, industry, skill_level, daily_rate, hourly_rate, effective_from) VALUES
    ('Maharashtra', 'Construction', 'unskilled', 395.00, 49.38, '2024-01-01'),
    ('Maharashtra', 'Construction', 'semi_skilled', 445.00, 55.63, '2024-01-01'),
    ('Maharashtra', 'Construction', 'skilled', 495.00, 61.88, '2024-01-01'),
    ('Delhi', 'Construction', 'unskilled', 673.00, 84.13, '2024-01-01'),
    ('Delhi', 'Construction', 'semi_skilled', 742.00, 92.75, '2024-01-01'),
    ('Delhi', 'Construction', 'skilled', 816.00, 102.00, '2024-01-01'),
    ('Karnataka', 'Construction', 'unskilled', 450.00, 56.25, '2024-01-01'),
    ('Karnataka', 'Construction', 'semi_skilled', 500.00, 62.50, '2024-01-01'),
    ('Karnataka', 'Construction', 'skilled', 550.00, 68.75, '2024-01-01'),
    ('Tamil Nadu', 'Construction', 'unskilled', 450.00, 56.25, '2024-01-01'),
    ('Tamil Nadu', 'Construction', 'semi_skilled', 500.00, 62.50, '2024-01-01'),
    ('Tamil Nadu', 'Construction', 'skilled', 550.00, 68.75, '2024-01-01')
ON CONFLICT DO NOTHING;

-- Grant permissions (adjust username as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shram_setu_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO shram_setu_user;

COMMENT ON TABLE transactions IS 'Stores all financial transactions between workers and contractors';
COMMENT ON TABLE wage_calculations IS 'Stores calculated wage summaries for workers';
COMMENT ON TABLE compliance_checks IS 'Stores compliance validation results against labor laws';
COMMENT ON TABLE minimum_wage_rates IS 'Stores state-wise minimum wage rates as per Minimum Wage Act 1948';

