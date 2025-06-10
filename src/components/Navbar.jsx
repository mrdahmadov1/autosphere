import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { name: 'Ana Səhifə', path: '/' },
    { name: 'Haqqımızda', path: '/about' },
    { name: 'Əlaqə', path: '/contact' },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleAddCar = () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    navigate('/add-car');
  };

  return (
    <nav className="bg-gradient-to-r from-primary to-primary-light py-4 px-8 shadow-md">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="text-white text-2xl font-heading font-bold">
          AutoSphere
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`text-white font-medium text-lg transition-all duration-300 hover:text-accent ${
                location.pathname === item.path ? 'border-b-2 border-accent' : ''
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Auth Navigation - Desktop */}
        <div className="hidden md:flex items-center">
          {currentUser ? (
            <div className="flex items-center space-x-6">
              <Link
                to="/add-car"
                onClick={handleAddCar}
                className="text-white bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
              >
                Avtomobil Əlavə Et
              </Link>
              <Link to="/profile" className="text-white flex items-center hover:text-accent">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {currentUser.displayName || 'Profil'}
              </Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-white hover:text-accent transition-colors duration-300"
              >
                Daxil Ol
              </Link>
              <Link
                to="/register"
                className="text-white bg-accent hover:bg-accent/80 px-4 py-2 rounded-lg font-medium transition-colors duration-300"
              >
                Qeydiyyat
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <button onClick={toggleMobileMenu} className="text-white focus:outline-none">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-16 inset-x-0 z-50 bg-white shadow-lg rounded-b-lg">
          <div className="flex flex-col px-4 py-4">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`py-3 text-neutral-dark font-medium text-lg border-b border-gray-100 ${
                  location.pathname === item.path ? 'text-primary' : ''
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}

            {/* Auth Links - Mobile */}
            {currentUser ? (
              <>
                <Link
                  to="/profile"
                  className="py-3 text-neutral-dark font-medium text-lg border-b border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Mənim Profilim
                </Link>
                <Link
                  to="/add-car"
                  onClick={(e) => {
                    e.preventDefault();
                    handleAddCar();
                    setMobileMenuOpen(false);
                  }}
                  className="py-3 text-neutral-dark font-medium text-lg border-b border-gray-100"
                >
                  Avtomobil Əlavə Et
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="py-3 text-neutral-dark font-medium text-lg border-b border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Daxil Ol
                </Link>
                <Link
                  to="/register"
                  className="py-3 text-neutral-dark font-medium text-lg border-b border-gray-100"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Qeydiyyat
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
