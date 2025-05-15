import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <h1 className="text-9xl font-bold text-primary-600">404</h1>
      <h2 className="text-3xl font-bold mt-4 mb-6">Page Not Found</h2>
      <p className="text-lg text-gray-600 max-w-md mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary flex items-center">
        <FiArrowLeft className="mr-2" /> Back to Home
      </Link>
    </div>
  );
};

export default NotFoundPage;
