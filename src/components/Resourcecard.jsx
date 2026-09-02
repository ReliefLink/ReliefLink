import React from 'react';
import { Package, AlertCircle, Plus, Minus } from 'lucide-react';

export default function ResourceCard({ camp, onUpdateStock, canEdit = false }) {
  const resources = camp.resources || {};
  const isLowStock = Object.values(resources).some((count) => Number(count) < 20);

  return (
    <div className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-5 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <h4 className="font-semibold text-slate-100">{camp.name}</h4>
              <p className="text-xs text-slate-400">{camp.address || 'Central Depot'}</p>
            </div>
          </div>
          {isLowStock && (
            <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle className="h-3.5 w-3.5" /> Low Stock
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 my-3">
          {Object.entries(resources).map(([item, count]) => {
            const countNum = Number(count);
            return (
              <div key={item} className="bg-slate-900/60 border border-slate-800 p-2.5 rounded-lg flex flex-col justify-between">
                <span className="text-[11px] font-medium text-slate-400 capitalize">{item.replace(/([A-Z])/g, ' $1')}</span>
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-sm font-bold ${countNum < 20 ? 'text-rose-400' : 'text-slate-200'}`}>{countNum}</span>
                  {canEdit && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onUpdateStock(camp.id, item, -5)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Deduct 5"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => onUpdateStock(camp.id, item, 10)}
                        className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                        title="Add 10"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-700/40">
        Contact: {camp.contact || 'HQ Logistics Unit'}
      </div>
    </div>
  );
}