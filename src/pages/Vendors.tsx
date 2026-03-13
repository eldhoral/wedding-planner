import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { Plus, Trash2, Edit2, Phone, Mail, User as UserIcon, Users, MapPin, Globe, Instagram } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Vendors() {
  const { weddingId } = useAuth();
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('venue');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [website, setWebsite] = useState('');
  const [socialMedia, setSocialMedia] = useState('');
  const [status, setStatus] = useState('contacted');
  const [notes, setNotes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [vendorToDelete, setVendorToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (!weddingId) return;

    const q = query(collection(db, 'vendors'), where('weddingId', '==', weddingId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newVendors = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setVendors(newVendors);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;

    const vendorData = {
      weddingId,
      name,
      category,
      contactName,
      phone,
      email,
      address,
      website,
      socialMedia,
      status,
      notes,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'vendors', editingId), vendorData);
      } else {
        await addDoc(collection(db, 'vendors'), vendorData);
      }
      resetForm();
    } catch (error) {
      console.error("Error saving vendor", error);
    }
  };

  const handleDelete = async () => {
    if (vendorToDelete) {
      try {
        await deleteDoc(doc(db, 'vendors', vendorToDelete));
        setVendorToDelete(null);
      } catch (error) {
        console.error("Error deleting vendor", error);
      }
    }
  };

  const handleEdit = (vendor: any) => {
    setName(vendor.name);
    setCategory(vendor.category);
    setContactName(vendor.contactName || '');
    setPhone(vendor.phone || '');
    setEmail(vendor.email || '');
    setAddress(vendor.address || '');
    setWebsite(vendor.website || '');
    setSocialMedia(vendor.socialMedia || '');
    setStatus(vendor.status);
    setNotes(vendor.notes || '');
    setEditingId(vendor.id);
    setShowForm(true);
  };

  const resetForm = () => {
    setName('');
    setCategory('venue');
    setContactName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setWebsite('');
    setSocialMedia('');
    setStatus('contacted');
    setNotes('');
    setEditingId(null);
    setShowForm(false);
  };

  const categories = ['venue', 'catering', 'attire', 'photography', 'decor', 'entertainment', 'seserahan', 'other'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'booked': return 'bg-[#eef2ef] text-[#5A7A62] border-[#d1ded4]';
      case 'meeting_set': return 'bg-[#fdfbf7] text-wedding-accent border-[#f0ebe1]';
      case 'rejected': return 'bg-wedding-rose/10 text-wedding-rose border-wedding-rose/20';
      default: return 'bg-white text-wedding-muted border-[#f0ebe1]';
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-serif font-medium text-wedding-text tracking-tight">Vendor</h1>
          <p className="text-wedding-muted mt-2 font-light tracking-wide">Simpan kontak dan status vendor nikahan kalian.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-wedding-text hover:bg-[#1a1918] text-white px-5 py-2.5 rounded-full font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm hover:shadow-md hover:-translate-y-0.5 w-full md:w-auto"
        >
          <Plus size={20} strokeWidth={1.5} />
          Tambah Vendor
        </button>
      </div>

      {showForm && (
        <div className="bg-wedding-card p-8 rounded-[2rem] border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-rose opacity-10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <h2 className="text-2xl font-serif font-medium text-wedding-text mb-6 relative z-10">
            {editingId ? 'Edit Vendor' : 'Vendor Baru'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Nama Vendor</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: Catering Enak"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Kategori</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300 capitalize"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Nama Kontak</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: Mbak Sarah"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300 capitalize"
                >
                  <option value="contacted">Udah Dihubungi</option>
                  <option value="meeting_set">Jadwal Meeting</option>
                  <option value="booked">Udah Dibooking</option>
                  <option value="rejected">Ditolak / Batal</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">No. HP / WA</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: 0812..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: halo@vendor.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Alamat</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: Jl. Sudirman No. 1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Website</label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: https://vendor.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Media Sosial</label>
                <input
                  type="text"
                  value={socialMedia}
                  onChange={(e) => setSocialMedia(e.target.value)}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="misal: @vendor_ig"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-wedding-text mb-2 tracking-wide">Catatan</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full px-5 py-3 rounded-2xl border border-[#f0ebe1] bg-[#fdfbf7] focus:bg-white focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 transition-all duration-300"
                  placeholder="Hasil meeting, harga paket, dll."
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

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><LoadingSpinner /></div>
        ) : vendors.length === 0 ? (
          <div className="col-span-full bg-wedding-card rounded-[2rem] border border-[#f0ebe1] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="w-20 h-20 bg-[#fdfbf7] border border-[#f0ebe1] rounded-full flex items-center justify-center mx-auto mb-6 text-wedding-muted">
              <Users size={36} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-medium text-wedding-text mb-2">Belum ada vendor</h3>
            <p className="text-wedding-muted font-light tracking-wide">Mulai kumpulin daftar vendor incaran kalian di sini.</p>
          </div>
        ) : (
          vendors.map((vendor) => (
            <div key={vendor.id} className="bg-wedding-card rounded-3xl border border-[#f0ebe1] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col group">
              <div className="p-6 border-b border-[#f0ebe1] bg-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-wedding-rose opacity-5 rounded-full blur-2xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-wedding-muted">
                    {vendor.category}
                  </span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-medium border capitalize transition-colors ${getStatusColor(vendor.status)}`}>
                    {vendor.status.replace('_', ' ')}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-medium text-wedding-text truncate relative z-10">{vendor.name}</h3>
              </div>
              
              <div className="p-6 flex-1 space-y-4 bg-[#fdfbf7]">
                {vendor.contactName && (
                  <div className="flex items-center gap-3 text-wedding-text text-sm font-light">
                    <UserIcon size={16} strokeWidth={1.5} className="text-wedding-muted" />
                    <span>{vendor.contactName}</span>
                  </div>
                )}
                {vendor.phone && (
                  <div className="flex items-center gap-3 text-wedding-text text-sm font-light">
                    <Phone size={16} strokeWidth={1.5} className="text-wedding-muted" />
                    <a href={`tel:${vendor.phone}`} className="hover:text-wedding-accent transition-colors">{vendor.phone}</a>
                  </div>
                )}
                {vendor.email && (
                  <div className="flex items-center gap-3 text-wedding-text text-sm font-light">
                    <Mail size={16} strokeWidth={1.5} className="text-wedding-muted shrink-0" />
                    <a href={`mailto:${vendor.email}`} className="hover:text-wedding-accent transition-colors truncate">{vendor.email}</a>
                  </div>
                )}
                {vendor.address && (
                  <div className="flex items-center gap-3 text-wedding-text text-sm font-light">
                    <MapPin size={16} strokeWidth={1.5} className="text-wedding-muted shrink-0" />
                    <span className="truncate">{vendor.address}</span>
                  </div>
                )}
                {vendor.website && (
                  <div className="flex items-center gap-3 text-wedding-text text-sm font-light">
                    <Globe size={16} strokeWidth={1.5} className="text-wedding-muted shrink-0" />
                    <a href={vendor.website} target="_blank" rel="noopener noreferrer" className="hover:text-wedding-accent transition-colors truncate">{vendor.website}</a>
                  </div>
                )}
                {vendor.socialMedia && (
                  <div className="flex items-center gap-3 text-wedding-text text-sm font-light">
                    <Instagram size={16} strokeWidth={1.5} className="text-wedding-muted shrink-0" />
                    <span className="truncate">{vendor.socialMedia}</span>
                  </div>
                )}
                {vendor.notes && (
                  <div className="mt-5 pt-5 border-t border-[#f0ebe1]">
                    <p className="text-sm text-wedding-muted font-light leading-relaxed line-clamp-3">{vendor.notes}</p>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-white border-t border-[#f0ebe1] flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button 
                  onClick={() => handleEdit(vendor)}
                  className="p-2.5 text-wedding-muted hover:text-wedding-accent hover:bg-[#fdfbf7] rounded-full transition-all duration-300"
                >
                  <Edit2 size={18} strokeWidth={1.5} />
                </button>
                <button 
                  onClick={() => setVendorToDelete(vendor.id)}
                  className="p-2.5 text-wedding-muted hover:text-wedding-rose hover:bg-[#fdfbf7] rounded-full transition-all duration-300"
                >
                  <Trash2 size={18} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {vendorToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a1918]/40 backdrop-blur-sm transition-all">
          <div className="bg-wedding-card rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-[#f0ebe1] transform transition-all">
            <h3 className="text-2xl font-serif font-medium text-wedding-text mb-3">Hapus Vendor</h3>
            <p className="text-wedding-muted font-light tracking-wide mb-8">Anda yakin ingin menghapus vendor ini?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setVendorToDelete(null)}
                className="px-6 py-2.5 text-wedding-muted hover:bg-[#fdfbf7] rounded-full transition-all duration-300 font-medium border border-transparent hover:border-[#f0ebe1]"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                className="px-6 py-2.5 bg-wedding-rose hover:bg-[#c97a7e] text-white rounded-full transition-all duration-300 font-medium shadow-sm hover:shadow-md hover:-translate-y-0.5"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
