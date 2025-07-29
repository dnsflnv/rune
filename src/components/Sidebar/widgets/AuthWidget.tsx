import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { authStore } from '../../../stores/authStore';
import { Turnstile } from '@marsidev/react-turnstile';

export const AuthWidget = observer(() => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isMagicLink, setIsMagicLink] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await authStore.signUp(email, password, captchaToken);
      } else {
        await authStore.signIn(email, password, captchaToken);
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
      await authStore.signInWithMagicLink(email);
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
      await authStore.resetPassword(email);
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
      await authStore.signOut();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const handleToggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setCaptchaToken(null); // Reset captcha when switching modes
    setError(null);
    setSuccess(null);
  };

  if (authStore.loading) {
    return <div className="p-4 text-sm text-gray-500">Loading...</div>;
  }

  if (authStore.user) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 mb-2">
          Signed in as <span className="font-medium">{authStore.user.email}</span>
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
        <div className="w-full flex justify-center">
          <Turnstile
            siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY || ''}
            onSuccess={(token) => setCaptchaToken(token)}
            onError={() => setError('Captcha verification failed. Please try again.')}
            options={{
              size: 'compact',
            }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !captchaToken}
          className="w-full px-3 py-2 text-sm text-white bg-primary rounded hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
        </button>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={handleToggleSignUp} className="w-full text-sm text-primary hover:underline">
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
});
