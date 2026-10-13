import React from 'react';

const PriorityBadge = ({ priority }) => {
  const styles = {
    'Low': 'bg-slate-100 text-slate-700 border-slate-200',
    'Medium': 'bg-teal-50 text-teal-700 border-teal-200',
    'High': 'bg-orange-100 text-orange-800 border-orange-200',
    'Urgent': 'bg-rose-100 text-rose-800 border-rose-200 animate-pulse',
  };

  const styleClass = styles[priority] || 'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${styleClass}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
