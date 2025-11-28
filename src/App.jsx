import React, { 
  useState, 
  useEffect, 
  useReducer
} from 'react';
import { 
  Wallet, TrendingUp, TrendingDown, Plus, 
  DollarSign, Activity, PieChart, Loader2,
  ArrowUpRight
} from 'lucide-react';

// --- 1. IMPORT CONTEXT ---
import { 
  FinanceContext, 
  financeReducer, 
  initialState 
} from './context/FinanceContext';

// --- 2. IMPORT CUSTOM HOOK ---
import useFinanceMetrics from './hooks/useFinanceMetrics';

// --- 3. IMPORT SUB-COMPONENTS ---
import ActivityChart from './components/ActivityChart';
import MetricCard from './components/MetricCard';
import TransactionItem from './components/TransactionItem';
// Note: We import the default export from AddModal.jsx
import AddTransactionModal from './components/AddModal'; 

// --- 4. IMPORT FIREBASE CONFIG & SERVICES ---
import { auth, db } from './config/firebase'; 
import { 
  signInAnonymously, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  doc, 
  onSnapshot, 
  serverTimestamp, 
  query 
} from 'firebase/firestore';

// ------------------------------------------------------------------
// MAIN APP COMPONENT
// ------------------------------------------------------------------

export default function App() {
  // Initialize State using the imported Reducer and Initial State
  const [state, dispatch] = useReducer(financeReducer, initialState);
  
  // Local UI State
  const [isModalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setSubmitting] = useState(false);
  
  // Calculate Metrics using the Custom Hook
  const metrics = useFinanceMetrics(state.transactions);

  // --- EFFECT: Handle Authentication ---
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Auth Error:", err));
    
    // Listen for auth changes to set the user in global state
    return onAuthStateChanged(auth, (user) => {
      dispatch({ type: 'SET_USER', payload: user });
    });
  }, []);

  // --- EFFECT: Handle Real-time Data ---
  useEffect(() => {
    if (!state.user) return;

    // Listen to the specific user's 'transactions' collection
    const q = query(collection(db, 'users', state.user.uid, 'transactions'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      // Sort by date (descending)
      data.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
      dispatch({ type: 'SET_TRANSACTIONS', payload: data });
    });

    return () => unsubscribe();
  }, [state.user]);

  // --- ACTIONS ---

  const handleAddTransaction = async (data) => {
    if (!state.user) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'users', state.user.uid, 'transactions'), {
        ...data,
        date: serverTimestamp()
      });
      setModalOpen(false);
    } catch (err) {
      console.error(err);
      dispatch({ type: 'SET_ERROR', payload: "Failed to add transaction" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!state.user || !window.confirm("Delete this transaction?")) return;
    try {
      await deleteDoc(doc(db, 'users', state.user.uid, 'transactions', id));
    } catch (err) {
      console.error(err);
    }
  };

  // Filter logic for the list view
  const filteredTransactions = state.transactions.filter(t => 
    state.filter === 'all' ? true : t.type === state.filter
  );

  // --- RENDER ---

  if (state.loading && !state.user) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <FinanceContext.Provider value={{ state, dispatch }}>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
        
        {/* Navbar */}
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-slate-900 text-white p-2 rounded-lg"><Wallet size={20} /></div>
              <span className="font-bold text-xl tracking-tight">WealthFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-slate-500 hidden sm:block">
                {state.user?.uid ? `ID: ${state.user.uid.slice(0,8)}...` : 'Guest'}
              </span>
              <button 
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-200 transition-all flex items-center gap-2 active:scale-95"
              >
                <Plus size={16} /> <span className="hidden sm:inline">New Entry</span>
              </button>
            </div>
          </div>
        </nav>

        {/* Dashboard Content */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          
          {/* Header & Filter Buttons */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Overview</h1>
              <p className="text-slate-500 mt-1">Track your financial health in real-time</p>
            </div>
            <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
              {['all', 'income', 'expense'].map(f => (
                <button 
                  key={f} 
                  onClick={() => dispatch({ type: 'SET_FILTER', payload: f })} 
                  className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${state.filter === f ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard title="Total Balance" amount={metrics.balance} icon={DollarSign} type="balance" />
            <MetricCard title="Total Income" amount={metrics.income} icon={TrendingUp} type="income" />
            <MetricCard title="Total Expenses" amount={metrics.expense} icon={TrendingDown} type="expense" />
          </div>

          {/* Charts & Transactions Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" /> Activity Analysis
                  </h3>
                  <span className="text-xs font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded">Last 7 Days</span>
                </div>
                <ActivityChart data={metrics.chartData} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-lg text-slate-800">Recent Transactions</h3>
                  <div className="text-sm text-slate-500 font-medium">{filteredTransactions.length} entries</div>
                </div>
                <div className="divide-y divide-slate-50 max-h-[400px] overflow-y-auto">
                  {filteredTransactions.length === 0 ? (
                    <div className="p-12 text-center text-slate-400"><p>No transactions found</p></div>
                  ) : (
                    filteredTransactions.map(t => (
                      <TransactionItem key={t.id} t={t} onDelete={handleDelete} />
                    ))
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column (Stats) */}
            <div className="space-y-6">
              <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200">
                <div className="flex items-start justify-between mb-8">
                  <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm"><PieChart size={24} /></div>
                  <span className="bg-white/20 px-2 py-1 rounded text-xs font-medium backdrop-blur-sm">+12%</span>
                </div>
                <h4 className="text-indigo-100 font-medium mb-1">Savings Rate</h4>
                <p className="text-3xl font-bold">
                  {metrics.income > 0 ? Math.round(((metrics.income - metrics.expense) / metrics.income) * 100) : 0}%
                </p>
                <div className="mt-4 h-1.5 bg-indigo-900/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white/80 rounded-full" 
                    style={{ width: `${metrics.income > 0 ? Math.min(100, Math.max(0, ((metrics.income - metrics.expense) / metrics.income) * 100)) : 0}%` }} 
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Quick Categories</h3>
                <div className="space-y-3">
                  {['Food', 'Transport', 'Bills'].map(cat => (
                    <div key={cat} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer">
                      <span className="font-medium text-slate-600">{cat}</span>
                      <ArrowUpRight size={14} className="text-slate-400" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>

        <AddTransactionModal 
          isOpen={isModalOpen} 
          onClose={() => setModalOpen(false)} 
          onSubmit={handleAddTransaction} 
          isSubmitting={isSubmitting} 
        />
      </div>
    </FinanceContext.Provider>
  );
}