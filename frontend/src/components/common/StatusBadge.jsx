import React from 'react';

const StatusBadge = ({ status }) => {
  const styles = {
    'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
    'In Progress': 'bg-sky-100 text-sky-800 border-sky-200',
    'Resolved': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  };

  const styleClass = styles[status] || 'bg-slate-100 text-slate-800 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styleClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        status === 'Resolved' ? 'bg-emerald-500' : status === 'In Progress' ? 'bg-sky-500' : 'bg-amber-500'
      }`} />
      {status}
    </span>
  );
};

export default StatusBadge;
