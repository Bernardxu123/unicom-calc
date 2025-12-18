import React from 'react';
import useAppStore from '../store/useAppStore';
import { Trash2, Plus, Smartphone, CreditCard } from 'lucide-react';
import BusinessItem from './BusinessItem';
import SubCard from './SubCard';

export default function MainCard({ card }) {
    const { updateCardName, addItem, deleteCard, addSubCard } = useAppStore();

    return (
        <div className="nodex-card p-3 relative overflow-hidden group rounded-2xl bg-white border border-slate-100 shadow-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>

            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100 relative z-10 pl-2">
                <div className="flex items-center gap-2">
                    <span className="text-slate-400">
                        <Smartphone size={16} />
                    </span>
                    <input
                        type="text"
                        value={card.name}
                        onChange={(e) => updateCardName(card.id, false, e.target.value)}
                        className="bg-transparent font-bold text-base text-slate-900 outline-none w-40 focus:bg-slate-50 rounded-lg px-2 py-0.5 placeholder-slate-300 tracking-tight transition-all"
                        placeholder="主卡名称"
                    />
                </div>
                <div className="flex gap-1.5">
                    <button onClick={() => addItem(card.id, false)} className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 hover:bg-primary hover:text-white transition flex items-center justify-center border border-slate-100">
                        <Plus size={12} />
                    </button>
                    <button onClick={() => deleteCard('main', card.id)} className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center border border-slate-100">
                        <Trash2 size={12} />
                    </button>
                </div>
            </div>

            {/* Main Items */}
            <div className="space-y-2 mb-3 relative z-10">
                {card.items.map(item => (
                    <BusinessItem key={item.id} item={item} />
                ))}
            </div>

            {/* Sub Cards Section */}
            <div className="pl-3 border-l-[1.5px] border-slate-100 space-y-3 relative z-10 ml-1.5">
                {card.subCards.map(sub => (
                    <SubCard key={sub.id} sub={sub} mainId={card.id} />
                ))}

                {card.subCards.length < 4 && (
                    <button
                        onClick={() => addSubCard(card.id)}
                        className="mt-2 text-[10px] font-bold text-slate-400 flex items-center gap-1.5 hover:text-primary transition py-2 px-3 rounded-lg hover:bg-slate-50 border border-dashed border-slate-200 w-full justify-center"
                    >
                        <CreditCard size={12} /> 添加副卡 ({card.subCards.length}/4)
                    </button>
                )}
            </div>
        </div>
    )
}
