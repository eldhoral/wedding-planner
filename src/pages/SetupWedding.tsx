import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, getDoc } from 'firebase/firestore';
import { Heart, Link as LinkIcon } from 'lucide-react';

export default function SetupWedding() {
  const { user, setWeddingId } = useAuth();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [name, setName] = useState('');
  const [budget, setBudget] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const weddingRef = await addDoc(collection(db, 'weddings'), {
        name,
        totalBudgetGoal: Number(budget),
        createdAt: new Date().toISOString(),
        createdBy: user.uid,
      });

      await updateDoc(doc(db, 'users', user.uid), {
        weddingId: weddingRef.id,
      });

      setWeddingId(weddingRef.id);
    } catch (err) {
      setError('Failed to create wedding plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError('');

    try {
      const weddingRef = doc(db, 'weddings', joinId);
      const weddingSnap = await getDoc(weddingRef);

      if (!weddingSnap.exists()) {
        setError('Wedding plan not found. Please check the ID.');
        setLoading(false);
        return;
      }

      await updateDoc(weddingRef, {
        partnerId: user.uid,
      });

      await updateDoc(doc(db, 'users', user.uid), {
        weddingId: joinId,
      });

      setWeddingId(joinId);
    } catch (err) {
      setError('Failed to join wedding plan. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-wedding-bg relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-wedding-rose opacity-10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-wedding-sage opacity-10 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/3"></div>

      <div className="bg-wedding-card p-8 md:p-12 mx-4 md:mx-0 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#f0ebe1] max-w-md w-full relative z-10">
        <div className="flex justify-center mb-8">
          <div className="bg-[#fdfbf7] p-5 rounded-full text-wedding-accent shadow-sm border border-[#f0ebe1]">
            <Heart size={40} strokeWidth={1.5} className="fill-wedding-rose/20 text-wedding-rose" />
          </div>
        </div>
        <h1 className="text-4xl font-serif font-medium text-wedding-text mb-8 text-center tracking-tight">Halo!</h1>
        
        <div className="flex gap-2 mb-10 bg-[#fdfbf7] p-1.5 rounded-full border border-[#f0ebe1]">
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === 'create' ? 'bg-white shadow-sm text-wedding-accent' : 'text-wedding-muted hover:text-wedding-text'
            }`}
          >
            Bikin Rencana Baru
          </button>
          <button
            onClick={() => setMode('join')}
            className={`flex-1 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
              mode === 'join' ? 'bg-white shadow-sm text-wedding-accent' : 'text-wedding-muted hover:text-wedding-text'
            }`}
          >
            Gabung Pasangan
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-wedding-rose/10 text-wedding-rose rounded-2xl text-sm border border-wedding-rose/20">
            {error}
          </div>
        )}

        {mode === 'create' ? (
          <form onSubmit={handleCreate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Nama Acara</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="misal: Nikahan Budi & Ani"
                className="w-full px-5 py-3.5 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Target Budget (Rp)</label>
              <input
                type="number"
                required
                min="0"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="misal: 100000000"
                className="w-full px-5 py-3.5 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-wedding-text hover:bg-[#1a1918] text-white font-medium py-4 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
            >
              {loading ? 'Lagi bikin...' : 'Buat Sekarang'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleJoin} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Kode Nikahan Pasangan</label>
              <p className="text-xs text-wedding-muted mb-3 font-light leading-relaxed">Minta kode nikahan dari pasanganmu di halaman ringkasan mereka.</p>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-3.5 text-wedding-muted" size={20} strokeWidth={1.5} />
                <input
                  type="text"
                  required
                  value={joinId}
                  onChange={(e) => setJoinId(e.target.value)}
                  placeholder="Paste kode di sini"
                  className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-wedding-text hover:bg-[#1a1918] text-white font-medium py-4 px-6 rounded-full transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-4"
            >
              {loading ? 'Lagi gabung...' : 'Gabung Sekarang'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
