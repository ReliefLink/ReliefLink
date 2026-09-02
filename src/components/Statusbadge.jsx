import React from 'react';

const statusConfig = {
  pending: { label: 'Pending Match', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  assigned: { label: 'Assigned', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  accepted: { label: 'Accepted', bg: 'bg-indigo-500/10', text: 'text-indigo-400', border: 'border-indigo-500/30' },
  in_progress: { label: 'In Progress', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
  resolved: { label: 'Resolved', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  cancelled: { label: 'Cancelled', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' },
  emergency: { label: 'CRITICAL', bg: 'bg-rose-500/20', text: 'text-rose-400', border: 'border-rose-500/50' },
  important: { label: 'IMPORTANT', bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/50' },
  normal: { label: 'INFO', bg: 'bg-slate-700', text: 'text-slate-300', border: 'border-slate-600' },
};

export default function StatusBadge({ status, customLabel }) {
  const config = statusConfig[status] || { label: status, bg: 'bg-slate-800', text: 'text-slate-300', border: 'border-slate-700' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      {customLabel || config.label}
    </span>
  );
}