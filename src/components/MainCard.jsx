import React from 'react';
import useAppStore from '../store/useAppStore';
import { Trash2, Plus, Smartphone, CreditCard } from 'lucide-react';
import BusinessItem from './BusinessItem';
import SubCard from './SubCard';

export default function MainCard({ card }) {
    const { updateCardName, addItem, deleteCard, addSubCard } = useAppStore();

    return (
        <div className="nodex-card p-5 relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/50 relative z-10 pl-3">
                <div className="flex items-center gap-3">
                    <span className="text-slate-400">
                        <Smartphone size={20} />
                    </span>
                    <input
                        type="text"
                        value={card.name}
                        onChange={(e) => updateCardName(card.id, false, e.target.value)}
                        className="bg-transparent font-bold text-xl text-slate-900 outline-none w-48 focus:bg-white/60 rounded-xl px-2 placeholder-slate-300 tracking-tight transition-all"
                        placeholder="主卡名称"
                    />
                </div>
                <div className="flex gap-2">
                    <button onClick={() => addItem(card.id, false)} className="w-8 h-8 rounded-full bg-white/60 text-slate-500 hover:bg-primary hover:text-white transition flex items-center justify-center border border-white/50 shadow-sm">
                        <Plus size={14} />
                    </button>
                    <button onClick={() => deleteCard('main', card.id)} className="w-8 h-8 rounded-full bg-white/60 text-slate-500 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center border border-white/50 shadow-sm">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Main Items */}
            <div className="space-y-3 mb-6 relative z-10">
                {card.items.map(item => (
                    <BusinessItem key={item.id} item={item} />
                ))}
            </div>

            {/* Sub Cards Section */}
            <div className="pl-4 border-l-2 border-slate-100 space-y-4 relative z-10 ml-2">
                {card.subCards.map(sub => (
                    <SubCard key={sub.id} sub={sub} mainId={card.id} />
                ))}

                {card.subCards.length < 4 && (
                    <button
                        onClick={() => addSubCard(card.id)}
                        className="mt-4 text-xs font-bold text-slate-500 flex items-center gap-2 hover:text-primary transition py-2.5 px-3 rounded-xl hover:bg-white/55 border border-dashed border-white/60 w-full justify-center backdrop-blur"
                    >
                        <CreditCard size={14} /> 添加副卡 ({card.subCards.length}/4)
                    </button>
                )}
            </div>
        </div>
    )
}
