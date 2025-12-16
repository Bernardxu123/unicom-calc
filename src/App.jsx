import React, { useState } from 'react';
import useAppStore from './store/useAppStore';
import { Wallet, Settings, PlusCircle, User, Trophy } from 'lucide-react';
import Dashboard from './components/Dashboard';
import CardList from './components/CardList';
import SettingsModal from './components/SettingsModal';
import AuthModal from './components/AuthModal';
import RankingModal from './components/RankingModal';

export default function App() {
  const { currentDate, setGlobalDate, addMainCard, user } = useAppStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isRankingOpen, setIsRankingOpen] = useState(false);

  return (
    <div className="max-w-2xl mx-auto pt-24 px-4 pb-32">
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/55 backdrop-blur-xl border-b border-white/30 shadow-[0_8px_30px_-20px_rgba(2,6,23,0.45)]">
        <div className="max-w-2xl mx-auto px-5 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center shadow-lg shadow-green-700/20">
              <Wallet size={20} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">当前账单</div>
              <input
                type="month"
                value={currentDate}
                onChange={(e) => setGlobalDate(e.target.value)}
                className="bg-transparent font-extrabold text-base text-slate-800 outline-none cursor-pointer p-0 border-none focus:ring-0"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRankingOpen(true)}
              className="w-10 h-10 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <Trophy size={20} />
            </button>
            <button
              onClick={() => setIsAuthOpen(true)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${user ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
            >
              <User size={20} />
            </button>
          </div>
        </div>
      </div>

      <Dashboard />

      <div className="mt-8">
        <CardList />
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/70 backdrop-blur-xl border-t border-white/40 px-5 py-4 pb-6 safe-area-pb shadow-[0_-18px_50px_-38px_rgba(2,6,23,0.55)]">
        <div className="max-w-2xl mx-auto flex gap-3">
          <button
            onClick={addMainCard}
            className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-3.5 rounded-2xl shadow-lg shadow-slate-200/50 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm tracking-wide"
          >
            <PlusCircle size={18} className="text-accent" />
            添加新主卡
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-14 bg-slate-100 text-slate-600 border border-slate-200 rounded-2xl flex items-center justify-center hover:bg-slate-200 transition-colors active:scale-95 shadow-sm"
          >
            <Settings size={20} />
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
    </div>
  )
}
