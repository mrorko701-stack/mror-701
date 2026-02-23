/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Car, ShieldCheck, Loader2, Lock, LogOut, User, FileUp, FileText, Table, Phone, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';
import { motion, AnimatePresence } from 'motion/react';

interface PlateResult {
  plate_number: string;
  center_name: string;
  production_date: string;
  status: 'issued' | 'pending';
}

export default function App() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PlateResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showUserAuth, setShowUserAuth] = useState(false);
  const [adminUser, setAdminUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const savedAdmin = localStorage.getItem('adminUser');
    if (savedAdmin) {
      const user = JSON.parse(savedAdmin);
      setAdminUser(user);
      setIsAdmin(true);
    }
    
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    setAdminUser(null);
    setIsAdmin(false);
  };

  const handleUserLogout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Optional: Search as you type with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        handleSearch();
      } else {
        setResults([]);
        setSearched(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="min-h-screen text-slate-900 font-sans" dir="rtl">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-xl border-b border-blue-100 py-4 px-4 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-black tracking-tight text-blue-900">الإدارة العامة للمرور</h1>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">نظام الاستعلام الذكي</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!isAdmin && !currentUser && (
              <button 
                onClick={() => setShowLogin(true)}
                className="text-xs font-bold text-blue-400 hover:text-blue-600 transition-colors px-3 py-2"
              >
                دخول الإدارة
              </button>
            )}
            
            {isAdmin ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-blue-900 text-white px-4 py-2 rounded-2xl shadow-lg shadow-blue-900/20">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">المدير: {adminUser?.username}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-xs font-bold"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-blue-50/50 px-4 py-2 rounded-2xl border border-blue-100">
                  <User className="w-4 h-4 text-blue-700" />
                  <span className="text-xs font-bold text-blue-900">{currentUser.full_name}</span>
                </div>
                <button 
                  onClick={handleUserLogout}
                  className="flex items-center gap-2 px-3 py-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-all text-xs font-bold"
                  title="تسجيل الخروج"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">خروج</span>
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowUserAuth(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-700 text-white text-xs font-bold rounded-xl hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20"
              >
                <UserPlus className="w-4 h-4" />
                دخول المستخدمين
              </button>
            )}

            <div className="text-[10px] text-slate-300 font-mono uppercase tracking-[0.2em] hidden lg:block border-l border-slate-200 pr-4 mr-4">
              Traffic Registry v2.1
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-20">
        {/* Hero Section */}
        <section className="text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-5 py-2 mb-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-black tracking-[0.2em] uppercase"
          >
            بوابة الخدمات الإلكترونية الموحدة
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl font-black mb-8 tracking-tighter text-blue-950 leading-[1.1]"
          >
            استعلم عن لوحتك <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-sky-500">بكل دقة وأمان</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-slate-600 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed font-medium"
          >
            الادارة العامة للمرور - دائرة مرور ولاية الخرطوم <br/>
            نظام متطور يهدف لتسهيل الوصول للمعلومات ومواكبة التحول الرقمي في خدمات المرور
          </motion.p>
        </section>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-20 px-4 sm:px-0">
          <motion.div 
            className="relative group"
            initial={false}
            animate={{ 
              scale: 1,
              boxShadow: loading ? "0 0 20px rgba(30, 64, 175, 0.1)" : "0 0 0px rgba(30, 64, 175, 0)"
            }}
            whileFocus={{ 
              scale: 1.01,
              boxShadow: "0 0 30px rgba(30, 64, 175, 0.15)"
            }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <div className="absolute inset-y-0 right-0 pr-5 sm:pr-6 flex items-center pointer-events-none">
              <motion.div
                animate={{ 
                  scale: query ? 1.1 : 1,
                  rotate: query ? 10 : 0,
                  color: loading ? "#1d4ed8" : "#94a3b8"
                }}
              >
                <Search className="h-5 w-5 transition-colors group-focus-within:text-blue-600" />
              </motion.div>
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="أدخل رقم اللوحة (مثال: خ3/1239)"
              className={`block w-full pr-12 sm:pr-14 pl-6 py-5 sm:py-7 bg-white/90 border rounded-2xl sm:rounded-[2.5rem] shadow-2xl shadow-blue-200/40 focus:ring-12 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-lg sm:text-2xl outline-none placeholder:text-slate-300 font-medium ${loading ? 'border-blue-400 animate-pulse' : 'border-blue-100'}`}
            />
            {loading && (
              <div className="absolute inset-y-0 left-0 pl-5 sm:pl-6 flex items-center">
                <Loader2 className="h-5 w-5 sm:h-7 sm:w-7 text-blue-700 animate-spin" />
              </div>
            )}
          </motion.div>
          
          <div className="mt-8 flex flex-wrap gap-2 sm:gap-3 justify-center">
            {[
              { name: 'ترخيص شرق النيل', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { name: 'ترخيص المقرن', color: 'bg-sky-50 text-sky-700 border-sky-100' },
              { name: 'ترخيص امبده', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { name: 'ترخيص العلاقات البينية', color: 'bg-sky-50 text-sky-700 border-sky-100' },
              { name: 'ترخيص الكرامة', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { name: 'ترخيص مجمع خدمات الجمهور ام درمان', color: 'bg-sky-50 text-sky-700 border-sky-100' },
              { name: 'ترخيص جبره', color: 'bg-blue-50 text-blue-700 border-blue-100' },
              { name: 'ترخيص ابو ادم', color: 'bg-sky-50 text-sky-700 border-sky-100' }
            ].map((center, idx) => (
              <motion.span 
                key={center.name} 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + idx * 0.05 }}
                className={`text-[9px] sm:text-[10px] font-black tracking-wider px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default ${center.color}`}
              >
                {center.name}
              </motion.span>
            ))}
          </div>
        </div>

        {/* Results */}
        <div className="space-y-6 mb-24">
          <AnimatePresence mode="wait">
            {results.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid gap-6"
              >
                <div className="flex items-center justify-between mb-2 px-4">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">نتائج البحث ({results.length})</h3>
                </div>
                {results.map((plate, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/80 backdrop-blur-md p-8 rounded-[2rem] border border-blue-50 shadow-sm hover:shadow-2xl hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-6 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex items-center gap-6">
                      <div className="bg-blue-50 p-5 rounded-2xl group-hover:bg-blue-100 transition-colors">
                        <Car className="w-8 h-8 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-3xl font-black tracking-tighter text-blue-950 mb-2">
                          {plate.plate_number}
                        </div>
                        <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 font-medium">
                          <span className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-blue-500" />
                            {plate.center_name}
                          </span>
                          <span className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            {plate.production_date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {plate.status === 'issued' ? (
                        <span className="px-5 py-2 bg-emerald-50 text-emerald-700 text-[10px] font-black rounded-full border border-emerald-100 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                          <ShieldCheck className="w-4 h-4" />
                          تهانينا تم الاصدار
                        </span>
                      ) : (
                        <span className="px-5 py-2 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full border border-amber-100 uppercase tracking-widest flex items-center gap-2 shadow-sm">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          عزراً قيد الاصدار
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : searched && !loading ? (
              <motion.div 
                key="no-results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100"
              >
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-2xl font-black text-blue-950 mb-3">لا توجد سجلات</h3>
                <p className="text-slate-500 max-w-md mx-auto">لم نتمكن من العثور على أي لوحة بهذا الرقم في سجلات ولاية الخرطوم حالياً.</p>
              </motion.div>
            ) : !searched && (
              <motion.div 
                key="empty"
                className="grid grid-cols-1 sm:grid-cols-2 gap-8"
              >
                <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-blue-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-8">
                    <ShieldCheck className="w-7 h-7 text-blue-700" />
                  </div>
                  <h4 className="text-xl font-black mb-3 text-blue-950">بيانات رسمية</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">نظامنا متصل مباشرة بقواعد بيانات الإنتاج لضمان حصولك على أدق المعلومات الرسمية.</p>
                </div>
                <div className="bg-white/60 backdrop-blur-md p-10 rounded-[2.5rem] border border-blue-50 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-14 h-14 bg-sky-50 rounded-2xl flex items-center justify-center mb-8">
                    <MapPin className="w-7 h-7 text-sky-600" />
                  </div>
                  <h4 className="text-xl font-black mb-3 text-blue-950">تغطية الولاية</h4>
                  <p className="text-slate-600 leading-relaxed font-medium">نغطي كافة مراكز الترخيص الرئيسية في ولاية الخرطوم لتوفير خدمة استعلام شاملة.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Add New Plate Section - Protected */}
        {isAdmin ? (
          <section className="bg-blue-950 rounded-[3rem] p-10 overflow-hidden relative shadow-2xl shadow-blue-900/40">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600 rounded-full -mr-32 -mt-32 opacity-20 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-600 rounded-full -ml-32 -mb-32 opacity-20 blur-3xl" />
            
            <div className="relative">
              <div className="flex items-center gap-4 mb-10">
                <div className="bg-blue-700 p-3 rounded-2xl shadow-lg shadow-blue-500/20">
                  <Car className="text-white w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">إدارة السجلات</h3>
                  <p className="text-blue-300 text-sm">إضافة لوحة جديدة أو رفع ملفات (Excel/Word)</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-12">
                <AddPlateForm />
                
                <div className="border-t border-blue-900 pt-10">
                  <h4 className="text-white font-bold mb-6 flex items-center gap-2">
                    <FileUp className="w-5 h-5 text-sky-400" />
                    رفع بيانات جماعي (Excel / Word / Flash Drive)
                  </h4>
                  <BulkUpload />
                </div>
              </div>
            </div>
          </section>
        ) : (
          <div className="text-center py-12 border-t border-blue-50">
            <button 
              onClick={() => setShowLogin(true)}
              className="text-slate-400 hover:text-blue-700 text-sm font-bold flex items-center gap-2 mx-auto transition-colors"
            >
              <Lock className="w-4 h-4" />
              منطقة الإدارة (للمصرح لهم فقط)
            </button>
          </div>
        )}
      </main>

      {/* User Auth Modal */}
      <AnimatePresence>
        {showUserAuth && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-xl">
                      <UserPlus className="text-white w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-blue-950">دخول / تسجيل مستخدم</h3>
                  </div>
                  <button onClick={() => setShowUserAuth(false)} className="text-slate-400 hover:text-slate-600">
                    <Search className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <UserAuthFlow 
                  onSuccess={(user) => {
                    setCurrentUser(user);
                    setShowUserAuth(false);
                    localStorage.setItem('currentUser', JSON.stringify(user));
                  }} 
                  onCancel={() => setShowUserAuth(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden relative"
            >
              <div className="p-10">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-3">
                    <div className="bg-blue-700 p-2 rounded-xl">
                      <Lock className="text-white w-5 h-5" />
                    </div>
                    <h3 className="text-xl font-black text-blue-950">تسجيل دخول المدير</h3>
                  </div>
                  <button onClick={() => setShowLogin(false)} className="text-slate-400 hover:text-slate-600">
                    <Search className="w-6 h-6 rotate-45" />
                  </button>
                </div>

                <LoginForm 
                  onSuccess={(user) => {
                    setAdminUser(user);
                    setIsAdmin(true);
                    setShowLogin(false);
                    localStorage.setItem('adminUser', JSON.stringify(user));
                  }} 
                  onCancel={() => setShowLogin(false)}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Sponsorship Section */}
      <section className="max-w-4xl mx-auto px-4 py-12 text-center border-t border-blue-50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6"
        >
          <h3 className="text-xl font-black text-blue-900">
            برعاية السيد الفريق شرطة حقوقي د / سراج منصور
          </h3>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            مدير شرطة ولاية الخرطوم
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-4 py-16 border-t border-slate-200 mt-16">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center border border-blue-100">
              <ShieldCheck className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <div className="text-sm font-black text-blue-950">الإدارة العامة للمرور</div>
              <div className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">ولاية الخرطوم</div>
            </div>
          </div>
          <div className="flex gap-8 items-center">
            <a href="#" className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">الخصوصية</a>
            <a href="#" className="text-xs font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest transition-colors">الدعم الفني</a>
            
            {/* Hidden Admin Access */}
            <div className="border-r border-slate-200 h-4 mx-2" />
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-400">المدير: {adminUser?.username}</span>
                <button 
                  onClick={handleLogout}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                  title="خروج المدير"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : currentUser ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400">المستخدم: {currentUser.full_name}</span>
                <button 
                  onClick={handleUserLogout}
                  className="text-slate-300 hover:text-rose-500 transition-colors"
                  title="خروج المستخدم"
                >
                  <LogOut className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowLogin(true)}
                className="text-slate-200 hover:text-slate-400 transition-colors"
                title="دخول المدير"
              >
                <Lock className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}

function LoginForm({ onSuccess, onCancel }: { onSuccess: (user: any) => void, onCancel: () => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();

      if (res.ok) {
        onSuccess(data.user);
      } else {
        setError(data.error || 'خطأ في تسجيل الدخول');
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">اسم المستخدم</label>
        <input
          type="text"
          required
          value={username}
          onChange={e => setUsername(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">كلمة المرور</label>
        <input
          type="password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
        />
      </div>
      {error && (
        <div className="text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl text-center">
          {error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-700 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

function BulkUpload() {
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

  useEffect(() => {
    fetch('/api/centers')
      .then(res => res.json())
      .then(setCenters);
  }, []);

  const processExcel = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet) as any[];
        
        if (json.length === 0) {
          setStatus({ type: 'error', message: 'ملف Excel فارغ' });
          return;
        }

        // Map Excel columns to our format with flexible naming
        const plates = json.map(row => {
          // Find plate number (check common variations)
          const plate_number = row.plate_number || row['رقم اللوحة'] || row['اللوحة'] || row.plate || Object.values(row)[0];
          
          // Find center name (check common variations)
          const center_name = row.center_name || row['اسم المركز'] || row['المركز'] || row.center;
          const center = centers.find(c => c.name === center_name);
          
          // Find date (check common variations)
          const production_date = row.production_date || row['تاريخ الإنتاج'] || row['التاريخ'] || row.date;

          return {
            plate_number: plate_number?.toString().trim(),
            center_id: center?.id || centers[0].id,
            production_date: production_date || new Date().toISOString().split('T')[0]
          };
        }).filter(p => p.plate_number && p.plate_number !== 'undefined');

        if (plates.length === 0) {
          setStatus({ type: 'error', message: 'لم يتم العثور على أرقام لوحات صالحة في الملف' });
          return;
        }

        await uploadPlates(plates);
      } catch (err) {
        setStatus({ type: 'error', message: 'خطأ في معالجة ملف Excel' });
      }
    };
    reader.readAsBinaryString(file);
  };

  const processWord = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
        const text = result.value;
        
        // Simple parser: each line is a plate number
        // For more complex Word docs, we'd need better logic
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const plates = lines.map(line => ({
          plate_number: line,
          center_id: centers[0].id, // Default to first center
          production_date: new Date().toISOString().split('T')[0]
        }));

        await uploadPlates(plates);
      } catch (err) {
        setStatus({ type: 'error', message: 'خطأ في معالجة ملف Word' });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const uploadPlates = async (plates: any[]) => {
    setLoading(true);
    try {
      const res = await fetch('/api/plates/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plates })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: 'success', message: `تم رفع ${data.count} سجل بنجاح!` });
      } else {
        setStatus({ type: 'error', message: data.error });
      }
    } catch (err) {
      setStatus({ type: 'error', message: 'فشل الاتصال بالخادم' });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      processExcel(file);
    } else if (ext === 'docx' || ext === 'doc') {
      processWord(file);
    } else {
      setStatus({ type: 'error', message: 'نوع الملف غير مدعوم. يرجى اختيار ملف Excel أو Word' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="relative flex flex-col items-center justify-center p-8 border-2 border-dashed border-blue-200 rounded-[2rem] hover:border-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer group">
          <input type="file" className="hidden" onChange={handleFileChange} accept=".xlsx,.xls,.docx,.doc" />
          <Table className="w-10 h-10 text-blue-300 group-hover:text-blue-600 mb-4" />
          <span className="text-blue-900 font-bold text-sm">اختر ملف Excel أو Word</span>
          <span className="text-blue-400 text-xs mt-2">أو اسحب الملف من الفلاش ديسك هنا</span>
        </label>
        
        <div className="bg-blue-50/30 p-6 rounded-[2rem] border border-blue-100">
          <h5 className="text-blue-700 text-xs font-black uppercase tracking-widest mb-4">تعليمات الرفع</h5>
          <ul className="text-blue-600 text-xs space-y-3 list-disc pr-4">
            <li>ملف Excel: يفضل أن يحتوي على أعمدة (رقم اللوحة، اسم المركز، تاريخ الإنتاج).</li>
            <li>ملف Word: سيتم اعتبار كل سطر في الملف كرقم لوحة جديد.</li>
            <li>ملاحظة: إذا لم يتوفر اسم المركز، سيتم اختيار المركز الأول تلقائياً.</li>
          </ul>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center gap-3 text-blue-600 font-bold py-4">
          <Loader2 className="w-5 h-5 animate-spin" />
          جاري معالجة البيانات ورفعها...
        </div>
      )}

      {status.type && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-2xl text-center font-bold text-sm ${
            status.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
          }`}
        >
          {status.message}
        </motion.div>
      )}
    </div>
  );
}

function UserAuthFlow({ onSuccess, onCancel }: { onSuccess: (user: any) => void, onCancel: () => void }) {
  const [step, setStep] = useState<'login' | 'register' | 'verify'>('login');
  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, phone })
      });
      const data = await res.json();
      if (res.ok) {
        setMockOtp(data.mock_otp);
        setStep('verify');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone })
      });
      const data = await res.json();
      if (res.ok) {
        onSuccess(data.user);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('فشل الاتصال بالخادم');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {step === 'login' && (
        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="tel"
                required
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
              />
            </div>
          </div>
          {error && <div className="text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl text-center">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-700 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'دخول'}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
              إلغاء
            </button>
          </div>
          <div className="text-center">
            <button type="button" onClick={() => setStep('register')} className="text-blue-700 text-sm font-bold">ليس لديك حساب؟ سجل الآن</button>
          </div>
        </form>
      )}

      {step === 'register' && (
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">الاسم الثلاثي</label>
            <div className="relative">
              <User className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="text"
                required
                placeholder="الاسم الأول الثاني الثالث"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">رقم الهاتف</label>
            <div className="relative">
              <Phone className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <input
                type="tel"
                required
                placeholder="09XXXXXXXX"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full pr-12 pl-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>
          {error && <div className="text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl text-center">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-700 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'إرسال رمز التفعيل'}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
              إلغاء
            </button>
          </div>
          <div className="text-center">
            <button type="button" onClick={() => setStep('login')} className="text-blue-700 text-sm font-bold">لديك حساب بالفعل؟ سجل دخول</button>
          </div>
        </form>
      )}

      {step === 'verify' && (
        <form onSubmit={handleVerify} className="space-y-6">
          <div className="text-center mb-4">
            <p className="text-slate-500 text-sm">تم إرسال رمز التفعيل إلى {phone}</p>
            <p className="text-blue-600 text-xs font-bold mt-2">محاكاة: الرمز هو {mockOtp}</p>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest">رمز التفعيل</label>
            <input
              type="text"
              required
              placeholder="XXXXXX"
              value={otp}
              onChange={e => setOtp(e.target.value)}
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all text-center tracking-[1em] font-black text-xl"
            />
          </div>
          {error && <div className="text-rose-600 text-sm font-bold bg-rose-50 p-3 rounded-xl text-center">{error}</div>}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" disabled={loading} className="flex-1 bg-blue-700 text-white py-4 rounded-2xl font-black hover:bg-blue-800 transition-all shadow-lg shadow-blue-700/20 disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تفعيل الحساب'}
            </button>
            <button type="button" onClick={onCancel} className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-all">
              إلغاء
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

function AddPlateForm() {
  const [centers, setCenters] = useState<{ id: number; name: string }[]>([]);
  const [formData, setFormData] = useState({
    plate_number: '',
    center_id: '',
    production_date: new Date().toISOString().split('T')[0]
  });
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/centers')
      .then(res => res.json())
      .then(setCenters);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/plates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setStatus({ type: 'success', message: 'تمت إضافة اللوحة بنجاح!' });
        setFormData({ ...formData, plate_number: '' });
      } else {
        setStatus({ type: 'error', message: data.error || 'حدث خطأ ما' });
      }
    } catch (error) {
      setStatus({ type: 'error', message: 'فشل الاتصال بالخادم' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">رقم اللوحة</label>
        <input
          type="text"
          required
          value={formData.plate_number}
          onChange={e => setFormData({ ...formData, plate_number: e.target.value })}
          placeholder="مثال: خ3/1239"
          className="w-full p-4 bg-blue-900 border border-blue-800 text-white rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all placeholder:text-blue-300/50"
        />
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">مركز الترخيص</label>
        <select
          required
          value={formData.center_id}
          onChange={e => setFormData({ ...formData, center_id: e.target.value })}
          className="w-full p-4 bg-blue-900 border border-blue-800 text-white rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all appearance-none"
        >
          <option value="" className="bg-blue-950">اختر المركز...</option>
          {centers.map(center => (
            <option key={center.id} value={center.id} className="bg-blue-950">{center.name}</option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-black text-slate-400 uppercase tracking-widest">تاريخ الإنتاج</label>
        <input
          type="date"
          required
          value={formData.production_date}
          onChange={e => setFormData({ ...formData, production_date: e.target.value })}
          className="w-full p-4 bg-blue-900 border border-blue-800 text-white rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
        />
      </div>

      <div className="md:col-span-3 flex flex-col sm:flex-row items-center justify-between gap-6 mt-6 border-t border-blue-900 pt-8">
        <button
          type="submit"
          disabled={submitting}
          className="w-full sm:w-auto bg-blue-700 text-white px-10 py-4 rounded-2xl font-black hover:bg-blue-600 shadow-lg shadow-blue-700/20 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
        >
          {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (
            <>
              <ShieldCheck className="w-5 h-5" />
              حفظ السجل
            </>
          )}
        </button>

        {status.type && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`text-sm font-black px-4 py-2 rounded-lg ${status.type === 'success' ? 'bg-blue-500/10 text-blue-400' : 'bg-rose-500/10 text-rose-400'}`}
          >
            {status.message}
          </motion.div>
        )}
      </div>
    </form>
  );
}
