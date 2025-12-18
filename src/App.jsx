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
    <div
      className="max-w-2xl mx-auto px-3"
      style={{
        paddingTop: 'calc(4rem + env(safe-area-inset-top))',
        paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))'
      }}
    >
      {/* Header */}
      <div className="fixed top-0 left-0 w-full z-40 bg-white/70 backdrop-blur-md border-b border-white/40 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center shadow-lg shadow-green-700/20">
              <Wallet size={16} />
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">当前账单</div>
              <input
                type="month"
                value={currentDate}
                onChange={(e) => setGlobalDate(e.target.value)}
                className="bg-transparent font-extrabold text-sm text-slate-800 outline-none cursor-pointer p-0 border-none focus:ring-0 leading-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRankingOpen(true)}
              className="w-8 h-8 rounded-full bg-amber-50 text-amber-500 hover:bg-amber-100 flex items-center justify-center transition-colors"
            >
              <Trophy size={16} />
            </button>
            <button
              onClick={() => setIsAuthOpen(true)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${user ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                }`}
            >
              <User size={16} />
            </button>
          </div>
        </div>
      </div>

      <Dashboard />

      <div className="mt-4">
        <CardList />
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-white/50 px-4 py-3 pb-6 safe-area-pb shadow-[0_-10px_40px_-30px_rgba(0,0,0,0.1)]">
        <div className="max-w-xl mx-auto flex gap-3">
          <button
            onClick={addMainCard}
            className="flex-1 bg-slate-900 text-white hover:bg-slate-800 py-3 rounded-xl shadow-lg shadow-slate-200/50 font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-xs tracking-wide"
          >
            <PlusCircle size={16} className="text-accent" />
            添加新主卡
          </button>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="w-12 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl flex items-center justify-center hover:bg-slate-100 transition-colors active:scale-95 shadow-sm"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
      <RankingModal isOpen={isRankingOpen} onClose={() => setIsRankingOpen(false)} />
    </div>
  )
}
