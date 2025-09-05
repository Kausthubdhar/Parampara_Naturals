import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { ClerkProvider, SignIn, useAuth, useUser } from '@clerk/clerk-react';
import { useClerkSupabaseAuth } from './lib/auth';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
const publishableKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

if (!publishableKey) {
  // eslint-disable-next-line no-console
  console.warn('Missing REACT_APP_CLERK_PUBLISHABLE_KEY in .env');
}

function AuthGate() {
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { syncUser } = useClerkSupabaseAuth();

  // Sync Clerk user to Supabase when user signs in
  useEffect(() => {
    if (isSignedIn && clerkUser) {
      syncUser();
    }
  }, [isSignedIn, clerkUser, syncUser]);

  if (isSignedIn) {
    return <App />;
  }
  
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <SignIn routing="hash" />
    </div>
  );
}

root.render(
  <React.StrictMode>
    <ClerkProvider publishableKey={publishableKey || ''}>
      <AuthGate />
    </ClerkProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
