import { Link } from 'react-router-dom';

interface FooterProps {
  backTo?: string;
  backLabel?: string;
}

export const Footer = ({ backTo = '/', backLabel = '← Back to Home' }: FooterProps) => {
  return (
    <div className="bg-gray-50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          © 2025 Runestone Safari, Developed by Denis Filonov in 2025, Täby, Sweden.
        </div>
        <Link
          to={backTo}
          className="inline-block px-4 py-2 text-sm font-medium text-white bg-primary rounded hover:bg-primary/90 transition-colors"
        >
          {backLabel}
        </Link>
      </div>
    </div>
  );
};
