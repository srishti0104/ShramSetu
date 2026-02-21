# 🛠️ Shramik-Setu

**श्रमिक सेतु** - A voice-first Progressive Web Application empowering India's blue-collar workforce through accessible technology.

![Shramik-Setu](https://img.shields.io/badge/Status-Prototype-orange)
![React](https://img.shields.io/badge/React-19-blue)
![PWA](https://img.shields.io/badge/PWA-Ready-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🌟 Overview

Shramik-Setu addresses critical challenges faced by daily wage workers and contractors in India: job discovery, wage compliance, attendance tracking, and labor rights enforcement through a voice-first, offline-capable platform.

## 🎯 Target Users

- **Workers**: Daily wage laborers, construction workers, domestic workers with varying literacy levels
- **Contractors**: Small business owners, construction contractors, job providers  
- **Support Organizations**: NGOs, legal aid organizations monitoring labor rights

## ✨ Core Features

- 🎤 **Voice-First Interface** - Multi-language voice commands (Hindi + regional languages)
- 📍 **Job Marketplace** - Geospatial job matching within city boundaries
- 💰 **E-Khata Ledger** - Digital wage tracking with compliance checking
- 🔢 **TOTP Attendance** - Secure attendance verification with cryptographic audit trails
- 📄 **Payslip Auditor** - OCR-powered payslip processing with Minimum Wage Act validation
- 🛡️ **Suraksha Grievance** - Voice-based safety reporting with AI-powered triage
- ⭐ **Trust Tier System** - Dual rating system with tier-based prioritization
- 📱 **Offline-First** - Works without internet with automatic sync

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/shramik-setu.git
cd shramik-setu

# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view the app.

## 🏗️ Tech Stack

### Frontend
- **React 19** with JavaScript (JSDoc for type hints)
- **Vite** for fast development and building
- **PWA** with Service Worker support
- **Web Audio API** for voice recording
- **IndexedDB** for offline storage

### Backend (Ready for AWS)
- **AWS Lambda** for serverless microservices
- **DynamoDB** for high-scale data
- **PostgreSQL (RDS)** for financial ledger
- **S3** for file storage
- **ElastiCache (Redis)** for sessions

### AI/ML Services (AWS Ready)
- **Amazon Transcribe** - Speech-to-text
- **Amazon Polly** - Text-to-speech  
- **Amazon Lex** - Natural language understanding
- **Amazon Textract** - OCR processing
- **Amazon Comprehend** - Sentiment analysis

## 📁 Project Structure

```
shramik-setu/
├── src/
│   ├── components/          # React components
│   │   ├── voice/          # Voice interface
│   │   ├── jobs/           # Job marketplace
│   │   ├── ledger/         # E-Khata ledger
│   │   ├── attendance/     # TOTP attendance
│   │   ├── grievance/      # Suraksha grievance
│   │   ├── ratings/        # Trust tier system
│   │   ├── payslip/        # Payslip auditor
│   │   └── sync/           # Offline sync
│   ├── services/           # API clients (ready for AWS)
│   ├── types/              # Type definitions
│   └── hooks/              # React hooks
├── lambda/                 # AWS Lambda functions
├── infrastructure/         # AWS CDK infrastructure
└── public/                 # Static assets
```

## 🎨 Design Principles

1. **Voice-First Architecture** - All features accessible through natural language
2. **Offline-First Design** - Essential functionality without internet
3. **Accessibility by Default** - High contrast UI, screen reader support
4. **Privacy & Security** - End-to-end encryption, Indian regulation compliance
5. **Progressive Enhancement** - Works on basic smartphones

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# AWS Deployment (when ready)
npm run deploy       # Deploy to AWS
npm run lint         # Run ESLint
npm run test         # Run tests
```

## 🌐 Current Status

**✅ Prototype Complete** - All 8 core features implemented with mock data
- Fully functional offline-first PWA
- Voice interface with mock AI responses
- Complete job marketplace with search/apply
- Digital ledger with transaction history
- TOTP attendance system
- Payslip OCR simulation
- Grievance reporting system
- Offline sync management

**🔄 Next Phase** - AWS Integration
- Set up AWS infrastructure
- Connect real AI/ML services
- Deploy Lambda functions
- Production deployment

## 🚀 Deployment Roadmap

### Phase 1: Local Prototype ✅ (Complete)
- All features working with mock data
- PWA functionality
- Offline-first architecture

### Phase 2: AWS Setup (Next)
- Deploy infrastructure using CDK
- Set up AI/ML services
- Configure databases

### Phase 3: Production (Future)
- Connect frontend to AWS backend
- Real voice processing
- Live deployment

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built for India's blue-collar workforce
- Designed with accessibility and inclusion in mind
- Supports Digital India initiatives
- Compliant with DPDPA 2023 and labor regulations

## 📞 Contact

For questions or support, please open an issue or contact the development team.

---

**Made with ❤️ for India's workforce**