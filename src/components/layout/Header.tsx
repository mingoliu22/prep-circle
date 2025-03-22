import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { getInitials } from '@/lib/utils';
import { Menu, X, User, Settings, LogOut } from 'lucide-react';
import { toast } from '@/hooks/use-sonner';

const Header: React.FC = () => {
  const { user, profile, logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // Handle logout with improved error handling
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple clicks
    
    try {
      setIsLoggingOut(true);
      console.log("Header: Calling logout function");
      await logout();
      // Navigation is now handled in the useAuth hook
    } catch (error) {
      console.error('Header logout error:', error);
      toast.error('Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Get user's display name from profile or user metadata
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'User';
  const userEmail = user?.email || '';

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' : 'bg-transparent'
      }`}
    >
      
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-xl font-bold text-primary">AI Interview Buddy</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/candidates" className={`nav-link ${isActive('/candidates') ? 'active' : ''}`}>
                  Candidates
                </Link>
                <Link to="/interviews" className={`nav-link ${isActive('/interviews') ? 'active' : ''}`}>
                  Interviews
                </Link>
                <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
                  Home
                </Link>
                <Link to="/features" className={`nav-link ${isActive('/features') ? 'active' : ''}`}>
                  Features
                </Link>
                <Link to="/about" className={`nav-link ${isActive('/about') ? 'active' : ''}`}>
                  About
                </Link>
              </>
            )}
          </nav>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="p-0 h-9 w-9 rounded-full">
                    <Avatar>
                      <AvatarImage src="" alt={displayName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 animate-scale-in">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{displayName}</p>
                      <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/profile" className="flex w-full items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" asChild>
                    <Link to="/settings" className="flex w-full items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="cursor-pointer text-red-500 focus:text-red-500"
                    disabled={isLoggingOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{isLoggingOut ? 'Logging out...' : 'Log out'}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center space-x-4">
                <Button asChild variant="ghost">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            )}
            
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center text-foreground"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>
      
      {isMobileMenuOpen && (
        <div className="md:hidden animate-fade-in">
          <div className="glass-card mx-4 my-2 px-2 py-3 divide-y divide-border/50">
            {isAuthenticated ? (
              <nav className="flex flex-col space-y-3 pb-3">
                <Link to="/dashboard" className={`p-2 rounded-md ${isActive('/dashboard') ? 'bg-muted font-medium' : ''}`}>
                  Dashboard
                </Link>
                <Link to="/candidates" className={`p-2 rounded-md ${isActive('/candidates') ? 'bg-muted font-medium' : ''}`}>
                  Candidates
                </Link>
                <Link to="/interviews" className={`p-2 rounded-md ${isActive('/interviews') ? 'bg-muted font-medium' : ''}`}>
                  Interviews
                </Link>
                <Link to="/profile" className={`p-2 rounded-md ${isActive('/profile') ? 'bg-muted font-medium' : ''}`}>
                  Profile
                </Link>
              </nav>
            ) : (
              <nav className="flex flex-col space-y-3 pb-3">
                <Link to="/" className={`p-2 rounded-md ${isActive('/') ? 'bg-muted font-medium' : ''}`}>
                  Home
                </Link>
                <Link to="/features" className={`p-2 rounded-md ${isActive('/features') ? 'bg-muted font-medium' : ''}`}>
                  Features
                </Link>
                <Link to="/about" className={`p-2 rounded-md ${isActive('/about') ? 'bg-muted font-medium' : ''}`}>
                  About
                </Link>
              </nav>
            )}
            
            {!isAuthenticated && (
              <div className="pt-3 flex flex-col space-y-2">
                <Button asChild size="sm" variant="outline" className="w-full">
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="w-full">
                  <Link to="/register">Create Account</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
