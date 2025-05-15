import { Link } from 'react-router-dom';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-primary-600">
              BranchTales
            </Link>
            <p className="text-sm text-gray-600 mt-1">
              Collaborative storytelling platform
            </p>
          </div>
          
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="mb-4 md:mb-0">
              <h3 className="font-medium text-gray-800 mb-2">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-600 hover:text-primary-600">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/browse" className="text-gray-600 hover:text-primary-600">
                    Browse Stories
                  </Link>
                </li>
                <li>
                  <Link to="/create" className="text-gray-600 hover:text-primary-600">
                    Create Story
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-2">Connect</h3>
              <div className="flex space-x-4">
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-primary-600"
                  aria-label="GitHub"
                >
                  <FiGithub size={20} />
                </a>
                <a 
                  href="#" 
                  className="text-gray-600 hover:text-primary-600"
                  aria-label="Twitter"
                >
                  <FiTwitter size={20} />
                </a>
                <a 
                  href="mailto:contact@branchtales.com" 
                  className="text-gray-600 hover:text-primary-600"
                  aria-label="Email"
                >
                  <FiMail size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>&copy; {currentYear} BranchTales. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
