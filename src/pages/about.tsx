export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-primary mb-6">About Runestone Safari</h1>
            
            <div className="prose prose-lg text-gray-700 space-y-6">
              <p>
                Runestone Safari is an interactive map application that allows you to explore 
                Swedish runestones and ancient heritage sites. Built with modern web technologies, 
                it provides a fast and intuitive way to discover historical artifacts across Sweden.
              </p>
              
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Features</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>Interactive clustering map with 6,815+ runestones</li>
                <li>High-performance SQLite database for fast data access</li>
                <li>Responsive design that works on all devices</li>
                <li>Detailed information about each runestone</li>
                <li>Smart caching for optimal performance</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Technology Stack</h2>
              <ul className="list-disc list-inside space-y-2">
                <li>React 19 with TypeScript</li>
                <li>MapLibre GL for interactive mapping</li>
                <li>SQLite with sql.js for client-side database</li>
                <li>Tailwind CSS for styling</li>
                <li>Vite for fast development and building</li>
              </ul>
              
              <h2 className="text-xl font-semibold text-primary mt-8 mb-4">Data Sources</h2>
              <p>
                The runestone data is sourced from Swedish cultural heritage databases and 
                archaeological records, providing accurate historical and geographical information 
                about each artifact.
              </p>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                © 2025 Rune Explorer - Powered by SQLite
              </div>
              <button
                onClick={() => window.history.back()}
                className="btn-primary text-sm"
              >
                ← Back to Map
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

