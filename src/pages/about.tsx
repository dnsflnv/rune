import { Link } from 'react-router-dom';

export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-primary mb-6">About Runestone Safari</h1>

            <div className="prose prose-lg text-gray-700 space-y-6">
              <p>
                Runestone Safari is an interactive map application that allows you to explore Swedish runestones and
                ancient heritage sites.
              </p>
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Interactive clustering map with 6,815+ runestones</li>
                <li>Real-time data from Supabase database</li>
                <li>Detailed information about each runestone</li>
              </ul>
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Technology Stack</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Devbox and nix package manager for project setup</li>
                <li>React 19 with TypeScript</li>
                <li>React Router for routing</li>
                <li>MapLibre GL for interactive mapping and clustering</li>
                <li>Supabase for real-time PostgreSQL database</li>
                <li>IDB for offline caching</li>
                <li>Tailwind CSS for styling</li>
                <li>Vite for fast development and building</li>
                <li>Cursor AI with Anthropic Claude 4 as a code assistant</li>
                <li>Cloudflare for hosting</li>
              </ul>
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Data Sources</h2>
              <p>
                <a href="https://openfreemap.org/" target="_blank" rel="noopener noreferrer">
                  https://openfreemap.org/
                </a>{' '}
                for map tiles.
              </p>
              <p>
                The runestone data is sourced from the{' '}
                <a
                  href="https://www.uu.se/institution/nordiska/forskning/projekt/samnordisk-runtextdatabas"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Samnordisk Runtextdatabas
                </a>
                .
              </p>
              <p>
                Original SQLite database taken from{' '}
                <a href="https://www.rundata.info/" target="_blank" rel="noopener noreferrer">
                  Rundata-net
                </a>{' '}
                project and converted to PostgreSQL using pgloader. Github repository:{' '}
                <a href="https://github.com/fralik/rundata-net" target="_blank" rel="noopener noreferrer">
                  fralik/rundata-net. Big thanks to the author Vadim Frolov for the original data!
                </a>
              </p>
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">License</h2>
              <p>
                The code is licensed under the{' '}
                <a href="https://www.gnu.org/licenses/gpl-3.0.en.html" target="_blank" rel="noopener noreferrer">
                  GNU General Public License v3.0
                </a>
              </p>
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Roadmap</h2>
              <ul className="list-disc list-inside space-y-2">
                <li className="flex items-start">
                  <input type="checkbox" checked readOnly className="mt-1.5 mr-2" />
                  <span>Offline caching of runestone data using IndexedDB</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" checked readOnly className="mt-1.5 mr-2" />
                  <span>Interactive map with clustering for better performance</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" readOnly className="mt-1.5 mr-2" />
                  <span>Add search functionality by runestone signature and location</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" readOnly className="mt-1.5 mr-2" />
                  <span>Add user accounts for saving visited runestones</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" readOnly className="mt-1.5 mr-2" />
                  <span>Add user profile page with visited runestones and statistics</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" readOnly className="mt-1.5 mr-2" />
                  <span>Avalability to upload runestone photos</span>
                </li>
                <li className="flex items-start">
                  <input type="checkbox" readOnly className="mt-1.5 mr-2" />
                  <span>Mobile application for Android and iOS</span>
                </li>
              </ul>
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
  );
};
