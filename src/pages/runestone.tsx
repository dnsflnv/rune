import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import type { Runestone } from '../types';
import { runestonesCache } from '../services/runestonesCache';
import { RunestonePage } from '../components/RunestonePage';

const Runestone = () => {
  const { slug } = useParams();
  const [runestone, setRunestone] = useState<Runestone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRunestone = async () => {
      if (!slug) {
        setError('No slug provided');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await runestonesCache.getRunestoneBySlug(slug);
        setRunestone(data);

        if (!data) {
          setError('Runestone not found');
        }
      } catch (err) {
        console.error('Error fetching runestone:', err);
        setError('Failed to load runestone');
      } finally {
        setLoading(false);
      }
    };

    fetchRunestone();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading runestone...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Runestone Not Found</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <a href="/" className="text-blue-600 hover:text-blue-800">
            ← Back to Map
          </a>
        </div>
      </div>
    );
  }

  return <RunestonePage runestone={runestone} />;
};

export default Runestone;
