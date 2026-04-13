# Stack Operation Simulator

A React-based stack data structure simulator with Firebase integration for data persistence.

## Features

- Interactive stack operations (push, pop, peek, etc.)
- Visual stack representation
- Performance monitoring
- Firebase integration for data storage
- Real-time synchronization

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd c-stack-operations-simulator
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:

   a. Create a new Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/)

   b. Enable Firestore Database in your Firebase project

   c. Copy your Firebase config from Project Settings > General > Your apps

   d. Create a `.env` file in the root directory:
   ```bash
   cp .env.example .env
   ```

   e. Fill in your Firebase configuration values in `.env`:
   ```
   VITE_FIREBASE_API_KEY=your-api-key-here
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=your-app-id-here
   ```

4. Start the development server:
```bash
npm run dev
```

## Firebase Services

This app uses the following Firebase services:

- **Firestore**: For storing stack operation history and data
- **Authentication**: For user management (optional)
- **Storage**: For storing additional data (optional)

## Usage

1. Open the app in your browser
2. Perform stack operations using the interface
3. Your operations will be automatically saved to Firebase
4. View operation history and analytics

## Deployment

### Option 1: Firebase Hosting (Recommended)

Your project is configured for Firebase Hosting deployment.

#### Automatic Deployment (GitHub Actions)
1. **Set up GitHub Secrets** (in your repository settings):
   - Go to Settings → Secrets and variables → Actions
   - Add these secrets:
     ```
     FIREBASE_SERVICE_ACCOUNT: [Your Firebase service account JSON]
     VITE_FIREBASE_API_KEY: [Your API key]
     VITE_FIREBASE_AUTH_DOMAIN: [Your auth domain]
     VITE_FIREBASE_PROJECT_ID: stacksimulator-d0ef3
     VITE_FIREBASE_STORAGE_BUCKET: [Your storage bucket]
     VITE_FIREBASE_MESSAGING_SENDER_ID: [Your messaging sender ID]
     VITE_FIREBASE_APP_ID: [Your app ID]
     VITE_FIREBASE_MEASUREMENT_ID: [Your measurement ID]
     ```

2. **Get Firebase Service Account**:
   - Go to Firebase Console → Project Settings → Service accounts
   - Generate a new private key
   - Copy the entire JSON content as `FIREBASE_SERVICE_ACCOUNT`

3. **Automatic Deployment**: Every push to `main` branch will automatically deploy to Firebase Hosting

#### Manual Deployment
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy
npm run deploy
# or
firebase deploy --only hosting
```

### Option 2: Other Platforms

#### Vercel (Easy Setup)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on every push

#### Netlify (Easy Setup)
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run deploy` - Build and deploy to Firebase Hosting

## Project Structure

```
src/
├── components/          # React components
├── engine/             # Stack implementation logic
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and Firebase setup
└── main.tsx           # App entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License