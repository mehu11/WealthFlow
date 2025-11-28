import { useMemo } from 'react';

const useFinanceMetrics = (transactions) => {
  return useMemo(() => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
      
    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);

    const balance = income - expense;

    // Generate data for the last 7 days for the chart
    const today = new Date();
    const chartData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - (6 - i));
      const dateStr = d.toLocaleDateString('en-US', { weekday: 'short' });
      
      const dayTotal = transactions
        .filter(t => {
          if (!t.date) return false;
          // Handle both Firestore Timestamp and Date objects
          const tDate = t.date.toDate ? t.date.toDate() : new Date(t.date);
          return tDate.getDate() === d.getDate() && 
                 tDate.getMonth() === d.getMonth();
        })
        .reduce((acc, curr) => {
          return curr.type === 'income' 
            ? acc + parseFloat(curr.amount) 
            : acc - parseFloat(curr.amount);
        }, 0);

      return { label: dateStr, value: dayTotal };
    });

    return { income, expense, balance, chartData };
  }, [transactions]);
};

export default useFinanceMetrics;