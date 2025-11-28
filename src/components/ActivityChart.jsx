
const ActivityChart = ({ data }) => {
  if (!data || data.length === 0) return null;

  const height = 100;
  const width = 300;
  const padding = 20;
  
  const maxValue = Math.max(...data.map(d => Math.abs(d.value)), 100);
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
    // Normalize value to fit height, centered at height/2
    const y = (height / 2) - ((d.value / maxValue) * (height / 2 - 10));
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="w-full h-32 mt-4 relative group">
      <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} className="overflow-visible">
        {/* Zero Line */}
        <line x1={padding} y1={height/2} x2={width-padding} y2={height/2} stroke="#e2e8f0" strokeDasharray="4" />
        
        {/* The Graph Line */}
        <polyline 
          points={points} 
          fill="none" 
          stroke="#3b82f6" 
          strokeWidth="3" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="drop-shadow-md"
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * (width - padding * 2) + padding;
          const y = (height / 2) - ((d.value / maxValue) * (height / 2 - 10));
          return (
            <circle 
              key={i} 
              cx={x} 
              cy={y} 
              r="4" 
              className="fill-white stroke-blue-500 stroke-2 hover:r-6 transition-all cursor-pointer"
            >
              <title>{`${d.label}: $${d.value.toFixed(2)}`}</title>
            </circle>
          );
        })}
      </svg>
      
      {/* X-Axis Labels */}
      <div className="flex justify-between px-2 mt-[-20px] text-[10px] text-slate-400 font-medium relative top-6">
        {data.map((d, i) => <span key={i}>{d.label}</span>)}
      </div>
    </div>
  );
};

export default ActivityChart;