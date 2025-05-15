import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { FiMenu, FiX, FiUser, FiLogOut, FiLogIn, FiBook, FiPlus } from 'react-icons/fi';
import { useAuthStore } from '../../stores/authStore';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuthStore();
  const navigate = useNavigate();
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);
  
  const handleSignOut = async () => {
    await signOut();
    closeMenu();
    navigate('/');
  };
  
  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-serif font-bold text-primary-600">BranchTales</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/browse" className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center">
              <FiBook className="mr-1" /> Browse Stories
            </Link>
            <Link to="/create" className="px-3 py-2 rounded-md hover:bg-gray-100 flex items-center">
              <FiPlus className="mr-1" /> Create Story
            </Link>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-gray-100">
                  <FiUser />
                  <span>{user.email?.split('@')[0]}</span>
                </button>
                <div className="absolute right-0 w-48 mt-2 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/auth" className="btn btn-primary flex items-center">
                <FiLogIn className="mr-1" /> Sign In
              </Link>
            )}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100"
            >
              {isMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link 
              to="/browse" 
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={closeMenu}
            >
              Browse Stories
            </Link>
            <Link 
              to="/create" 
              className="block px-3 py-2 rounded-md hover:bg-gray-100"
              onClick={closeMenu}
            >
              Create Story
            </Link>
            
            {user ? (
              <>
                <Link 
                  to="/profile" 
                  className="block px-3 py-2 rounded-md hover:bg-gray-100"
                  onClick={closeMenu}
                >
                  Profile
                </Link>
                <button 
                  onClick={handleSignOut}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link 
                to="/auth" 
                className="block px-3 py-2 rounded-md bg-primary-600 text-white"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
