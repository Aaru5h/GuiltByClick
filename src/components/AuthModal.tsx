import React, { useState } from 'react';
import { X, User, Mail, Lock, LogIn, UserPlus } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (username: string, email: string) => void;
}

export default function AuthModal({ isOpen, onClose, onLogin }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: string[] = [];
    
    if (!formData.username.trim()) {
      newErrors.push('Username is required');
    } else if (formData.username.length < 3) {
      newErrors.push('Username must be at least 3 characters');
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.push('Username can only contain letters, numbers, and underscores');
    }
    
    if (!isLoginMode) {
      if (!formData.email.trim()) {
        newErrors.push('Email is required');
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.push('Email is invalid');
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.push('Passwords do not match');
      }
    }
    
    if (!formData.password.trim()) {
      newErrors.push('Password is required');
    } else if (formData.password.length < 6) {
      newErrors.push('Password must be at least 6 characters');
    }
    
    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 800));
    
    try {
      const userData = {
        username: formData.username.trim(),
        email: formData.email.trim() || `${formData.username}@guiltbyclick.local`,
        password: formData.password
      };
      
      if (!isLoginMode) {
        // Sign up - store new user
        const existingUsers = JSON.parse(localStorage.getItem('guiltbyclick-users') || '[]');
        const userExists = existingUsers.find((u: any) => 
          u.username.toLowerCase() === userData.username.toLowerCase()
        );
        
        if (userExists) {
          setErrors(['Username already exists. Please choose another one.']);
          setIsLoading(false);
          return;
        }
        
        const newUser = {
          ...userData,
          joinDate: new Date().toISOString(),
          totalClicks: 0
        };
        
        existingUsers.push(newUser);
        localStorage.setItem('guiltbyclick-users', JSON.stringify(existingUsers));
        localStorage.setItem('guiltbyclick-current-user', JSON.stringify(newUser));
        
        onLogin(userData.username, userData.email);
      } else {
        // Login - verify user exists
        const existingUsers = JSON.parse(localStorage.getItem('guiltbyclick-users') || '[]');
        const user = existingUsers.find((u: any) => 
          u.username.toLowerCase() === userData.username.toLowerCase() && u.password === userData.password
        );
        
        if (!user) {
          setErrors(['Invalid username or password. Please try again.']);
          setIsLoading(false);
          return;
        }
        
        localStorage.setItem('guiltbyclick-current-user', JSON.stringify(user));
        onLogin(user.username, user.email);
      }
      
      // Reset form
      setFormData({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      setErrors([]);
      onClose();
      
    } catch (error) {
      setErrors(['Something went wrong. Please try again.']);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLoginMode(!isLoginMode);
    setErrors([]);
    setFormData({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 border-2 border-red-500 rounded-xl p-6 max-w-md w-full shadow-2xl shadow-red-900/50">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {isLoginMode ? <LogIn className="w-6 h-6 text-red-400" /> : <UserPlus className="w-6 h-6 text-red-400" />}
            {isLoginMode ? 'Welcome Back' : 'Join the Guilt'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-gray-800"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-red-900/20 border border-red-700 rounded-lg">
          <p className="text-red-300 text-sm text-center">
            🚨 {isLoginMode ? 
              'Ready to continue your guilt journey?' : 
              'Join thousands of certified button addicts worldwide!'
            }
          </p>
        </div>

        {errors.length > 0 && (
          <div className="mb-4 p-3 bg-red-900/30 border border-red-600 rounded-lg">
            {errors.map((error, index) => (
              <p key={index} className="text-red-300 text-sm flex items-center gap-2">
                <span className="text-red-400">•</span>
                {error}
              </p>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Choose your username"
              disabled={isLoading}
            />
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="your.email@example.com"
                disabled={isLoading}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Lock className="w-4 h-4 inline mr-2" />
              Password
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          {!isLoginMode && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Lock className="w-4 h-4 inline mr-2" />
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-red-500/25"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {isLoginMode ? 'Logging in...' : 'Creating account...'}
              </>
            ) : (
              <>
                {isLoginMode ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                {isLoginMode ? 'Login & Start Clicking' : 'Sign Up & Join the Guilt'}
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-400 text-sm mb-2">
            {isLoginMode ? "New to button guilt?" : "Already feeling guilty?"}
          </p>
          <button
            onClick={toggleMode}
            disabled={isLoading}
            className="text-red-400 hover:text-red-300 font-semibold text-sm transition-colors disabled:opacity-50"
          >
            {isLoginMode ? 'Create your first account' : 'Login to existing account'}
          </button>
        </div>

        <div className="mt-4 text-center text-xs text-gray-500">
          By {isLoginMode ? 'logging in' : 'signing up'}, you agree to our Terms of Button Guilt
          <br />
          <span className="text-gray-600">No actual data is stored on servers</span>
        </div>
      </div>
    </div>
  );
}