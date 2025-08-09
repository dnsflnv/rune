import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import { authStore } from '../stores/authStore';
import { visitedRunestonesStore } from '../stores/visitedRunestonesStore';
import { Runestone } from '../types';
import { PageHeader } from '../components/PageHeader';
import { Footer } from '../components/Footer';

export const Profile = observer(() => {
  const [visitedRunestoneDetails, setVisitedRunestoneDetails] = useState<Runestone[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState<string | null>(null);

  useEffect(() => {
    const loadVisitedRunestoneDetails = async () => {
      if (!authStore.isFullyAuthenticated || visitedRunestonesStore.loading) {
        return;
      }

      if (visitedRunestonesStore.visitedCount === 0) {
        setVisitedRunestoneDetails([]);
        return;
      }

      setDetailsLoading(true);
      setDetailsError(null);

      try {
        const details = await visitedRunestonesStore.getVisitedRunestoneDetails();
        setVisitedRunestoneDetails(details);
      } catch (err) {
        console.error('Error loading visited runestone details:', err);
        setDetailsError('Failed to load runestone details. Please try again.');
      } finally {
        setDetailsLoading(false);
      }
    };

    loadVisitedRunestoneDetails();
  }, [visitedRunestonesStore.visitedCount, authStore.isFullyAuthenticated, visitedRunestonesStore.loading]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Show loading while auth is initializing
  if (authStore.loading) {
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

  if (visitedRunestonesStore.loading || detailsLoading) {
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

  if (visitedRunestonesStore.error || detailsError) {
    const errorMessage = visitedRunestonesStore.error || detailsError;
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
                <p className="text-gray-600 mb-4">{errorMessage}</p>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!authStore.user) {
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
              <Footer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authStore.user && !authStore.isEmailConfirmed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader title="Profile" />

        {/* Content */}
        <div className="py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="px-6 py-8 text-center">
                <div className="text-yellow-500 mb-4">
                  <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Email Confirmation Required</h2>
                <p className="text-gray-600 mb-4">
                  Please check your email ({authStore.user.email}) and click the confirmation link to access your
                  profile.
                </p>
                <p className="text-sm text-gray-500">
                  Once confirmed, you'll be able to view your visited runestones and track your progress.
                </p>
              </div>
              <Footer />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Use store values for stats

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
                        {authStore.user.email?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900">{authStore.user.email}</h2>
                    <p className="text-sm text-gray-500">
                      Member since {authStore.user.created_at ? formatDate(authStore.user.created_at) : 'Unknown'}
                    </p>
                  </div>
                  <div className="shrink-0 flex space-x-3">
                    <button
                      onClick={() => authStore.signOut()}
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
                    <button
                      onClick={() => {
                        if (window.confirm('Delete your account and all associated data? This cannot be undone.')) {
                          authStore.deleteUser();
                        }
                      }}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete Account
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
                      <p className="text-2xl font-semibold text-gray-900">{visitedRunestonesStore.visitedCount}</p>
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
                      <p className="text-2xl font-semibold text-gray-900">
                        {visitedRunestonesStore.totalRunestonesCount}
                      </p>
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
                      <p className="text-2xl font-semibold text-gray-900">
                        {visitedRunestonesStore.completionPercentage}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-medium text-gray-900">Progress</h3>
                  <span className="text-sm text-gray-500">
                    {visitedRunestonesStore.visitedCount} of {visitedRunestonesStore.totalRunestonesCount} runestones
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${visitedRunestonesStore.completionPercentage}%` }}
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
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
});
