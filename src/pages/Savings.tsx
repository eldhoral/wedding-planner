import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { Plus, Trash2, PiggyBank } from 'lucide-react';
import { format } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Savings() {
  const { weddingId, user } = useAuth();
  const [savings, setSavings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!weddingId) return;

    const q = query(
      collection(db, 'savings'), 
      where('weddingId', '==', weddingId)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newSavings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      // Sort client side since we need a composite index for orderBy with where
      newSavings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setSavings(newSavings);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId || !user) return;

    try {
      await addDoc(collection(db, 'savings'), {
        weddingId,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        note,
        depositedBy: user.displayName || user.email,
      });
      resetForm();
    } catch (error) {
      console.error("Error saving deposit", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this record?')) {
      try {
        await deleteDoc(doc(db, 'savings', id));
      } catch (error) {
        console.error("Error deleting record", error);
      }
    }
  };

  const resetForm = () => {
    setAmount('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setNote('');
    setShowForm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const totalSaved = savings.reduce((sum, record) => sum + record.amount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h1 className="text-3xl font-serif font-medium text-wedding-text tracking-tight">Catatan Tabungan</h1>
          <p className="text-wedding-muted mt-2 font-light tracking-wide">Pantau uang tabungan nikah kalian bareng-bareng.</p>
        </div>
        <div className="bg-wedding-card px-8 py-4 rounded-2xl border border-[#f0ebe1] shadow-sm text-right w-full md:w-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-wedding-sage opacity-20 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <p className="text-xs font-medium text-wedding-muted uppercase tracking-widest mb-1 relative z-10">Total Terkumpul</p>
          <p className="text-3xl font-serif font-medium text-[#5A7A62] relative z-10">{formatCurrency(totalSaved)}</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="bg-wedding-text hover:bg-[#1a1918] text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={1.5} />
          Tambah Tabungan
        </button>
      </div>

      {showForm && (
        <div className="bg-wedding-card p-8 rounded-[2rem] border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-sage opacity-10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-2xl font-serif font-medium text-wedding-text mb-6 relative z-10">Tabungan Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Jumlah (Rp)</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: 5000000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Tanggal</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Catatan (Opsional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: Bonus bulanan"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2.5 text-wedding-muted hover:bg-[#fdfbf7] rounded-full transition-all duration-300 font-medium border border-transparent hover:border-[#f0ebe1]"
              >
                Batal
              </button>
              <button
                type="submit"
                className="bg-wedding-text hover:bg-[#1a1918] text-white px-8 py-2.5 rounded-full font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Simpan
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-wedding-card rounded-[2rem] border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><LoadingSpinner /></div>
        ) : savings.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-[#fdfbf7] border border-[#f0ebe1] rounded-full flex items-center justify-center mx-auto mb-6 text-wedding-muted">
              <PiggyBank size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-medium text-wedding-text mb-2">Belum ada tabungan</h3>
            <p className="text-wedding-muted font-light tracking-wide">Mulai catat tabungan kalian buat mantau progress.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fdfbf7] border-b border-[#f0ebe1] text-wedding-muted text-xs uppercase tracking-widest font-medium">
                  <th className="p-5 font-semibold">Tanggal</th>
                  <th className="p-5 font-semibold">Ditabung Oleh</th>
                  <th className="p-5 font-semibold">Catatan</th>
                  <th className="p-5 font-semibold text-right">Jumlah</th>
                  <th className="p-5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe1]">
                {savings.map((record) => (
                  <tr key={record.id} className="hover:bg-[#fdfbf7] transition-colors duration-200 group">
                    <td className="p-5 text-wedding-muted font-light">
                      {format(new Date(record.date), 'MMM d, yyyy')}
                    </td>
                    <td className="p-5 font-medium text-wedding-text">{record.depositedBy}</td>
                    <td className="p-5 text-wedding-muted font-light">{record.note || '-'}</td>
                    <td className="p-5 text-right font-serif font-medium text-lg text-[#5A7A62]">
                      +{formatCurrency(record.amount)}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => handleDelete(record.id)}
                          className="p-2.5 text-wedding-muted hover:text-wedding-rose hover:bg-[#fdfbf7] rounded-full transition-all duration-300"
                        >
                          <Trash2 size={18} strokeWidth={1.5} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
