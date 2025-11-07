'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const router = useRouter();
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
        router.push('/dashboard');
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
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-emerald-700/40 rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-stone-100">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'confirm' && 'Confirm Account'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-100 text-xl transition-colors"
          >
            ×
          </button>
        </div>

        {error && (
          <div
            className={`mb-4 p-3 rounded ${
              error.includes('confirmed')
                ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700/50'
                : 'bg-orange-900/50 text-orange-300 border border-orange-700/50'
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-stone-200 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-slate-900/50 border border-emerald-700/50 text-stone-100 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-600"
              />
            </div>
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <>
              <div>
                <label className="block text-sm font-medium text-stone-200 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-900/50 border border-emerald-700/50 text-stone-100 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-600"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-200 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-slate-900/50 border border-emerald-700/50 text-stone-100 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-600"
                />
              </div>
            </>
          )}

          {mode === 'confirm' && (
            <div>
              <label className="block text-sm font-medium text-stone-200 mb-1">
                Confirmation Code
              </label>
              <input
                type="text"
                name="confirmationCode"
                value={formData.confirmationCode}
                onChange={handleInputChange}
                required
                placeholder="Enter the code sent to your email"
                className="w-full px-3 py-2 bg-slate-900/50 border border-emerald-700/50 text-stone-100 placeholder-stone-500 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-700/50 focus:border-emerald-600"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-700 text-white py-2 px-4 rounded-md hover:from-orange-500 hover:to-amber-600 focus:outline-none focus:ring-2 focus:ring-orange-600/50 disabled:opacity-50 transition-all duration-300"
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
            <p className="text-sm text-stone-300">
              {mode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={() =>
                  switchMode(mode === 'signin' ? 'signup' : 'signin')
                }
                className="text-amber-400 hover:text-amber-300 hover:underline font-medium transition-colors"
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
