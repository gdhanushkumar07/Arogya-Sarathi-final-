
import React from 'react';
import { ConnectivityState } from '../types';
import { Signal, SignalLow, SignalZero } from 'lucide-react';

interface Props {
  state: ConnectivityState;
  onStateChange: (state: ConnectivityState) => void;
}

export const ConnectivitySim: React.FC<Props> = ({ state, onStateChange }) => {
  return (
    <div className="flex items-center space-x-2 bg-slate-800 text-white p-2 rounded-full px-4 shadow-xl fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 mr-2">Net Sim:</span>
      <button 
        onClick={() => onStateChange(ConnectivityState.OFFLINE)}
        className={`p-2 rounded-full transition-all ${state === ConnectivityState.OFFLINE ? 'bg-red-500 shadow-lg scale-110' : 'hover:bg-slate-700'}`}
        title="Offline"
      >
        <SignalZero size={18} />
      </button>
      <button 
        onClick={() => onStateChange(ConnectivityState.LOW_SIGNAL)}
        className={`p-2 rounded-full transition-all ${state === ConnectivityState.LOW_SIGNAL ? 'bg-amber-500 shadow-lg scale-110' : 'hover:bg-slate-700'}`}
        title="2G / Edge"
      >
        <SignalLow size={18} />
      </button>
      <button 
        onClick={() => onStateChange(ConnectivityState.ONLINE)}
        className={`p-2 rounded-full transition-all ${state === ConnectivityState.ONLINE ? 'bg-emerald-500 shadow-lg scale-110' : 'hover:bg-slate-700'}`}
        title="4G / 5G"
      >
        <Signal size={18} />
      </button>
      <div className="ml-2 text-xs font-medium border-l border-slate-700 pl-3 min-w-[80px]">
        {state}
      </div>
    </div>
  );
};
