import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { runestonesCache } from '../services/runestonesCache';
import type { Runestone } from '../types';

const Runestones = () => {
  const [runestones, setRunestones] = useState<Runestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRunestones = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await runestonesCache.getAllRunestones();
        setRunestones(data);
      } catch (err) {
        console.error('Error fetching runestones:', err);
        setError('Failed to load runestones');
      } finally {
        setLoading(false);
      }
    };

    fetchRunestones();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading runestones...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Error Loading Runestones</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link to="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Map
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader title="All Runestones" />

      {/* Content */}
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="px-6 py-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-primary mb-4">
                  {runestones.length.toLocaleString()} Runestones Found
                </h2>
                <p className="text-gray-600 mb-6">
                  Explore all runestones in our database. Click on any runestone to view its details.
                </p>
              </div>

              {/* Tag Cloud */}
              <div className="flex flex-wrap gap-3 justify-center">
                {runestones.map((runestone) => (
                  <Link
                    key={runestone.id}
                    to={`/runestones/${runestone.slug}`}
                    className="inline-block px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors duration-200 hover:scale-105 transform"
                  >
                    {runestone.signature_text || `Runestone ${runestone.id}`}
                  </Link>
                ))}
              </div>

              {/* Statistics */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-primary">{runestones.length.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Total Runestones</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-green-600">
                      {runestones.filter((r) => r.visited).length.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Visited</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-orange-600">
                      {runestones.filter((r) => !r.visited).length.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">Unvisited</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">Showing all runestones from the database</div>
                <Link
                  to="/"
                  className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
                >
                  ← Back to Map
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Runestones;
