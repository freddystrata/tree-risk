# Risk Management Dashboard

A comprehensive risk management application built with Next.js, TypeScript, and Tailwind CSS. This dashboard allows organizations to track, assess, and manage risks with automated scoring and visual reporting.

## 🚀 Features

### Phase 1 (Current Implementation)
- ✅ **Risk Assessment Engine**: Automated risk scoring using Probability × Impact matrix
- ✅ **Risk Level Classification**: 6-tier risk level system (LOWEST to HIGHEST)
- ✅ **Residual Risk Calculation**: Post-mitigation risk assessment
- ✅ **Interactive Dashboard**: Summary cards, charts, and risk distribution visualization
- ✅ **Risk Table**: Sortable and filterable table with color-coded risk levels
- ✅ **Sample Data**: Pre-loaded sample risks for demonstration
- ✅ **Type Safety**: Full TypeScript implementation with comprehensive types
- ✅ **Unit Tests**: Jest testing for core risk calculation logic

### Phase 2 (Planned)
- 📋 Excel/CSV Import: Upload spreadsheets to populate risk data
- 📁 File Management: SheetJS integration for Excel parsing
- 🔄 Data Validation: Input validation and error handling

### Phase 3 (Planned)
- ✏️ Risk Editing: Modal forms for adding/editing risks
- ✅ Form Validation: Client and server-side validation
- 💾 Data Persistence: Save/load functionality

### Phase 4 (Planned)
- 📊 Enhanced Dashboard: Additional charts and metrics
- 🔍 Advanced Filtering: Timeline views and complex filters
- 📈 Reporting: Risk trend analysis

### Phase 5 (Planned)
- 💾 Backend Integration: API endpoints for data management
- 📤 Export Functionality: Export to CSV/Excel
- 🗄️ Database Integration: SQLite or lightweight database

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Testing**: Jest, Testing Library
- **Type Safety**: Full TypeScript coverage
- **Build Tool**: Next.js with Turbopack

### Project Structure
```
risk-dashboard/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── RiskTable.tsx    # Interactive risk table
│   │   └── RiskSummary.tsx  # Dashboard summary
│   ├── components/          # React components
│   │   ├── RiskTable.tsx    # Interactive risk table
│   │   └── RiskSummary.tsx  # Dashboard summary
│   ├── types/               # TypeScript type definitions
│   │   └── risk.ts          # Risk-related types
│   ├── utils/               # Utility functions
│   │   └── riskCalculations.ts  # Risk scoring logic
│   └── data/                # Sample data
│       └── sampleRisks.ts   # Demo risk data
├── __tests__/               # Unit tests
└── docs/                    # Documentation
```

## 🧮 Risk Scoring System

### Risk Score Calculation
```typescript
Risk Score = Probability × Impact
```
- **Probability**: 1-9 scale (likelihood of occurrence)
- **Impact**: 1-9 scale (severity if it occurs)
- **Score Range**: 1-81

### Risk Levels
| Threshold | Level | Color |
|-----------|-------|-------|
| 1 | LOWEST | Green |
| 2 | VERY LOW | Light Green |
| 3 | LOW | Yellow |
| 4 | MEDIUM LOW | Orange |
| 6 | MEDIUM HIGH | Dark Orange |
| 9+ | HIGHEST | Red |

### Residual Risk
```typescript
Residual Score = Risk Score × (1 - Mitigation Effectiveness)
```
- **Mitigation Effectiveness**: 0-1 (0% to 100% effectiveness)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd risk-dashboard

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test         # Run Jest tests
npm run test:watch   # Run tests in watch mode
```

## 🧪 Testing

The project includes comprehensive unit tests for the risk calculation engine:

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run specific test file
npm test riskCalculations
```

## 📊 Usage

### Dashboard Overview
1. **Summary Tab**: View risk distribution, high-priority alerts, and visual charts
2. **Risk Table Tab**: Detailed table with sorting, filtering, and risk details

### Risk Table Features
- **Sorting**: Click column headers to sort by any field
- **Filtering**: Filter by risk level, status, or category
- **Color Coding**: Visual risk level indication
- **Responsive Design**: Works on desktop and mobile devices

### Sample Data
The application comes with 7 sample risks covering various categories:
- Cybersecurity
- Operations
- Human Resources
- Compliance
- Technology
- Market risks
- Legal compliance

## 🔒 Security Considerations

- ✅ No external API dependencies
- ✅ Client-side data processing
- ✅ Type-safe data validation
- ✅ Input sanitization in forms (planned)
- ✅ Local data storage (planned)

## 🛠️ Development

### Adding New Risk Levels
Edit `src/utils/riskCalculations.ts`:
```typescript
export const RISK_LEVELS: RiskLevel[] = [
  { threshold: 1, name: "CUSTOM_LEVEL", color: "bg-custom-color", textColor: "text-custom" },
  // ... existing levels
];
```

### Customizing Risk Calculations
Modify functions in `src/utils/riskCalculations.ts`:
- `calculateRiskScore()`: Change scoring formula
- `getRiskLevel()`: Adjust level determination logic
- `calculateResidualScore()`: Modify mitigation calculation

### Adding New Components
1. Create component in `src/components/`
2. Add TypeScript interfaces
3. Include in main dashboard
4. Add tests in `__tests__/`

## 📈 Performance

- **Bundle Size**: Optimized with Next.js tree shaking
- **Rendering**: Client-side with React 19 features
- **Data Processing**: Efficient in-memory calculations
- **Responsive**: Tailwind CSS for fast styling

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🗺️ Roadmap

### Short Term
- [ ] Excel/CSV import functionality
- [ ] Risk editing forms
- [ ] Data persistence

### Medium Term  
- [ ] Advanced filtering and search
- [ ] Risk trend analysis
- [ ] Email notifications

### Long Term
- [ ] Multi-user support
- [ ] Role-based access control
- [ ] Advanced reporting and analytics
- [ ] Integration with external risk management systems

## 🐛 Known Issues

- None currently identified

## 📞 Support

For questions or issues, please:
1. Check the documentation
2. Review existing issues
3. Create a new issue with detailed description

---

**Built with ❤️ for effective risk management**
