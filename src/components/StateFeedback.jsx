import React from 'react';
import { Loader2, AlertTriangle, Inbox } from 'lucide-react';

export const LoadingState = ({ message = 'Loading real-time records...' }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <Loader2 className="h-8 w-8 text-rose-500 animate-spin mb-3" />
    <p className="text-sm text-slate-400">{message}</p>
  </div>
);

export const EmptyState = ({ title = 'No active records', message = 'There are currently no items to display.', icon: Icon = Inbox }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
    <Icon className="h-10 w-10 text-slate-600 mb-3" />
    <h4 className="text-base font-medium text-slate-300">{title}</h4>
    <p className="text-xs text-slate-500 max-w-sm mt-1">{message}</p>
  </div>
);

export const ErrorState = ({ title = 'Data Sync Error', message = 'Could not communicate with the mesh server.', onRetry }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center border border-rose-900/30 rounded-xl bg-rose-950/10">
    <AlertTriangle className="h-10 w-10 text-rose-500 mb-3" />
    <h4 className="text-base font-medium text-rose-300">{title}</h4>
    <p className="text-xs text-rose-400/80 max-w-sm mt-1 mb-4">{message}</p>
    {onRetry && (
      <button onClick={onRetry} className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-medium transition">
        Retry
      </button>
    )}
  </div>
);