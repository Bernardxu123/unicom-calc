import React, { useState, useMemo } from 'react';
import useAppStore from '../store/useAppStore';
import { Trash2, Plus, Smartphone, CreditCard, ChevronDown, ChevronUp } from 'lucide-react';
import BusinessItem from './BusinessItem';
import SubCard from './SubCard';
import { AnimatePresence, motion } from 'framer-motion';
import { getMonthDiff } from '../lib/utils';

export default function MainCard({ card, defaultExpanded = false }) {
    const { updateCardName, addItem, deleteCard, addSubCard, currentDate } = useAppStore();
    const [isExpanded, setIsExpanded] = useState(defaultExpanded);

    // Calculate Summary Logic for Preview Mode
    const summary = useMemo(() => {
        let cost = 0;
        let income = 0;
        let count = 0;

        const process = (items) => {
            items.forEach(i => {
                const duration = parseFloat(i.duration) || 0;
                const isExpired = duration > 0 && getMonthDiff(i.startMonth, currentDate) >= duration;
                if (!isExpired) {
                    cost += (parseFloat(i.cost) || 0);
                    income += (parseFloat(i.vipPrice) || 0);
                    count++;
                }
            });
        }

        process(card.items);
        card.subCards.forEach(s => process(s.items));

        const net = cost - income;
        return { net: net.toFixed(2), count };
    }, [card, currentDate]);

    return (
        <div className={`nodex-card relative overflow-hidden group rounded-2xl bg-white border border-slate-100 shadow-sm transition-all duration-300 ${isExpanded ? 'p-3' : 'px-3 py-2'}`}>
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>

            {/* Header / Trigger Area */}
            <div
                className={`flex items-center justify-between relative z-10 pl-2 cursor-pointer ${isExpanded ? 'mb-3 pb-2 border-b border-slate-100' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 flex-1">
                    <span className="text-slate-400">
                        <Smartphone size={16} />
                    </span>

                    {isExpanded ? (
                        <input
                            type="text"
                            value={card.name}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => updateCardName(card.id, false, e.target.value)}
                            className="bg-transparent font-bold text-base text-slate-900 outline-none w-40 focus:bg-slate-50 rounded-lg px-2 py-0.5 placeholder-slate-300 tracking-tight transition-all"
                            placeholder="主卡名称"
                        />
                    ) : (
                        <div className="flex items-center gap-3 w-full">
                            <span className="font-bold text-base text-slate-900 px-2 py-0.5">{card.name}</span>

                            {/* Summary Badge for Preview */}
                            <div className={`text-xs font-bold px-2 py-0.5 rounded-md ${parseFloat(summary.net) <= 0 ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-600'}`}>
                                ¥ {parseFloat(summary.net) <= 0 ? '+' + Math.abs(summary.net) : '-' + summary.net}
                            </div>
                            <div className="text-[10px] text-slate-400 font-medium">
                                {summary.count} 业务
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-1.5 items-center">
                    {/* Collapsed Actions */}
                    <div className="text-slate-300 transition-transform duration-300">
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>

                    {isExpanded && (
                        <div className="flex gap-1.5 ml-2 border-l border-slate-100 pl-2">
                            <button onClick={(e) => { e.stopPropagation(); addItem(card.id, false) }} className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 hover:bg-primary hover:text-white transition flex items-center justify-center border border-slate-100">
                                <Plus size={12} />
                            </button>
                            <button onClick={(e) => { e.stopPropagation(); deleteCard('main', card.id) }} className="w-6 h-6 rounded-full bg-slate-50 text-slate-500 hover:bg-red-50 hover:text-red-500 transition flex items-center justify-center border border-slate-100">
                                <Trash2 size={12} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Expandable Body */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
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
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
