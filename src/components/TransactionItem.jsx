import { ArrowUpRight, ArrowDownRight, Trash2 } from 'lucide-react';

const TransactionItem = ({ t, onDelete }) => {
  const isIncome = t.type === 'income';
  
  return (
    <div className="group flex items-center justify-between p-4 hover:bg-slate-50 rounded-xl transition-colors border-b border-slate-50 last:border-0">
      <div className="flex items-center gap-4">
        <div className={`p-2.5 rounded-full ${isIncome ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
          {isIncome ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
        </div>
        <div>
          <p className="font-semibold text-slate-800">{t.description}</p>
          <p className="text-xs text-slate-400 font-medium">
            {t.date ? t.date.toDate().toLocaleDateString() : 'Today'} • {t.category}
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <span className={`font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
          {isIncome ? '+' : '-'}${Math.abs(t.amount).toFixed(2)}
        </span>
        <button 
          onClick={() => onDelete(t.id)}
          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

export default TransactionItem;