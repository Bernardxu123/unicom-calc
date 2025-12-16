import React from 'react';
import useAppStore from '../store/useAppStore';
import { CornerDownRight, X, Plus } from 'lucide-react';
import BusinessItem from './BusinessItem';

export default function SubCard({ sub, mainId }) {
    const { updateCardName, addItem, deleteCard } = useAppStore();
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    {/* Rotated arrow icon to show hierarchy */}
                    <div className="text-slate-300 transform">
                        <CornerDownRight size={14} />
                    </div>
                    <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => updateCardName(sub.id, true, e.target.value)}
                        className="bg-transparent font-bold text-sm text-slate-700 outline-none w-32 focus:bg-white/60 rounded-lg px-1 placeholder-slate-300 transition-all font-sans"
                        placeholder="副卡名称"
                    />
                </div>
                <div className="flex gap-1">
                    <button onClick={() => addItem(sub.id, true, mainId)} className="text-[10px] bg-white/60 border border-white/50 text-slate-600 px-2 py-1 rounded-lg hover:bg-primary hover:text-white transition font-semibold shadow-sm flex items-center gap-1">
                        <Plus size={10} /> 业务
                    </button>
                    <button onClick={() => deleteCard('sub', mainId, sub.id)} className="text-[10px] text-slate-500 px-2 py-1 hover:text-red-500 transition">
                        <X size={14} />
                    </button>
                </div>
            </div>
            <div className="space-y-2">
                {sub.items.map(item => <BusinessItem key={item.id} item={item} />)}
            </div>
        </div>
    )
}
