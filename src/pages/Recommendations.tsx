import React, { useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Sparkles, MapPin, DollarSign, Palette, Plus, CheckCircle } from 'lucide-react';
import { GoogleGenAI, Type } from '@google/genai';

export default function Recommendations() {
  const { weddingId } = useAuth();
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [addedVendors, setAddedVendors] = useState<Set<string>>(new Set());
  
  // Form state
  const [location, setLocation] = useState('');
  const [budget, setBudget] = useState('');
  const [style, setStyle] = useState('modern');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendations([]);
    setAddedVendors(new Set());

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `Kamu adalah wedding planner ahli. Berdasarkan kriteria berikut, rekomendasikan 4 vendor pernikahan yang realistis (tapi fiktif):
      Lokasi: ${location}
      Total Budget Nikah: ${budget} IDR
      Gaya Pernikahan: ${style}
      
      Berikan campuran kategori (misal: venue, photography, catering, decor).
      Pastikan perkiraan harga masuk akal untuk total budget yang diberikan. Gunakan bahasa Indonesia santai.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING, description: "A unique random string ID" },
                name: { type: Type.STRING, description: "Name of the vendor" },
                category: { type: Type.STRING, description: "Category (venue, catering, photography, decor, etc.)" },
                estimatedPrice: { type: Type.NUMBER, description: "Estimated price in IDR" },
                description: { type: Type.STRING, description: "A short description of what they offer" },
                reason: { type: Type.STRING, description: "Why this fits the user's style and budget" }
              },
              required: ["id", "name", "category", "estimatedPrice", "description", "reason"]
            }
          }
        }
      });

      const jsonStr = response.text?.trim() || "[]";
      const vendors = JSON.parse(jsonStr);
      setRecommendations(vendors);
    } catch (error) {
      console.error("Error generating recommendations", error);
      alert("Gagal bikin rekomendasi. Coba lagi ya.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (vendor: any) => {
    if (!weddingId || addedVendors.has(vendor.id)) return;

    try {
      await addDoc(collection(db, 'vendors'), {
        weddingId,
        name: vendor.name,
        category: vendor.category.toLowerCase(),
        status: 'contacted',
        notes: `Rekomendasi AI:\n${vendor.description}\n\nAlasan: ${vendor.reason}\nPerkiraan Harga: Rp ${vendor.estimatedPrice.toLocaleString('id-ID')}`,
      });
      
      setAddedVendors(prev => new Set(prev).add(vendor.id));
    } catch (error) {
      console.error("Error adding vendor", error);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const styles = ['tradisional', 'modern', 'garden', 'rustic', 'minimalis', 'glamor', 'pantai'];

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-medium text-wedding-text tracking-tight">Rekomendasi Pintar</h1>
          <p className="text-wedding-muted mt-2 font-light tracking-wide">Dapetin saran vendor dari AI yang pas buat nikahan kalian.</p>
        </div>
        <div className="bg-[#fdfbf7] border border-[#f0ebe1] p-4 rounded-full text-wedding-accent shadow-sm">
          <Sparkles size={24} strokeWidth={1.5} />
        </div>
      </div>

      <div className="bg-wedding-card p-8 rounded-[2rem] border border-[#f0ebe1] shadow-sm relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-rose/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-wedding-sage/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

        <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-wedding-text mb-2">
                <MapPin size={16} strokeWidth={1.5} className="text-wedding-muted" />
                Kota / Lokasi
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text placeholder:text-wedding-muted/50"
                placeholder="misal: Jakarta Selatan"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-wedding-text mb-2">
                <DollarSign size={16} strokeWidth={1.5} className="text-wedding-muted" />
                Total Budget (Rp)
              </label>
              <input
                type="number"
                required
                min="1000000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text placeholder:text-wedding-muted/50"
                placeholder="misal: 150000000"
              />
            </div>
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-wedding-text mb-2">
                <Palette size={16} strokeWidth={1.5} className="text-wedding-muted" />
                Gaya Pernikahan
              </label>
              <select
                value={style}
                onChange={(e) => setStyle(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text capitalize"
              >
                {styles.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-wedding-text hover:bg-wedding-text/90 text-white px-8 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-70 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span className="font-light tracking-wide">Lagi nyari...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} strokeWidth={1.5} />
                  <span className="font-light tracking-wide">Cari Vendor</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-serif font-medium text-wedding-text">Rekomendasi Buat Kalian</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recommendations.map((vendor) => {
              const isAdded = addedVendors.has(vendor.id);
              return (
                <div key={vendor.id} className="bg-wedding-card rounded-3xl border border-[#f0ebe1] shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col relative">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-wedding-rose/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
                  
                  <div className="p-6 border-b border-[#f0ebe1] flex-1 bg-white/50 relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-[#fdfbf7] border border-[#f0ebe1] text-wedding-muted rounded-full text-[10px] font-medium uppercase tracking-widest">
                        {vendor.category}
                      </span>
                      <span className="font-serif font-medium text-[#5A7A62] text-lg">
                        {formatCurrency(vendor.estimatedPrice)}
                      </span>
                    </div>
                    <h3 className="text-2xl font-serif font-medium text-wedding-text mb-3">{vendor.name}</h3>
                    <p className="text-wedding-muted font-light text-sm mb-5 leading-relaxed">{vendor.description}</p>
                    <div className="bg-[#fdfbf7] p-4 rounded-2xl border border-[#f0ebe1]">
                      <p className="text-sm text-wedding-text font-light leading-relaxed">
                        <span className="font-medium block mb-1 text-wedding-accent">Kenapa cocok:</span>
                        {vendor.reason}
                      </p>
                    </div>
                  </div>
                  <div className="p-5 bg-[#fdfbf7] border-t border-[#f0ebe1] relative z-10">
                    <button
                      onClick={() => handleAddVendor(vendor)}
                      disabled={isAdded}
                      className={`w-full py-3 rounded-full font-medium flex items-center justify-center gap-2 transition-all ${
                        isAdded 
                          ? 'bg-[#eef2ef] text-[#5A7A62] border border-[#d1ded4] cursor-default' 
                          : 'bg-white border border-[#f0ebe1] text-wedding-text hover:bg-wedding-text hover:text-white shadow-sm hover:shadow-md'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle size={18} strokeWidth={1.5} />
                          <span className="font-light tracking-wide">Udah Disimpan</span>
                        </>
                      ) : (
                        <>
                          <Plus size={18} strokeWidth={1.5} />
                          <span className="font-light tracking-wide">Simpan ke Vendor</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
