
import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/auth';
import MainLayout from '@/components/layout/MainLayout';
import { toast } from '@/hooks/use-sonner';

const Login = () => {
  const { login, isAuthenticated, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    
    try {
      setIsSubmitting(true);
      await login(email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleQuickLogin = async (userType: 'admin' | 'candidate' | 'test') => {
    try {
      setIsSubmitting(true);
      if (userType === 'admin') {
        await login('admin@example.com', 'password123');
      } else if (userType === 'test') {
        await login('mingo@aliyun.com', '123456!a');
      } else {
        await login('candidate@example.com', 'password123');
      }
    } catch (error: any) {
      console.error('Quick login error:', error);
      if (error.message.includes('Invalid login credentials')) {
        toast.error('Invalid email or password. Please try again.');
      } else {
        toast.error(error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="container flex items-center justify-center min-h-[calc(100vh-8rem)] py-12">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="text-center">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-muted-foreground mt-2">Sign in to your account to continue</p>
          </div>
          
          <div className="glass-card p-8 rounded-xl">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="name@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(!!checked)}
                  />
                  <Label htmlFor="remember" className="text-sm font-normal">
                    Remember me
                  </Label>
                </div>
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
                {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
              
              <div className="text-center text-sm">
                <span className="text-muted-foreground">Don't have an account?</span>{' '}
                <Link to="/register" className="text-primary hover:underline">
                  Create one now
                </Link>
              </div>
            </form>
            
            <div className="mt-8 pt-6 border-t border-border">
              <p className="text-sm text-center text-muted-foreground mb-4">
                Demo Quick Access
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleQuickLogin('admin')}
                  disabled={isSubmitting || isLoading}
                >
                  Login as Admin
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  onClick={() => handleQuickLogin('candidate')}
                  disabled={isSubmitting || isLoading}
                >
                  Login as Candidate
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full mt-2" 
                  onClick={() => handleQuickLogin('test')}
                  disabled={isSubmitting || isLoading}
                >
                  Login as mingo@aliyun.com
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Login;
