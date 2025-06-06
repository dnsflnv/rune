import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import readmeContent from '../../README.md?raw';

export const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ node, ...props }) => <h1 className="text-3xl font-bold text-primary mb-6" {...props} />,
                  h2: ({ node, ...props }) => (
                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4" {...props} />
                  ),
                  a: ({ node, ...props }) => <a className="text-primary hover:underline" {...props} />,
                  code: ({ node, ...props }) => <code className="bg-gray-100 rounded px-1 py-0.5" {...props} />,
                  ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2" {...props} />,
                  li: ({ node, ...props }) => <li className="text-gray-700" {...props} />,
                  p: ({ node, ...props }) => <p className="text-gray-700" {...props} />,
                }}
              >
                {readmeContent}
              </ReactMarkdown>
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
