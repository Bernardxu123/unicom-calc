import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { X, Trophy, RefreshCw, Upload } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function RankingModal({ isOpen, onClose }) {
    const [rankings, setRankings] = useState([]);
    const [loading, setLoading] = useState(false);
    const { user, submitScore, cards, currentDate } = useAppStore();

    // Calculate current net profit/loss
    const currentScore = React.useMemo(() => {
        let cost = 0;
        let income = 0;
        const getMonthDiff = (d1, d2) => {
            const date1 = new Date(d1);
            const date2 = new Date(d2);
            return (date2.getFullYear() - date1.getFullYear()) * 12 + (date2.getMonth() - date1.getMonth());
        };

        const isExpired = (item) => {
            if (item.duration === -1) return false;
            return getMonthDiff(item.startMonth, currentDate) >= item.duration;
        };

        const traverse = (list) => {
            list.forEach(i => {
                if (!isExpired(i)) {
                    cost += (i.cost || 0);
                    income += (i.vipPrice || 0);
                }
            });
        };

        cards.forEach(c => {
            traverse(c.items);
            c.subCards.forEach(s => traverse(s.items));
        });

        // Score as PROFIT (Income - Cost), or Net Savings. 
        // If Cost > Income, Net is positive (Loss). Profit is negative.
        // We want Higher is Better.
        // Score = Income - Cost.
        return (income - cost).toFixed(2);
    }, [cards, currentDate]);

    const fetchRankings = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/data/ranking');
            const data = await res.json();
            if (Array.isArray(data)) {
                setRankings(data);
            }
        } catch (err) {
            console.error('Failed to fetch rankings', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) fetchRankings();
    }, [isOpen]);

    const handleSubmitScore = async () => {
        if (!user) return;
        setLoading(true);
        await submitScore(parseFloat(currentScore));
        await fetchRankings();
        setLoading(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
                >
                    <div className="p-6 pb-2 shrink-0">
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <X size={16} />
                        </button>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-amber-400 text-white flex items-center justify-center shadow-lg shadow-amber-200">
                                <Trophy size={20} />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-slate-800">本月排行榜</h2>
                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Top Monthly Players</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 pt-0">
                        {rankings.length === 0 ? (
                            <div className="text-center py-10 text-slate-400 text-sm">暂无数据，快来占领榜首！</div>
                        ) : (
                            <div className="space-y-3">
                                {rankings.map((r, i) => (
                                    <div key={i} className={`flex items-center p-3 rounded-2xl ${r.username === user?.username ? 'bg-primary/5 border border-primary/20' : 'bg-slate-50'
                                        }`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm mr-3 ${i < 3 ? 'bg-gradient-to-br from-amber-300 to-orange-400 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                                            }`}>
                                            {i + 1}
                                        </div>
                                        <div className="flex-1 font-bold text-slate-700 truncate">{r.username}</div>
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-lg text-primary">{r.score.toFixed(2)}</div>
                                            <div className="text-[10px] text-slate-400 uppercase">Profit</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex items-center justify-between mb-3 px-2">
                            <span className="text-sm font-bold text-slate-500">我的成绩:</span>
                            <span className={`font-mono font-bold text-lg ${parseFloat(currentScore) >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {currentScore}
                            </span>
                        </div>
                        {user ? (
                            <button
                                onClick={handleSubmitScore}
                                disabled={loading}
                                className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <RefreshCw className="animate-spin" size={18} /> : <Upload size={18} />}
                                上传成绩
                            </button>
                        ) : (
                            <div className="text-center text-xs text-slate-400 bg-slate-50 py-3 rounded-xl">
                                登录后可上传成绩参与排名
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
