import React from 'react';
import useAppStore from '../store/useAppStore';
import { CornerDownRight, X, Plus } from 'lucide-react';
import BusinessItem from './BusinessItem';

export default function SubCard({ sub, mainId }) {
    const { updateCardName, addItem, deleteCard } = useAppStore();
    return (
        <div>
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                    {/* Rotated arrow icon to show hierarchy */}
                    <div className="text-slate-300 transform">
                        <CornerDownRight size={12} />
                    </div>
                    <input
                        type="text"
                        value={sub.name}
                        onChange={(e) => updateCardName(sub.id, true, e.target.value)}
                        className="bg-transparent font-bold text-xs text-slate-600 outline-none w-28 focus:bg-slate-50 rounded px-1 placeholder-slate-300 transition-all font-sans"
                        placeholder="副卡名称"
                    />
                </div>
                <div className="flex gap-1">
                    <button onClick={() => addItem(sub.id, true, mainId)} className="text-[10px] bg-slate-50 border border-slate-100 text-slate-500 px-1.5 py-0.5 rounded hover:bg-primary hover:text-white transition font-semibold flex items-center gap-0.5">
                        <Plus size={10} /> 业务
                    </button>
                    <button onClick={() => deleteCard('sub', mainId, sub.id)} className="text-[10px] text-slate-400 px-1.5 hover:text-red-500 transition">
                        <X size={12} />
                    </button>
                </div>
            </div>
            <div className="space-y-1.5">
                {sub.items.map(item => <BusinessItem key={item.id} item={item} />)}
            </div>
        </div>
    )
}
