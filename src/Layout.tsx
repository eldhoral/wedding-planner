import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, DollarSign, PiggyBank, Users, LogOut, Calendar, Sparkles, Menu, X } from 'lucide-react';
import { logout } from './firebase';

export default function Layout() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Ringkasan', icon: Home },
    { path: '/calendar', label: 'Jadwal', icon: Calendar },
    { path: '/budget', label: 'Budget', icon: DollarSign },
    { path: '/savings', label: 'Tabungan', icon: PiggyBank },
    { path: '/vendors', label: 'Vendor', icon: Users },
    { path: '/recommendations', label: 'Rekomendasi AI', icon: Sparkles },
  ];

  return (
    <div className="flex h-screen bg-wedding-bg text-wedding-text font-sans overflow-hidden">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-wedding-card border-b border-[#f0ebe1] z-30 absolute top-0 left-0 right-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#f9f6f0] flex items-center justify-center text-wedding-accent">
            <Sparkles size={18} strokeWidth={1.5} />
          </div>
          <h1 className="text-xl font-serif font-medium text-wedding-text tracking-wide">Rencana<span className="italic text-wedding-accent">Pernikahan</span></h1>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-wedding-text p-2 hover:bg-[#fdfbf7] rounded-full transition-colors">
          {isMobileMenuOpen ? <X size={24} strokeWidth={1.5} /> : <Menu size={24} strokeWidth={1.5} />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-20 bg-wedding-bg pt-24 pb-6 px-4 flex flex-col overflow-y-auto">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#f9f6f0] text-wedding-accent font-medium shadow-sm border border-[#f0ebe1]' 
                      : 'text-wedding-muted hover:bg-[#fdfbf7] hover:text-wedding-text border border-transparent'
                  }`}
                >
                  <Icon size={22} strokeWidth={isActive ? 2 : 1.5} />
                  <span className="text-base tracking-wide">{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="pt-6 mt-6 border-t border-[#f0ebe1]">
            <button
              onClick={logout}
              className="flex items-center gap-4 px-5 py-4 w-full text-left text-wedding-muted hover:bg-[#fdfbf7] hover:text-wedding-text rounded-2xl transition-all duration-300 border border-transparent hover:border-[#f0ebe1]"
            >
              <LogOut size={22} strokeWidth={1.5} />
              <span className="text-base tracking-wide">Keluar</span>
            </button>
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 bg-wedding-card border-r border-[#f0ebe1] flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10 shrink-0">
        <div className="p-8 flex flex-col items-center justify-center border-b border-[#f0ebe1] mb-4">
          <div className="w-12 h-12 rounded-full bg-[#f9f6f0] flex items-center justify-center mb-3 text-wedding-accent">
            <Sparkles size={20} strokeWidth={1.5} />
          </div>
          <h1 className="text-2xl font-serif font-medium text-wedding-text tracking-wide text-center">Rencana<br/><span className="italic text-wedding-accent">Pernikahan</span></h1>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-full transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#f9f6f0] text-wedding-accent font-medium shadow-sm' 
                    : 'text-wedding-muted hover:bg-[#fdfbf7] hover:text-wedding-text'
                }`}
              >
                <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                <span className="text-sm tracking-wide">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-[#f0ebe1]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-left text-wedding-muted hover:bg-[#fdfbf7] hover:text-wedding-text rounded-full transition-all duration-300"
          >
            <LogOut size={18} strokeWidth={1.5} />
            <span className="text-sm tracking-wide">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto relative pt-20 md:pt-0">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-wedding-rose opacity-5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-wedding-sage opacity-5 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>
        
        <div className="p-4 sm:p-6 md:p-10 max-w-5xl mx-auto relative z-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
