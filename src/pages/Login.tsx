import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { signInWithGoogle } from '../firebase';
import { Heart } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Login() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-wedding-bg text-wedding-accent"><LoadingSpinner /></div>;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-wedding-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-wedding-rose opacity-10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-wedding-sage opacity-10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
      
      <div className="bg-wedding-card p-8 md:p-12 mx-4 md:mx-0 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0ebe1] max-w-md w-full text-center relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-[#fdfbf7] p-5 rounded-full text-wedding-accent shadow-sm border border-[#f0ebe1]">
            <Heart size={40} strokeWidth={1.5} className="fill-wedding-rose/20 text-wedding-rose" />
          </div>
        </div>
        <h1 className="text-4xl font-serif font-medium text-wedding-text mb-3 tracking-tight">Rencana Pernikahan</h1>
        <p className="text-wedding-muted mb-10 font-light tracking-wide leading-relaxed">Rencanain hari bahagia kalian bareng-bareng dengan mudah dan elegan.</p>
        
        <button
          onClick={signInWithGoogle}
          className="w-full bg-wedding-text hover:bg-[#1a1918] text-white font-medium py-4 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-3 shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Masuk pakai Google
        </button>
      </div>
    </div>
  );
}
