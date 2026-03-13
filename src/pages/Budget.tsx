import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, CheckCircle, Circle, DollarSign } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Budget() {
  const { weddingId } = useAuth();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('venue');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [status, setStatus] = useState('planned');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!weddingId) return;

    const q = query(collection(db, 'budgetItems'), where('weddingId', '==', weddingId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newItems = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItems(newItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;

    const itemData = {
      weddingId,
      name,
      category,
      estimatedCost: Number(estimatedCost),
      actualCost: actualCost ? Number(actualCost) : 0,
      status,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'budgetItems', editingId), itemData);
      } else {
        await addDoc(collection(db, 'budgetItems'), itemData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving budget item", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteDoc(doc(db, 'budgetItems', id));
      } catch (error) {
        console.error("Error deleting item", error);
      }
    }
  };

  const handleEdit = (item: any) => {
    setName(item.name);
    setCategory(item.category);
    setEstimatedCost(item.estimatedCost.toString());
    setActualCost(item.actualCost ? item.actualCost.toString() : '');
    setStatus(item.status);
    setEditingId(item.id);
    setShowForm(true);
  };

  const toggleStatus = async (item: any) => {
    const nextStatus = item.status === 'planned' ? 'booked' : item.status === 'booked' ? 'paid' : 'planned';
    try {
      await updateDoc(doc(db, 'budgetItems', item.id), { status: nextStatus });
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const resetForm = () => {
    setName('');
    setCategory('venue');
    setEstimatedCost('');
    setActualCost('');
    setStatus('planned');
    setEditingId(null);
    setShowForm(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const categories = ['venue', 'catering', 'attire', 'photography', 'decor', 'entertainment', 'other'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium text-wedding-text tracking-tight">Atur Budget</h1>
          <p className="text-wedding-muted mt-2 font-light tracking-wide">Catat perkiraan dan pengeluaran asli kalian.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-wedding-text hover:bg-[#1a1918] text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={1.5} />
          Tambah Item
        </button>
      </div>

      {showForm && (
        <div className="bg-wedding-card p-8 rounded-[2rem] border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-rose opacity-10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-2xl font-serif font-medium text-wedding-text mb-6 relative z-10">
            {editingId ? 'Edit Item' : 'Item Budget Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Nama Item</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: Sewa Gedung A"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300 capitalize"
                >
                  <option value="venue">Venue / Gedung</option>
                  <option value="catering">Catering</option>
                  <option value="attire">Baju & Make Up</option>
                  <option value="decor">Dekorasi</option>
                  <option value="photography">Foto & Video</option>
                  <option value="other">Lainnya</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Perkiraan Biaya (Rp)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Biaya Asli (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={actualCost}
                  onChange={(e) => setActualCost(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="Kosongin kalau belum dibayar"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300 capitalize"
                >
                  <option value="planned">Direncanain</option>
                  <option value="booked">Udah Dibooking</option>
                  <option value="paid">Udah Lunas</option>
                </select>
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
        ) : items.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-20 h-20 bg-[#fdfbf7] border border-[#f0ebe1] rounded-full flex items-center justify-center mx-auto mb-6 text-wedding-muted">
              <DollarSign size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-medium text-wedding-text mb-2">Belum ada item budget</h3>
            <p className="text-wedding-muted font-light tracking-wide">Mulai tambahin pengeluaran kalian buat mantau budget.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fdfbf7] border-b border-[#f0ebe1] text-wedding-muted text-xs uppercase tracking-widest font-medium">
                  <th className="p-5 font-semibold">Status</th>
                  <th className="p-5 font-semibold">Item</th>
                  <th className="p-5 font-semibold">Kategori</th>
                  <th className="p-5 font-semibold text-right">Perkiraan</th>
                  <th className="p-5 font-semibold text-right">Asli</th>
                  <th className="p-5 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0ebe1]">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-[#fdfbf7] transition-colors duration-200 group">
                    <td className="p-5">
                      <button 
                        onClick={() => toggleStatus(item)}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium capitalize border transition-all duration-300 ${
                          item.status === 'paid' ? 'bg-[#eef2ef] text-[#5A7A62] border-[#d1ded4]' :
                          item.status === 'booked' ? 'bg-[#fdfbf7] text-wedding-accent border-[#f0ebe1]' :
                          'bg-white text-wedding-muted border-[#f0ebe1] hover:border-wedding-muted/30'
                        }`}
                      >
                        {item.status === 'paid' ? <CheckCircle size={14} strokeWidth={2} /> : <Circle size={14} strokeWidth={1.5} />}
                        {item.status === 'planned' ? 'Direncanain' : item.status === 'booked' ? 'Dibooking' : 'Lunas'}
                      </button>
                    </td>
                    <td className="p-5 font-medium text-wedding-text">{item.name}</td>
                    <td className="p-5 text-wedding-muted capitalize font-light">{item.category}</td>
                    <td className="p-5 text-right text-wedding-muted font-serif text-lg">{formatCurrency(item.estimatedCost)}</td>
                    <td className="p-5 text-right font-medium text-wedding-text font-serif text-lg">
                      {item.actualCost > 0 ? formatCurrency(item.actualCost) : '-'}
                    </td>
                    <td className="p-5 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="p-2.5 text-wedding-muted hover:text-wedding-accent hover:bg-[#fdfbf7] rounded-full transition-all duration-300"
                        >
                          <Edit2 size={18} strokeWidth={1.5} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
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
