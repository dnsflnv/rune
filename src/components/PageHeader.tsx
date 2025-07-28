import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
}

export const PageHeader = ({ title }: PageHeaderProps) => {
  return (
    <div className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <Link to="/" className="text-primary hover:text-primary/90 text-sm mb-2 inline-block">
              ← Back to Map
            </Link>
            <h1 className="text-2xl font-bold text-primary">{title}</h1>
          </div>
        </div>
      </div>
    </div>
  );
};
