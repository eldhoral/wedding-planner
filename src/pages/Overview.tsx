import React, { useEffect, useState } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Copy, CheckCircle, TrendingUp, PiggyBank, DollarSign, Users } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Overview() {
  const { weddingId } = useAuth();
  const [wedding, setWedding] = useState<any>(null);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalEstimated, setTotalEstimated] = useState(0);
  const [totalActual, setTotalActual] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!weddingId) return;

    const unsubscribeWedding = onSnapshot(doc(db, 'weddings', weddingId), (doc) => {
      if (doc.exists()) {
        setWedding(doc.data());
      }
    });

    const qSavings = query(collection(db, 'savings'), where('weddingId', '==', weddingId));
    const unsubscribeSavings = onSnapshot(qSavings, (snapshot) => {
      let total = 0;
      snapshot.forEach((doc) => {
        total += doc.data().amount;
      });
      setTotalSaved(total);
    });

    const qBudget = query(collection(db, 'budgetItems'), where('weddingId', '==', weddingId));
    const unsubscribeBudget = onSnapshot(qBudget, (snapshot) => {
      let est = 0;
      let act = 0;
      snapshot.forEach((doc) => {
        const data = doc.data();
        est += data.estimatedCost || 0;
        act += data.actualCost || 0;
      });
      setTotalEstimated(est);
      setTotalActual(act);
    });

    return () => {
      unsubscribeWedding();
      unsubscribeSavings();
      unsubscribeBudget();
    };
  }, [weddingId]);

  const handleCopyId = () => {
    if (weddingId) {
      navigator.clipboard.writeText(weddingId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!wedding) return <LoadingSpinner />;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
  };

  const budgetGoal = wedding.totalBudgetGoal || 0;
  const savingsProgress = budgetGoal > 0 ? (totalSaved / budgetGoal) * 100 : 0;

  const chartData = [
    { name: 'Saved', value: totalSaved, color: '#9baba0' }, // wedding-sage
    { name: 'Remaining', value: Math.max(0, budgetGoal - totalSaved), color: '#f0ebe1' }, // light border
  ];

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-4xl font-serif font-medium text-wedding-text tracking-tight">{wedding.name}</h1>
          <p className="text-wedding-muted mt-2 tracking-wide font-light">Ini progress rencana nikahan kalian sejauh ini.</p>
        </div>
        <div className="bg-wedding-card px-5 py-3 rounded-full border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex items-center justify-between gap-4 w-full md:w-auto">
          <div className="text-sm">
            <span className="text-wedding-muted block text-[10px] uppercase tracking-widest font-medium mb-0.5">Kode Nikahan</span>
            <span className="font-mono font-medium text-wedding-text tracking-wider">{weddingId}</span>
          </div>
          <button
            onClick={handleCopyId}
            className="p-2 hover:bg-[#fdfbf7] rounded-full transition-all duration-300 text-wedding-muted hover:text-wedding-accent shrink-0"
            title="Copy kode buat dikasih ke pasangan"
          >
            {copied ? <CheckCircle size={18} className="text-wedding-sage" strokeWidth={1.5} /> : <Copy size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-wedding-card p-8 rounded-3xl border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-wedding-rose opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-6 text-wedding-muted">
            <div className="p-2 bg-[#fdfbf7] rounded-full text-wedding-rose">
              <DollarSign size={18} strokeWidth={1.5} />
            </div>
            <h3 className="font-medium tracking-wide text-sm uppercase">Target Budget</h3>
          </div>
          <p className="text-3xl font-serif font-medium text-wedding-text">{formatCurrency(budgetGoal)}</p>
        </div>

        <div className="bg-wedding-card p-8 rounded-3xl border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-wedding-sage opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-6 text-wedding-muted">
            <div className="p-2 bg-[#fdfbf7] rounded-full text-wedding-sage">
              <PiggyBank size={18} strokeWidth={1.5} />
            </div>
            <h3 className="font-medium tracking-wide text-sm uppercase">Uang Terkumpul</h3>
          </div>
          <p className="text-3xl font-serif font-medium text-wedding-text">{formatCurrency(totalSaved)}</p>
          <div className="mt-5 bg-[#f0ebe1] h-1.5 rounded-full overflow-hidden">
            <div 
              className="bg-wedding-sage h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${Math.min(100, savingsProgress)}%` }}
            />
          </div>
          <p className="text-xs text-wedding-muted mt-3 text-right font-light tracking-wide">{savingsProgress.toFixed(1)}% of goal</p>
        </div>

        <div className="bg-wedding-card p-8 rounded-3xl border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-wedding-accent opacity-10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-6 text-wedding-muted">
            <div className="p-2 bg-[#fdfbf7] rounded-full text-wedding-accent">
              <TrendingUp size={18} strokeWidth={1.5} />
            </div>
            <h3 className="font-medium tracking-wide text-sm uppercase">Uang Keluar</h3>
          </div>
          <p className="text-3xl font-serif font-medium text-wedding-text">{formatCurrency(totalActual)}</p>
          <p className="text-sm text-wedding-muted mt-3 font-light tracking-wide">
            vs Perkiraan: <span className="font-medium">{formatCurrency(totalEstimated)}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-wedding-card p-8 rounded-3xl border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="font-serif font-medium text-2xl text-wedding-text mb-8">Progress Tabungan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={4}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '16px', border: '1px solid #f0ebe1', boxShadow: '0 8px 30px rgb(0 0 0 / 0.04)', fontFamily: 'Inter, sans-serif' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-8 mt-6">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-wedding-sage"></div>
              <span className="text-sm text-wedding-muted tracking-wide">Terkumpul</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 rounded-full bg-[#f0ebe1]"></div>
              <span className="text-sm text-wedding-muted tracking-wide">Kurangnya</span>
            </div>
          </div>
        </div>

        <div className="bg-wedding-card p-8 rounded-3xl border border-[#f0ebe1] shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="font-serif font-medium text-2xl text-wedding-text mb-6">Akses Cepat</h3>
          <div className="space-y-4">
            <p className="text-wedding-muted text-sm font-light tracking-wide mb-6">Halo! Ini beberapa hal yang bisa kalian lakuin di sini:</p>
            <ul className="space-y-5">
              <li className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-[#fdfbf7] text-wedding-rose p-3 rounded-full mt-0.5 group-hover:bg-wedding-rose group-hover:text-white transition-colors duration-300">
                  <DollarSign size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-medium text-wedding-text tracking-wide mb-1">Atur Budget</h4>
                  <p className="text-sm text-wedding-muted font-light leading-relaxed">Catat barang/jasa yang mau dibeli dan pantau biayanya.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-[#fdfbf7] text-wedding-sage p-3 rounded-full mt-0.5 group-hover:bg-wedding-sage group-hover:text-white transition-colors duration-300">
                  <PiggyBank size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-medium text-wedding-text tracking-wide mb-1">Catat Tabungan</h4>
                  <p className="text-sm text-wedding-muted font-light leading-relaxed">Masukin uang yang udah kalian tabung bareng.</p>
                </div>
              </li>
              <li className="flex items-start gap-4 group cursor-pointer">
                <div className="bg-[#fdfbf7] text-wedding-accent p-3 rounded-full mt-0.5 group-hover:bg-wedding-accent group-hover:text-white transition-colors duration-300">
                  <Users size={18} strokeWidth={1.5} />
                </div>
                <div>
                  <h4 className="font-medium text-wedding-text tracking-wide mb-1">Daftar Vendor</h4>
                  <p className="text-sm text-wedding-muted font-light leading-relaxed">Simpan kontak catering, gedung, dan vendor lainnya.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
