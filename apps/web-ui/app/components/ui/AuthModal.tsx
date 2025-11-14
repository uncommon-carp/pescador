'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Button } from './Button';
import { TextInput } from './TextInput';
import { Alert } from './Alert';

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
          <div className="mb-4">
            <Alert
              variant={error.includes('confirmed') ? 'success' : 'error'}
              message={error}
            />
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <TextInput
              type="text"
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              inputSize="md"
            />
          )}

          {(mode === 'signin' || mode === 'signup') && (
            <>
              <TextInput
                type="email"
                name="email"
                label="Email"
                value={formData.email}
                onChange={handleInputChange}
                required
                inputSize="md"
              />

              <TextInput
                type="password"
                name="password"
                label="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                inputSize="md"
              />
            </>
          )}

          {mode === 'confirm' && (
            <TextInput
              type="text"
              name="confirmationCode"
              label="Confirmation Code"
              value={formData.confirmationCode}
              onChange={handleInputChange}
              required
              placeholder="Enter the code sent to your email"
              inputSize="md"
            />
          )}

          <Button
            type="submit"
            loading={loading}
            fullWidth
            size="md"
          >
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Sign Up'}
            {mode === 'confirm' && 'Confirm Account'}
          </Button>
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
