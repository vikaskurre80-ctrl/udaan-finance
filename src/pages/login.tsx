import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { FormInput } from '@/components/FormInput';
import { Alert } from '@/components/Alert';
import { useRouter } from 'next/router';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { useAuthStore, getUserInfoFromEmail, isAllowedEmail } from '@/store/auth';

export default function LoginPage() {
  const router = useRouter();
  const { setUser, user, isLoggedIn } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    if (isLoggedIn && user) {
      router.replace(user.isAdmin ? '/admin/dashboard' : '/member/dashboard');
    }
  }, [isLoggedIn, user, router]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((firebaseUser) => {
      if (!firebaseUser) return;
      if (isAllowedEmail(firebaseUser.email || '')) {
        const info = getUserInfoFromEmail(firebaseUser.email || '');
        if (info) {
          setUser({
            id: firebaseUser.uid,
            email: firebaseUser.email || '',
            name: info.name,
            role: info.role,
            isAdmin: info.isAdmin,
            createdAt: new Date(),
          });
        }
      } else {
        signOut(auth);
      }
    });
    return unsub;
  }, [setUser]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!isAllowedEmail(email)) {
      setErrorMessage('❌ Email not authorized. Please contact admin.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const userInfo = getUserInfoFromEmail(email);

      if (userInfo && result.user) {
        await updateProfile(result.user, { displayName: userInfo.name });
        setUser({
          id: result.user.uid,
          email: email,
          name: userInfo.name,
          role: userInfo.role,
          isAdmin: userInfo.isAdmin,
          createdAt: new Date(),
        });
        router.replace(userInfo.isAdmin ? '/admin/dashboard' : '/member/dashboard');
      }
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setErrorMessage('Email already registered. Please sign in instead.');
        setIsSignup(false);
      } else {
        setErrorMessage(error.message || 'Signup failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    if (!isAllowedEmail(email)) {
      setErrorMessage('❌ Email not authorized. Please contact admin.');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const userInfo = getUserInfoFromEmail(email);

      if (userInfo && result.user) {
        setUser({
          id: result.user.uid,
          email: email,
          name: userInfo.name,
          role: userInfo.role,
          isAdmin: userInfo.isAdmin,
          createdAt: new Date(),
        });
        router.replace(userInfo.isAdmin ? '/admin/dashboard' : '/member/dashboard');
      }
    } catch (error: any) {
      if (error.code === 'auth/user-not-found') {
        setErrorMessage('❌ Account not found. Please create an account.');
      } else if (error.code === 'auth/wrong-password') {
        setErrorMessage('❌ Wrong password. Try again.');
      } else {
        setErrorMessage(error.message || 'Login failed');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoggedIn && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">UdaanWorks</h1>
          <p className="text-gray-600 mb-8">Redirecting...</p>
          <div className="w-8 h-8 border-4 border-apple-blue border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">UdaanWorks</h1>
          <p className="text-gray-600">Finance Management Dashboard</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">
            {isSignup ? 'Create Account' : 'Sign In'}
          </h2>

          {errorMessage && (
            <Alert type="error" title="Error" message={errorMessage} />
          )}

          <form onSubmit={isSignup ? handleSignup : handleSignin} className="space-y-4">
            <FormInput
              label="Email Address"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <FormInput
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              {isSignup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              {isSignup ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErrorMessage('');
                }}
                className="text-blue-600 font-semibold hover:text-blue-700"
              >
                {isSignup ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo Access:</strong><br />
              Admin: vikaskurre80@gmail.com<br />
              Or use your team email to sign up
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
