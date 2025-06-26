import { useState, useEffect } from 'react';
import { authService } from '../../../services/auth';

export const AuthWidget = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [authUser, setAuthUser] = useState(() => authService.getUser());
  const [authLoading, setAuthLoading] = useState(() => authService.isLoading());

  useEffect(() => {
    const interval = setInterval(() => {
      const newUser = authService.getUser();
      const newLoading = authService.isLoading();
      setAuthUser((prev) => (prev !== newUser ? newUser : prev));
      setAuthLoading((prev) => (prev !== newLoading ? newLoading : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await authService.signUp(email, password);
      } else {
        await authService.signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authService.signInWithMagicLink(email);
      setSuccess('Check your email for the magic link');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      await authService.resetPassword(email);
      setSuccess('Password reset instructions have been sent to your email');
      setIsForgotPassword(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  if (authLoading) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (authUser) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">
          Signed in as <span className="font-medium">{authUser.email}</span>
        </div>
        <div className="space-y-2">
          <a
            href="/profile"
            className="w-full px-3 py-2 text-sm text-primary border border-primary rounded hover:bg-primary hover:text-white transition-colors flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            View Profile
          </a>
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    );
  }

  if (isForgotPassword) {
    return (
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleResetPassword} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          {success && <div className="text-sm text-green-500">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Reset Password'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsForgotPassword(false);
              setError(null);
              setSuccess(null);
            }}
            className="w-full text-sm text-primary hover:underline"
          >
            Back to Sign In
          </button>
        </form>
      </div>
    );
  }

  if (isMagicLink) {
    return (
      <div className="p-4 border-t border-gray-200">
        <form onSubmit={handleMagicLink} className="space-y-3">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>
          {error && <div className="text-sm text-red-500">{error}</div>}
          {success && <div className="text-sm text-green-500">{success}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full px-3 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsMagicLink(false);
              setError(null);
              setSuccess(null);
            }}
            className="w-full text-sm text-primary hover:underline"
          >
            Back to Sign In
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-200">
      <form onSubmit={handleAuth} className="space-y-3">
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        <div>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary/50"
            required
          />
        </div>
        {error && <div className="text-sm text-red-500">{error}</div>}
        {success && <div className="text-sm text-green-500">{success}</div>}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-3 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="w-full text-sm text-primary hover:underline"
          >
            {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
          </button>
          <button
            type="button"
            onClick={() => setIsForgotPassword(true)}
            className="w-full text-sm text-primary hover:underline"
          >
            Forgot password?
          </button>
          <button
            type="button"
            onClick={() => setIsMagicLink(true)}
            className="w-full text-sm text-primary hover:underline"
          >
            Sign in with Magic Link
          </button>
        </div>
      </form>
    </div>
  );
};
