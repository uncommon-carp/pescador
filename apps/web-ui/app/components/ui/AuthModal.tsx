'use client';

import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'confirm'>('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    confirmationCode: '',
    userSub: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signUp, confirmSignUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'signin') {
        await signIn(formData.email, formData.password);
        onClose();
      } else if (mode === 'signup') {
        const result = await signUp(
          formData.email,
          formData.password,
          formData.name,
        );
        setFormData((prev) => ({ ...prev, userSub: result.userSub }));
        setMode('confirm');
      } else if (mode === 'confirm') {
        await confirmSignUp(formData.userSub, formData.confirmationCode);
        setMode('signin');
        setError('Account confirmed! Please sign in.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      name: '',
      confirmationCode: '',
      userSub: '',
    });
    setError('');
  };

  const switchMode = (newMode: 'signin' | 'signup') => {
    setMode(newMode);
    resetForm();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'confirm' && 'Confirm Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div
            className={`mb-4 p-3 rounded ${
              error.includes('confirmed')
                ? 'bg-green-100 text-green-700'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
<<<<<<< HEAD
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
=======
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496e6e]"
>>>>>>> origin/main
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
<<<<<<< HEAD
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
=======
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#496e6e]"
>>>>>>> origin/main
                style={{ color: '#000000' }}
                />
              </div>
            </>
          )}

          {mode === 'confirm' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmation Code
              </label>
              <input
                type="text"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                required
                placeholder="Enter the code sent to your email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-700"
                style={{ color: '#000000' }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-700 text-white py-2 px-4 rounded-md hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-cyan-700 disabled:opacity-50"
          >
            {loading ? (
              'Loading...'
            ) : (
              <>
                {mode === 'signin' && 'Sign In'}
                {mode === 'signup' && 'Sign Up'}
                {mode === 'confirm' && 'Confirm Account'}
              </>
            )}
          </button>
        </form>

        {mode !== 'confirm' && (
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600">
              {mode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() =>
                  switchMode(mode === 'signin' ? 'signup' : 'signin')
                }
                className="text-cyan-700 hover:underline font-medium"
              >
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
