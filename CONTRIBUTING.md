# Contributing to Teeworlds League

Thank you for your interest in contributing to the Teeworlds League project! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)

## Code of Conduct

This project follows a code of conduct that ensures a welcoming environment for all contributors. Please be respectful, inclusive, and constructive in all interactions.

## Getting Started

### Prerequisites

- Node.js (v20.10.0 or later)
- npm (v10.2.3 or later)
- Docker and Docker Compose (recommended)
- MongoDB (if not using Docker)

### Development Setup

#### Option 1: Docker Compose (Recommended)

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd teeworlds-league
   ```

2. Start the services:

   ```bash
   docker-compose up
   ```

3. In separate terminals, start the development servers:

   ```bash
   # Terminal 1 - API
   docker-compose exec api npm run dev

   # Terminal 2 - App
   docker-compose exec app npm run dev
   ```

4. Initialize the database:

   ```bash
   docker-compose exec api node src/scripts/createAdmin.js
   docker-compose exec api node src/scripts/initSeasons.js
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - API: http://localhost:8080

#### Option 2: Manual Setup

1. Install MongoDB locally
2. Install dependencies:

   ```bash
   # API
   cd api
   npm install

   # App
   cd ../app
   npm install
   ```

3. Set up environment variables:

   ```bash
   cp api/.env.example api/.env
   ```

4. Start the services:

   ```bash
   # Terminal 1 - API
   cd api
   npm run dev

   # Terminal 2 - App
   cd app
   npm run dev
   ```

## Project Structure

```
teeworlds-league/
├── api/                    # Backend API (Node.js/Express)
│   ├── src/
│   │   ├── controllers/    # API route handlers
│   │   ├── models/        # Database models (Mongoose)
│   │   ├── services/      # Business logic services
│   │   ├── utils/         # Utility functions
│   │   ├── cron/          # Scheduled tasks
│   │   └── scripts/       # Database initialization scripts
│   └── package.json
├── app/                    # Frontend (React)
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── scenes/        # Page components
│   │   ├── redux/         # State management
│   │   └── services/      # API service layer
│   └── package.json
└── docker-compose.yaml     # Docker configuration
```

## Contributing Guidelines

### Before You Start

1. **Check existing issues**: Look for open issues that match your contribution
2. **Create an issue**: If you're planning a significant change, create an issue first to discuss it
3. **Fork the repository**: Create your own fork of the project
4. **Create a branch**: Use a descriptive branch name for your feature/fix

### Code Style

- **JavaScript/Node.js**: Follow standard JavaScript conventions
- **React**: Use functional components with hooks
- **Formatting**: The project uses Prettier for code formatting
- **Naming**: Use descriptive variable and function names
- **Comments**: Add comments for complex logic

### Commit Messages

Use clear, descriptive commit messages:

```
feat: add user authentication system
fix: resolve memory leak in queue processing
docs: update API documentation
style: format code with prettier
refactor: simplify user model validation
```

### Testing

- Test your changes thoroughly before submitting
- Ensure the application starts without errors
- Test both API endpoints and frontend functionality
- Verify database operations work correctly

## Pull Request Process

1. **Update your fork**: Sync with the main repository
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes**: Implement your feature or fix
4. **Test thoroughly**: Ensure everything works as expected
5. **Commit your changes**: Use clear commit messages
6. **Push to your fork**: `git push origin feature/your-feature-name`
7. **Create a Pull Request**: Provide a clear description of your changes

### Pull Request Template

When creating a PR, include:

- **Description**: What changes were made and why
- **Type**: Bug fix, feature, documentation, etc.
- **Testing**: How you tested the changes
- **Screenshots**: If applicable, include before/after screenshots
- **Breaking Changes**: Note any breaking changes

## Issue Reporting

When reporting issues, please include:

- **Description**: Clear description of the problem
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, Node.js version, browser (if applicable)
- **Screenshots**: If applicable, include screenshots

## Development Workflow

### Feature Development

1. Create an issue describing the feature
2. Assign yourself to the issue
3. Create a feature branch from `main`
4. Implement the feature with tests
5. Create a pull request
6. Address review feedback
7. Merge when approved

### Bug Fixes

1. Create an issue describing the bug
2. Create a bugfix branch from `main`
3. Implement the fix with tests
4. Create a pull request
5. Address review feedback
6. Merge when approved

### Code Review Process

- All PRs require review before merging
- Address feedback promptly
- Be open to suggestions and improvements
- Ask questions if something is unclear

## Technologies Used

### Backend (API)

- Node.js
- Express.js
- MongoDB with Mongoose
- Passport.js (authentication)
- Discord.js (Discord integration)
- Node-cron (scheduled tasks)

### Frontend (App)

- React 18
- Redux (state management)
- React Router (routing)
- Tailwind CSS (styling)
- React Big Calendar (calendar component)

### DevOps

- Docker & Docker Compose
- MongoDB (database)

## Getting Help

- **Discord**: Join our Discord server for real-time help
- **Issues**: Use GitHub issues for bug reports and feature requests
- **Discussions**: Use GitHub discussions for general questions

## Recognition

Contributors will be recognized in:

- README.md contributors section
- Release notes for significant contributions
- Project documentation

Thank you for contributing to Teeworlds League! 🎮
