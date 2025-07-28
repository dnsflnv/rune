import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/auth';
import { supabaseRunestones } from '../services/supabaseRunestones';
import { Runestone } from '../types';
import { User } from '@supabase/supabase-js';
import { PageHeader } from '../components/PageHeader';

export const Profile = () => {
  const [user, setUser] = useState<User | null>(() => authService.getUser());
  const [authLoading, setAuthLoading] = useState(() => authService.isLoading());
  const [visitedRunestones, setVisitedRunestones] = useState<Runestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalRunestones, setTotalRunestones] = useState(0);
  const [visitedRunestoneDetails, setVisitedRunestoneDetails] = useState<Runestone[]>([]);

  // Poll for auth state changes (same as AuthWidget)
  useEffect(() => {
    const interval = setInterval(() => {
      const newUser = authService.getUser();
      const newLoading = authService.isLoading();
      setUser((prev) => (prev !== newUser ? newUser : prev));
      setAuthLoading((prev) => (prev !== newLoading ? newLoading : prev));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Wait for auth to be initialized
        if (authLoading) {
          return;
        }

        // Get current user
        const currentUser = authService.getUser();
        if (!currentUser) {
          setError('You must be logged in to view your profile');
          setLoading(false);
          return;
        }

        // Load visited runestones
        const visited = await supabaseRunestones.getAllVisitedRunestones();
        setVisitedRunestones(visited);

        // Load full details for visited runestones
        if (visited.length > 0) {
          const allRunestones = await supabaseRunestones.getAllRunestones();
          const visitedDetails = allRunestones.filter((runestone) =>
            visited.some((visited) => visited.id === runestone.id)
          );
          setVisitedRunestoneDetails(visitedDetails);
        } else {
          setVisitedRunestoneDetails([]);
        }

        // Load total runestones count
        const allRunestones = await supabaseRunestones.getAllRunestones();
        setTotalRunestones(allRunestones.length);
      } catch (err) {
        console.error('Error loading profile data:', err);
        setError('Failed to load profile data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [authLoading, user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show loading while auth is initializing
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Profile" />

        {/* Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading authentication...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Profile" />

        {/* Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Profile" />

        {/* Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 text-center">
                <div className="text-red-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Error</h2>
                <p className="text-gray-600 mb-4">{error}</p>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    © 2025 Runestone Safari, Developed by Denis Filonov in 2025, Täby, Sweden.
                  </div>
                  <Link
                    to="/"
                    className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Profile" />

        {/* Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 text-center">
                <div className="text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Not Logged In</h2>
                <p className="text-gray-600 mb-4">Please log in to view your profile and visited runestones.</p>
              </div>
              <div className="bg-gray-50 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    © 2025 Runestone Safari, Developed by Denis Filonov in 2025, Täby, Sweden.
                  </div>
                  <Link
                    to="/"
                    className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                  >
                    ← Back to Home
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completionPercentage = totalRunestones > 0 ? Math.round((visitedRunestones.length / totalRunestones) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="Profile" />

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              {/* User Info Section */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center space-x-4">
                  <div className="shrink-0">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xl font-semibold">
                        {user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">{user.email}</h2>
                    <p className="text-sm text-gray-500">
                      Member since {user.created_at ? formatDate(user.created_at) : 'Unknown'}
                    </p>
                  </div>
                  <div className="shrink-0">
                    <button
                      onClick={() => authService.signOut()}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>

              {/* Stats Section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="w-8 h-8 bg-green-100 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Visited Runestones</p>
                      <p className="text-2xl font-semibold text-gray-900">{visitedRunestones.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Total Runestones</p>
                      <p className="text-2xl font-semibold text-gray-900">{totalRunestones}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="flex items-center">
                    <div className="shrink-0">
                      <div className="w-8 h-8 bg-purple-100 rounded-md flex items-center justify-center">
                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">Completion</p>
                      <p className="text-2xl font-semibold text-gray-900">{completionPercentage}%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                  <span className="text-sm text-gray-500">
                    {visitedRunestones.length} of {totalRunestones} runestones
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Visited Runestones List */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Visited Runestones</h3>
                  <span className="text-sm text-gray-500">
                    {visitedRunestoneDetails.length} runestone{visitedRunestoneDetails.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {visitedRunestoneDetails.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600">You haven't visited any runestones yet.</p>
                    <p className="text-sm text-gray-500 mt-1">Start exploring to see your visited runestones here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {visitedRunestoneDetails.map((runestone) => (
                      <div
                        key={runestone.id}
                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-lg font-medium text-gray-900 truncate">{runestone.signature_text}</h4>
                            <p className="text-sm text-gray-500 mt-1">{runestone.found_location}</p>
                            <p className="text-xs text-gray-400 mt-1">
                              {runestone.parish}, {runestone.municipality}
                            </p>
                          </div>
                          <div className="shrink-0 ml-4">
                            <Link
                              to={`/runestones/${runestone.slug}`}
                              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                />
                              </svg>
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  © 2025 Runestone Safari, Developed by Denis Filonov in 2025, Täby, Sweden.
                </div>
                <Link
                  to="/"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
