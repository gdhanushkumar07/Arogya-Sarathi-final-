# HealthVault - Rural Health Management System

## Overview

HealthVault is a rule-based health management system designed for rural healthcare delivery. The system uses simple deterministic logic to support emergency hospital discovery, medicine reminders, and secure patient data handling in low-bandwidth environments.

## Key Features

### 🏥 Emergency Hospital Discovery

- **Rule-based Hospital Search**: Simple distance-based sorting to find nearest hospitals
- **Demo Hospital Data**: Simulated hospital database for demonstration purposes
- **Location-based Matching**: Uses patient district/village or browser location
- **Basic Navigation**: Direct links to external mapping services

### 💊 Medicine Intake Reminders

- **Time-scheduled Notifications**: Browser-based reminder system
- **Patient-specific Reminders**: Isolated to logged-in patient only
- **Multiple Daily Schedules**: Morning, afternoon, and evening reminders
- **Simple Rule-based Logic**: Time-based checks without complex algorithms

### 🔒 Patient Data Privacy & Isolation

- **Session-based Data Scoping**: Complete isolation between patients
- **Patient-ID Filtering**: All data queries filtered by active patient
- **Privacy by Design**: One patient cannot access another patient's data
- **Secure Local Storage**: Encrypted local storage for sensitive information

## Technical Implementation

### Rule-based Logic Only

- **No Learning Algorithms**: All decisions use simple if/else logic
- **Deterministic Behavior**: Same inputs always produce same outputs
- **Time-based Checks**: Scheduled reminders using browser timing
- **Distance Calculations**: Simple geometric calculations for hospital proximity

### Low-Bandwidth Optimized

- **Lightweight JSON Payloads**: Minimal data transfer requirements
- **Local Data Storage**: Most data stored locally to reduce network usage
- **Offline Capabilities**: Core features work without internet connection
- **Demo Data Only**: Simulated health data for demonstration purposes

### Privacy-First Design

- **Patient Data Isolation**: Complete separation of patient records
- **Session Management**: Secure session-based access control
- **Local Storage Encryption**: Sensitive data encrypted in browser storage
- **No External Data Sharing**: All processing done locally

## System Architecture

### Frontend (React + TypeScript)

- **Patient Dashboard**: Record symptoms and medical history
- **Doctor Interface**: Review patient cases and provide treatment
- **Pharmacy Module**: Manage prescription fulfillment
- **Emergency Hospital Finder**: Locate nearby medical facilities

### Data Management

- **Patient-specific Storage**: Isolated data storage per patient
- **Local-first Approach**: Minimize network dependencies
- **Synchronization**: Periodic sync when connectivity available
- **Backup & Recovery**: Local data backup mechanisms

### Demo Features

- **Simulated Hospital Database**: Pre-loaded hospital information
- **Mock Patient Records**: Demo health data for testing
- **Rule-based Routing**: Simple categorization without learning
- **Scheduled Reminders**: Time-based notification system

## Running the Application

### Prerequisites

- Node.js 16 or higher
- Modern web browser with JavaScript enabled

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Open browser to `http://localhost:3000`

### Usage

1. **Patient Role**: Create profile and record medical symptoms
2. **Doctor Role**: Review patient cases and provide treatment advice
3. **Pharmacy Role**: Manage prescription fulfillment
4. **Emergency Feature**: Use hospital finder for emergency situations

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Storage**: Local Storage with encryption
- **Notifications**: Browser Notification API
- **Maps**: External mapping service integration

## Important Notes

### Demo Limitations

- Hospital data is simulated for demonstration purposes
- No real-time hospital APIs or databases used
- Medicine reminders are basic time-based notifications
- All logic is rule-based and deterministic

### Privacy Compliance

- Patient data completely isolated between users
- No machine learning or predictive algorithms used
- All processing done locally on user's device
- No external data sharing or cloud processing

### Healthcare Disclaimer

This is a demonstration system for educational purposes. Not intended for actual medical diagnosis or treatment. Always consult qualified healthcare professionals for medical advice.

## Development Philosophy

This system demonstrates how rule-based logic can provide valuable healthcare support in resource-constrained environments. By avoiding complex algorithms and focusing on deterministic, privacy-first design, the system provides reliable healthcare support tools suitable for rural deployment.

The implementation showcases:

- Simple, reliable logic over complex algorithms
- Privacy-first design principles
- Low-bandwidth optimization strategies
- Rural healthcare-specific feature design
- Complete patient data isolation
