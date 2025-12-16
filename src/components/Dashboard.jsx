import React, { useMemo, useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { getMonthDiff, funnyQuotes } from '../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
    const { cards, currentDate } = useAppStore();

    const { totalCost, totalIncome, net } = useMemo(() => {
        let cost = 0;
        let income = 0;

        const isExpired = (item) => {
            if (item.duration === -1) return false;
            return getMonthDiff(item.startMonth, currentDate) >= item.duration;
        };

        cards.forEach(c => {
            c.items.forEach(i => {
                if (!isExpired(i)) {
                    cost += (i.cost || 0);
                    income += (i.vipPrice || 0);
                }
            });
            c.subCards.forEach(s => {
                s.items.forEach(i => {
                    if (!isExpired(i)) {
                        cost += (i.cost || 0);
                        income += (i.vipPrice || 0);
                    }
                });
            });
        });

        return { totalCost: cost, totalIncome: income, net: cost - income };
    }, [cards, currentDate]);

    const isProfit = net <= 0;
    const absNet = Math.abs(net).toFixed(2);

    // Quotes Logic
    const [quote, setQuote] = useState("");

    // Initial Quote
    useEffect(() => {
        setQuote(funnyQuotes[isProfit ? 'win' : 'loss'][0]);
    }, []);

    // Update quote when profit/net significantly changes or just on mode switch
    useEffect(() => {
        const mode = isProfit ? 'win' : 'loss';
        const pool = funnyQuotes[mode];
        const random = pool[Math.floor(Math.random() * pool.length)];
        setQuote(random);
    }, [isProfit]);

    return (
        <div className={`hero-card rounded-[2rem] p-8 mb-8 relative overflow-hidden transition-all duration-500 ${isProfit ? 'bg-profit' : 'bg-loss'}`}>
            {/* Decoration Svg */}
            <div className="absolute right-0 bottom-0 w-64 h-64 opacity-10 pointer-events-none">
                <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M44.7,-76.4C58.9,-69.2,71.8,-59.1,81.6,-46.6C91.4,-34.1,98.1,-19.2,95.8,-5.3C93.5,8.6,82.2,21.5,70.6,32.3C59,43.1,47.1,51.8,34.8,59.3C22.5,66.8,9.8,73.1,-2.3,77.1C-14.4,81.1,-25.9,82.8,-36.7,78.5C-47.5,74.2,-57.6,63.9,-66.6,52.4C-75.6,40.9,-83.5,28.2,-85.6,14.6C-87.7,1,-84,-13.5,-77.3,-26.6C-70.6,-39.7,-60.9,-51.4,-49.2,-59.6C-37.5,-67.8,-23.8,-72.5,-10.1,-72.5C3.6,-72.5,23,-72.5,30.5,-83.6L44.7,-76.4Z" transform="translate(100 100)" /></svg>
            </div>

            <div className="relative z-10 text-center text-white">
                {/* Quote */}
                <div className="flex justify-center mb-2 min-h-[28px]">
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={quote}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.2 }}
                            className={`py-1 px-4 rounded-full bg-white/20 border border-white/10 text-[11px] font-bold tracking-wider uppercase backdrop-blur-sm ${isProfit ? 'text-accent' : 'text-blue-100'}`}
                        >
                            {quote}
                        </motion.span>
                    </AnimatePresence>
                </div>

                {/* Main Amount */}
                <div className="text-6xl font-black tracking-tighter drop-shadow-sm py-4 tabular-nums">
                    <span className={`text-4xl align-middle mr-2 ${isProfit ? 'text-accent' : 'text-white/80'}`}>{isProfit ? '+' : '-'}</span>
                    <span className={isProfit ? 'text-accent' : 'text-white'}>{absNet}</span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mt-4 max-w-xs mx-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider mb-0.5">固定支出</span>
                        <span className="font-bold text-lg">¥{totalCost.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className={`text-[10px] uppercase font-bold tracking-wider mb-0.5 ${isProfit ? 'text-accent' : 'text-blue-200'}`}>会员回血</span>
                        <span className={`font-bold text-lg ${isProfit ? 'text-accent' : 'text-blue-100'}`}>¥{totalIncome.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
