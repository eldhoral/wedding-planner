import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Calendar as CalendarIcon, Download, Clock } from 'lucide-react';
import { format, parseISO, isSameDay } from 'date-fns';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Calendar() {
  const { weddingId } = useAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [type, setType] = useState('appointment');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!weddingId) return;

    const q = query(collection(db, 'events'), where('weddingId', '==', weddingId));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newEvents = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      newEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      setEvents(newEvents);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [weddingId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weddingId) return;

    try {
      await addDoc(collection(db, 'events'), {
        weddingId,
        title,
        date: new Date(date).toISOString(),
        type,
        description,
      });
      resetForm();
    } catch (error) {
      console.error("Error saving event", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteDoc(doc(db, 'events', id));
      } catch (error) {
        console.error("Error deleting event", error);
      }
    }
  };

  const resetForm = () => {
    setTitle('');
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setType('appointment');
    setDescription('');
    setShowForm(false);
  };

  const generateICS = (event: any) => {
    const startDate = new Date(event.date);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatDate = (d: Date) => d.toISOString().replace(/-|:|\.\d+/g, '');
    
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startDate)}
DTEND:${formatDate(endDate)}
SUMMARY:${event.title}
DESCRIPTION:${event.description || ''}
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${event.title.replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'wedding_day': return 'bg-wedding-rose/20 text-wedding-rose border-wedding-rose/30';
      case 'appointment': return 'bg-[#fdfbf7] text-wedding-accent border-[#f0ebe1]';
      case 'milestone': return 'bg-[#eef2ef] text-[#5A7A62] border-[#d1ded4]';
      case 'task': return 'bg-[#fdfbf7] text-wedding-muted border-[#f0ebe1]';
      default: return 'bg-white text-wedding-muted border-[#f0ebe1]';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-serif font-medium text-wedding-text tracking-tight">Jadwal</h1>
          <p className="text-wedding-muted mt-2 font-light tracking-wide">Catat tanggal penting dan jadwal meeting kalian.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-wedding-text hover:bg-wedding-text/90 text-white px-6 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 w-full md:w-auto"
        >
          <Plus size={18} strokeWidth={1.5} />
          <span className="font-light tracking-wide">Tambah Jadwal</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-wedding-card p-8 rounded-[2rem] border border-[#f0ebe1] shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-wedding-rose/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-wedding-sage/20 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3 pointer-events-none" />

          <h2 className="text-2xl font-serif font-medium text-wedding-text mb-6 relative z-10">Jadwal Baru</h2>
          <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2">Nama Jadwal</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text placeholder:text-wedding-muted/50"
                  placeholder="misal: Test Food Catering"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2">Tanggal & Waktu</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-wedding-text mb-2">Tipe Jadwal</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text capitalize"
                >
                  <option value="appointment">Meeting Vendor</option>
                  <option value="milestone">Acara Penting</option>
                  <option value="task">Deadline Tugas</option>
                  <option value="wedding_day">Hari H Nikahan</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-wedding-text mb-2">Deskripsi (Opsional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl border border-[#f0ebe1] bg-[#fdfbf7] focus:outline-none focus:ring-2 focus:ring-wedding-accent/50 text-wedding-text placeholder:text-wedding-muted/50"
                  placeholder="Lokasi, barang yang harus dibawa, dll."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-wedding-muted hover:text-wedding-text hover:bg-[#fdfbf7] rounded-full transition-colors font-medium border border-transparent hover:border-[#f0ebe1]"
              >
                <span className="font-light tracking-wide">Batal</span>
              </button>
              <button
                type="submit"
                className="bg-wedding-text hover:bg-wedding-text/90 text-white px-8 py-3 rounded-full font-medium transition-all shadow-sm hover:shadow-md"
              >
                <span className="font-light tracking-wide">Simpan</span>
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-wedding-card rounded-[2rem] border border-[#f0ebe1] shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center">
            <div className="w-8 h-8 border-2 border-wedding-accent/30 border-t-wedding-accent rounded-full animate-spin" />
          </div>
        ) : events.length === 0 ? (
          <div className="p-16 text-center bg-[#fdfbf7] border-b border-[#f0ebe1]">
            <div className="w-20 h-20 bg-white border border-[#f0ebe1] rounded-full flex items-center justify-center mx-auto mb-6 text-wedding-muted shadow-sm">
              <CalendarIcon size={32} strokeWidth={1.5} />
            </div>
            <h3 className="text-xl font-serif font-medium text-wedding-text mb-2">Belum ada jadwal</h3>
            <p className="text-wedding-muted font-light tracking-wide">Mulai catat jadwal meeting dan tanggal penting kalian di sini.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#f0ebe1]">
            {events.map((event) => {
              const eventDate = parseISO(event.date);
              const isPast = eventDate.getTime() < new Date().getTime();
              
              return (
                <div key={event.id} className={`p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start md:items-center hover:bg-[#fdfbf7] transition-colors group ${isPast ? 'opacity-60' : ''}`}>
                  <div className="flex-shrink-0 text-center md:w-28 bg-white border border-[#f0ebe1] rounded-2xl p-4 shadow-sm">
                    <p className="text-[10px] font-medium text-wedding-muted uppercase tracking-widest mb-1">{format(eventDate, 'MMM')}</p>
                    <p className="text-3xl font-serif font-medium text-wedding-text">{format(eventDate, 'dd')}</p>
                    <p className="text-xs text-wedding-muted font-light mt-1">{format(eventDate, 'yyyy')}</p>
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-serif font-medium text-wedding-text">{event.title}</h3>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border ${getTypeColor(event.type)}`}>
                        {event.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-wedding-muted mb-3 font-light">
                      <Clock size={14} strokeWidth={1.5} />
                      <span>{format(eventDate, 'h:mm a')}</span>
                    </div>
                    {event.description && (
                      <p className="text-sm text-wedding-muted font-light leading-relaxed">{event.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-3 w-full md:w-auto mt-4 md:mt-0 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => generateICS(event)}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-[#f0ebe1] hover:bg-[#fdfbf7] text-wedding-text rounded-full transition-colors text-sm font-medium shadow-sm"
                      title="Add to Google/Outlook Calendar"
                    >
                      <Download size={16} strokeWidth={1.5} />
                      <span className="md:hidden font-light tracking-wide">Export</span>
                    </button>
                    <button 
                      onClick={() => handleDelete(event.id)}
                      className="p-2.5 text-wedding-muted hover:text-wedding-rose hover:bg-wedding-rose/10 rounded-full transition-colors"
                    >
                      <Trash2 size={18} strokeWidth={1.5} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
