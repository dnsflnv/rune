import { Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import licenseContent from '../../LICENSE.md?raw';

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const License = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="prose prose-lg max-w-none">
              <ReactMarkdown
                components={{
                  h1: ({ ...props }) => <h1 className="text-3xl font-bold text-primary mb-6" {...props} />,
                  h2: ({ ...props }) => <h2 className="text-xl font-semibold text-primary mt-8 mb-4" {...props} />,
                  a: ({ ...props }) => <a className="text-primary hover:underline" {...props} />,
                  code: ({ inline, children, ...props }: CodeProps) =>
                    inline ? (
                      <code className="bg-gray-100 rounded px-1 py-0.5" {...props}>
                        {children}
                      </code>
                    ) : (
                      <code className="block bg-gray-100 rounded p-4 my-4 overflow-x-auto" {...props}>
                        {children}
                      </code>
                    ),
                  ul: ({ ...props }) => <ul className="list-disc list-inside space-y-2" {...props} />,
                  li: ({ ...props }) => <li className="text-gray-700" {...props} />,
                  p: ({ ...props }) => <p className="text-gray-700" {...props} />,
                }}
              >
                {licenseContent}
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
