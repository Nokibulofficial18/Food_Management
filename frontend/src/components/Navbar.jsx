import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/logs', label: 'Logs', icon: '📝' },
    { path: '/inventory', label: 'Inventory', icon: '📦' },
    { path: '/resources', label: 'Resources', icon: '📚' },
    { path: '/profile', label: 'Profile', icon: '👤' }
  ];

  const isActive = (path) => location.pathname === path;

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      <nav className="backdrop-blur-xl bg-white/80 shadow-xl sticky top-0 z-50 border-b border-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Mobile Menu Button */}
            <div className="flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              
              <Link to="/dashboard" className="flex items-center ml-2 md:ml-0">
                <span className="text-2xl font-bold text-primary-600">🌱 FoodSaver</span>
              </Link>
              
              {/* Desktop Navigation */}
              <div className="hidden md:block ml-10">
                <div className="flex items-center space-x-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive(link.path)
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <span className="mr-1">{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
            
            {/* User Info and Logout */}
            <div className="flex items-center gap-2 sm:gap-4">
              <span className="text-xs sm:text-sm text-gray-700 truncate max-w-[100px] sm:max-w-none">
                {user?.fullName}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 sm:px-4 text-xs sm:text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-opacity duration-300 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={closeMobileMenu}
        ></div>

        {/* Sidebar */}
        <div
          className={`absolute left-0 top-0 h-full w-64 backdrop-blur-xl bg-white/90 shadow-2xl border-r border-white/50 transform transition-transform duration-300 ${
            isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <span className="text-xl font-bold text-primary-600">🌱 Menu</span>
            <button
              onClick={closeMobileMenu}
              className="p-2 rounded-md text-gray-700 hover:bg-gray-100"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User Info in Sidebar */}
          <div className="p-4 bg-primary-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                {user?.fullName?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-600">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4">
            <div className="space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={closeMobileMenu}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className="text-xl">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* Logout Button in Sidebar */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
            <button
              onClick={() => {
                logout();
                closeMobileMenu();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
