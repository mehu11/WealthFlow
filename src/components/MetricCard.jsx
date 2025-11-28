import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, amount, icon: Icon, trend, type }) => {
  const isPositive = type === 'income';
  const colorClass = isPositive 
    ? 'text-emerald-600 bg-emerald-50' 
    : (type === 'expense' ? 'text-rose-600 bg-rose-50' : 'text-blue-600 bg-blue-50');
  
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-xl ${colorClass}`}>
          <Icon size={22} />
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
            {isPositive ? <ArrowUpRight size={12} className="mr-1"/> : <ArrowDownRight size={12} className="mr-1"/>}
            {trend}%
          </span>
        )}
      </div>
      <p className="text-slate-500 text-sm font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-slate-900 mt-1">
        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </h3>
    </div>
  );
};

export default MetricCard;