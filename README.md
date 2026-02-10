# Secure Frontend Console

[![CI](https://github.com/jasminefosque/secure-frontend-console/workflows/CI/badge.svg)](https://github.com/jasminefosque/secure-frontend-console/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Purpose

This repository is a **production-grade reference implementation** demonstrating secure-by-design principles, DevSecOps workflows, and observability-ready architecture for modern React applications.

This is **not a tutorial**. This is a reusable internal reference repository meant to signal professional engineering discipline for frontend security, dependency hygiene, input validation, and operational excellence.

## What This Demonstrates

- ✅ **Secure by Design**: Input validation, XSS prevention, type safety
- ✅ **DevSecOps Workflows**: Automated security scanning, dependency management
- ✅ **Production Patterns**: Structured logging, error boundaries, graceful degradation
- ✅ **Testing Rigor**: Unit tests, component tests, E2E tests with >80% coverage
- ✅ **Observability Ready**: Structured logging for monitoring and alerting
- ✅ **Dependency Hygiene**: Automated updates, vulnerability scanning
- ✅ **Developer Experience**: TypeScript strict mode, ESLint security rules, Prettier

## Technology Stack

| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React 19 | UI library |
| **Language** | TypeScript 5.9 | Type safety |
| **Build Tool** | Vite 7 | Fast development and builds |
| **State Management** | Redux Toolkit | Predictable state container |
| **Validation** | Zod | Runtime type validation |
| **Forms** | React Hook Form | Form state management |
| **Testing** | Vitest + React Testing Library + Playwright | Comprehensive testing |
| **Linting** | ESLint + Prettier | Code quality and consistency |
| **CI/CD** | GitHub Actions | Automated security and quality gates |

## Quick Start

### Prerequisites

- Node.js 20.x or higher
- npm 10.x or higher

### Installation

```bash
# Clone the repository
git clone https://github.com/jasminefosque/secure-frontend-console.git
cd secure-frontend-console

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm test                 # Run unit tests
npm run test:watch       # Run tests in watch mode
npm run test:e2e         # Run E2E tests
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix ESLint issues
npm run format           # Format code with Prettier
npm run format:check     # Check formatting
npm run typecheck        # Run TypeScript type check

# Security
npm run audit            # Run npm audit

# All CI checks
npm run ci               # Run all CI checks locally
```

## Architecture

### Application Structure

```
src/
├── app/                    # Application configuration
│   ├── store.ts           # Redux store setup
│   └── hooks.ts           # Typed Redux hooks
├── components/            # Reusable UI components
│   ├── Modal.tsx          # Modal dialog with accessibility
│   ├── Header.tsx         # Application header
│   ├── Card.tsx           # Card container
│   ├── Toast.tsx          # Toast notifications
│   ├── ExpenseForm.tsx    # Validated expense form
│   └── ExpenseList.tsx    # Expense list with actions
├── features/              # Redux slices
│   └── expensesSlice.ts   # Expense state management
├── domain/                # Pure business logic
│   ├── expense.schema.ts  # Zod validation schemas
│   └── expense.logic.ts   # Calculations and formatters
├── utils/                 # Helper utilities
│   ├── logger.ts          # Structured logging
│   ├── storage.ts         # Validated localStorage wrapper
│   └── export.ts          # CSV/JSON export utilities
├── pages/                 # Page components
│   └── Dashboard.tsx      # Main dashboard page
└── test/                  # Test configuration
    └── setup.ts           # Test environment setup
```

### Data Flow

```
User Input → Validation (Zod) → Redux Action → State Update → localStorage
                ↓                                    ↓
         Error Handling                    Component Re-render
                ↓                                    ↓
          User Feedback                    Updated UI
```

### Security Architecture

1. **Input Validation Layer**: All user inputs validated with Zod schemas
2. **State Management Layer**: Redux with validated actions
3. **Storage Layer**: localStorage with validation on read/write
4. **Presentation Layer**: React with automatic XSS protection

See [docs/threat-model.md](./docs/threat-model.md) for complete threat analysis.

## Sample Application: Expense Tracker

The reference implementation is a fully functional expense tracking application that demonstrates:

### Features

- ✅ **Add Expenses**: Form with validated inputs (amount, description, category, date)
- ✅ **Edit Expenses**: Update existing expenses with validation
- ✅ **Delete Expenses**: Remove individual or all expenses
- ✅ **Real-time Statistics**: Total, average, category breakdown
- ✅ **Export Data**: CSV and JSON export with proper escaping
- ✅ **Persistent Storage**: localStorage with validation
- ✅ **Error Handling**: Graceful degradation and user feedback
- ✅ **Accessibility**: ARIA labels, keyboard navigation

### Validation Examples

```typescript
// Amount validation
amount: z.number()
  .positive('Amount must be positive')
  .max(1000000, 'Amount exceeds maximum')
  .finite('Amount must be a finite number')

// Description validation
description: z.string()
  .min(1, 'Description is required')
  .max(200, 'Description must be 200 characters or less')
  .trim()

// Category validation
category: z.enum(['food', 'transport', 'utilities', 'entertainment', 'other'])
```

### Business Logic

All calculations are pure functions, deterministic, and testable:

```typescript
// Pure function - no side effects
export const calculateTotalAmount = (expenses: Expense[]): number => {
  return expenses.reduce((sum, expense) => sum + expense.amount, 0);
};

// Filtering with immutability
export const filterExpenses = (
  expenses: Expense[],
  filter: ExpenseFilter
): Expense[] => {
  return expenses.filter(/* ... */);
};
```

## Security & Reliability

### Security Measures

| Layer | Control | Status |
|-------|---------|--------|
| **Input Validation** | Zod schemas on all inputs | ✅ Implemented |
| **XSS Prevention** | React automatic escaping | ✅ Built-in |
| **Type Safety** | Strict TypeScript | ✅ Configured |
| **Dependency Scanning** | Dependabot + npm audit | ✅ Automated |
| **Static Analysis** | ESLint security plugin | ✅ CI enforced |
| **Supply Chain** | Package lock + CI verification | ✅ Implemented |

### Testing Strategy

- **Unit Tests**: Domain logic, validation schemas, utilities (Vitest)
- **Component Tests**: UI components with user interactions (React Testing Library)
- **E2E Tests**: Complete user workflows (Playwright)
- **Coverage Target**: >80% for critical paths

### CI/CD Pipeline

Every commit triggers:

1. ✅ Security audit (high-severity vulnerabilities fail build)
2. ✅ ESLint with security rules
3. ✅ TypeScript strict type checking
4. ✅ Prettier formatting validation
5. ✅ Unit test execution
6. ✅ E2E test execution
7. ✅ Production build verification

### Observability

Structured logging for all critical actions:

```typescript
logger.info('user_action', {
  action: 'add_expense',
  category: 'food',
  amount: 45.50
});

logger.error('storage_error', error, {
  operation: 'save',
  dataSize: 1024
});
```

See [docs/observability-notes.md](./docs/observability-notes.md) for monitoring guidance.

## What This Repository Intentionally Does NOT Include

To maintain clarity of scope and security boundaries:

- ❌ **No Backend**: This is a pure frontend demonstration
- ❌ **No Authentication**: No user login or session management
- ❌ **No Authorization**: All features available to all users
- ❌ **No API Integration**: No external service dependencies
- ❌ **No Secrets Management**: No API keys, tokens, or credentials
- ❌ **No Database**: Only localStorage for persistence
- ❌ **No Real-time Features**: No WebSockets or server-sent events
- ❌ **No File Uploads**: Only client-side exports
- ❌ **No Analytics Tracking**: Only structured logging
- ❌ **No A/B Testing**: Single code path
- ❌ **No Internationalization**: English only
- ❌ **No Dark Mode**: Single theme
- ❌ **No Mobile Optimization**: Desktop-first design

These are intentional omissions to keep the reference implementation focused on core security practices.

## Security Notes

### Scope of Security

This application protects against:

- ✅ Cross-Site Scripting (XSS) via input validation and React escaping
- ✅ Invalid data states via runtime validation
- ✅ Dependency vulnerabilities via automated scanning
- ✅ Type confusion via TypeScript strict mode

This application does NOT protect against:

- ❌ Server-side attacks (no server exists)
- ❌ Authentication bypass (no authentication exists)
- ❌ Data breaches (no sensitive data stored)
- ❌ Network attacks (infrastructure concern)

### Data Storage

- **What's Stored**: User-entered expenses (amounts, descriptions, categories)
- **Where**: Browser localStorage (client-side only)
- **Lifetime**: Until user clears data or browser storage
- **Sensitivity**: Non-sensitive sample data
- **Encryption**: Not encrypted (localStorage is plaintext)

**Important**: Do not store sensitive information (PII, credentials, payment data) in this application.

### Vulnerability Reporting

See [SECURITY.md](./SECURITY.md) for vulnerability disclosure process.

## Documentation

- [Threat Model](./docs/threat-model.md) - Complete threat analysis and mitigations
- [Security Notes](./docs/security-notes.md) - Implementation-specific security guidance
- [Observability Notes](./docs/observability-notes.md) - Logging and monitoring strategy
- [Contributing Guidelines](./CONTRIBUTING.md) - How to contribute
- [Security Policy](./SECURITY.md) - Security scope and reporting

## Development Guidelines

### Code Style

- Follow existing patterns in the codebase
- Use TypeScript strict mode (no `any` types)
- Write tests for new features
- Update documentation for changes

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(expenses): add category filtering
fix(validation): handle edge case for negative amounts
docs(readme): update security section
test(logic): add tests for sorting functions
```

### Before Submitting PR

```bash
# Run all checks locally
npm run ci

# Ensure all tests pass
npm test
npm run test:e2e

# Fix any issues
npm run lint:fix
npm run format
```

## Deployment

This application is designed for static hosting. Build and deploy to:

- **GitHub Pages**
- **Netlify**
- **Vercel**
- **AWS S3 + CloudFront**
- **Any static hosting provider**

### Production Build

```bash
npm run build
```

Output in `dist/` directory ready for deployment.

### Recommended Security Headers

```
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
```

## Maintenance

### Regular Tasks

- **Weekly**: Review Dependabot PRs
- **Monthly**: Dependency updates, security audit review
- **Quarterly**: Threat model review, major dependency upgrades

### Monitoring

Set up alerts for:

- High-severity npm audit findings
- CI build failures
- Unusual error rates in production logs

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

Contributions welcome! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## Acknowledgments

This reference implementation follows best practices from:

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [OWASP ASVS](https://owasp.org/www-project-application-security-verification-standard/)
- [CIS Software Supply Chain Security Guide](https://www.cisecurity.org/)
- [NIST Secure Software Development Framework](https://csrc.nist.gov/publications/detail/sp/800-218/final)

## Support

For questions or discussions:

- Open a [GitHub Issue](https://github.com/jasminefosque/secure-frontend-console/issues)
- Review existing documentation in `docs/`
- Check [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines

---

**Remember**: Security is a journey, not a destination. This reference implementation demonstrates current best practices but should be adapted to your specific threat model and requirements.
