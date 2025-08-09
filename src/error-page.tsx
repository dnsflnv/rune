import { useRouteError } from 'react-router-dom';
import { Footer } from './components/Footer';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h1 className="text-3xl font-bold text-primary mb-6">Oops!</h1>
            <div className="prose prose-lg text-gray-700 space-y-6">
              <p>Sorry, an unexpected error has occurred.</p>
              <p className="text-accent italic">{(error as Error).message}</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    </div>
  );
}
