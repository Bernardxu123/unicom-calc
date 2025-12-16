import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { PRESETS } from '../lib/presets';
import { getMonthDiff } from '../lib/utils';
import { Link2, FileText, Check, ChevronDown, Percent, Trash2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function BusinessItem({ item }) {
    const { updateItem, deleteItem, applyPreset, currentDate, addCustomPreset, customPresets, deleteCustomPreset } = useAppStore();
    const [expanded, setExpanded] = useState(false);

    // Ensure we parse values for logic since store allows strings now
    const safeDuration = parseFloat(item.duration) || 0;
    const safeCost = parseFloat(item.cost) || 0;
    const safeVip = parseFloat(item.vipPrice) || 0;

    const passed = getMonthDiff(item.startMonth, currentDate);
    const duration = safeDuration;
    // Don't auto-hide if user is editing (expanded) or if the value is temporarily invalid/0 but duration field says -1
    // If duration is 0 (partial input of '-'), treat as not expired yet to avoid disappearing while typing.
    const isExpired = duration > 0 && passed >= duration;
    const remaining = duration - passed;

    // Auto-hide expired only if not expanded
    if (isExpired && !expanded) return null;

    const net = safeCost - safeVip;
    const isDiscount = safeCost < 0;
    const isLinked = (item.title || '').includes('携转6折');

    const handleSavePreset = () => {
        const name = prompt("给这个配置起个名字 (如: 我的专属神卡):", item.title);
        if (name) {
            addCustomPreset({
                name: `⚡️ ${name}`,
                title: item.title,
                cost: safeCost,
                vip: safeVip,
                duration: safeDuration
            });
            alert("✅ 模板已保存! 可在下拉菜单中找到。");
        }
    };

    const allPresets = [...(customPresets || []), ...PRESETS];

    return (
        <div className={`glass-card rounded-2xl overflow-hidden transition-all duration-300 border border-white/50 hover:border-white/80 ${expanded ? 'ring-2 ring-primary/20' : ''}`}>
            <div
                className="relative p-4 cursor-pointer active:bg-white/40 min-h-[80px]"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Badge */}
                <div className="absolute top-4 right-4 z-10 pointer-events-none">
                    <div className={`font-bold text-sm px-2 py-0.5 rounded-lg ${net <= 0 ? 'text-green-600 bg-green-50' : 'text-slate-700 bg-slate-100'}`}>
                        {isDiscount ? safeCost.toFixed(2) : (net <= 0 ? '+' + Math.abs(net).toFixed(2) : '-' + net.toFixed(2))}
                    </div>
                </div>

                <div className="flex items-center gap-4 pr-16 bg-transparent">
                    {/* Icon */}
                    {safeVip > 0 ? (
                        <div className="w-10 h-10 rounded-xl tencent-grad flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0 text-white">
                            <svg viewBox="0 0 1024 1024" className="w-5 h-5 fill-current"><path d="M192 128l640 384-640 384V128z" /></svg>
                        </div>
                    ) : (
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100">
                            {isDiscount ? <Percent size={18} /> : <FileText size={18} />}
                        </div>
                    )}

                    <div className="min-w-0">
                        <div className="font-bold text-slate-800 text-base truncate flex items-center gap-1">
                            {item.title}
                            {isLinked && (
                                <span className="inline-flex items-center text-[9px] bg-blue-50 text-blue-500 px-1.5 py-0.5 rounded border border-blue-100 ml-1">
                                    <Link2 size={8} className="mr-0.5" /> 关联
                                </span>
                            )}
                        </div>
                        <div className="text-xs text-slate-400 font-medium truncate mt-0.5">
                            {duration === -1 ? '长期有效' : (
                                <span>{duration > 0 ? `有效期剩 ${remaining} 个月` : '设置时长...'}</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Expanded Edit Panel */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-slate-50/50 backdrop-blur-sm border-t border-white/50 cursor-default"
                    >
                        <div className="p-4 space-y-4">
                            {/* Preset Select */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-2 pl-3 pr-8 rounded-xl text-sm font-bold shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        onChange={(e) => {
                                            if (e.target.value.startsWith('DEL_')) {
                                                if (confirm("删除此自定义模板？")) deleteCustomPreset(e.target.value.replace('DEL_', ''));
                                            } else {
                                                applyPreset(item.id, e.target.value, allPresets);
                                            }
                                            e.target.value = "";
                                        }}
                                        value=""
                                    >
                                        <option value="" disabled>✨ 快速套用模板...</option>
                                        {customPresets && customPresets.length > 0 && (
                                            <optgroup label="我的模板 (点击应用 / 底部删除)">
                                                {customPresets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                            </optgroup>
                                        )}
                                        <optgroup label="官方预设">
                                            {PRESETS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </optgroup>
                                        {customPresets && customPresets.length > 0 && (
                                            <optgroup label="管理">
                                                {customPresets.map(p => <option key={'DEL_' + p.id} value={'DEL_' + p.id}>🗑 删除: {p.name}</option>)}
                                            </optgroup>
                                        )}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-2.5 text-slate-400 pointer-events-none" size={16} />
                                </div>
                                <button
                                    onClick={handleSavePreset}
                                    title="保存当前配置为新模板"
                                    className="px-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-primary hover:border-primary transition shadow-sm"
                                >
                                    <Save size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">业务名称</label>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                        className="w-full bg-white/60 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/50 transition-colors"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">月固定支出</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-slate-400 text-xs">¥</span>
                                            <input
                                                type="number" // Keep type number for mobile keyboard, but value can be string
                                                className="w-full bg-white/60 border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/50 transition-colors"
                                                value={item.cost}
                                                onChange={(e) => updateItem(item.id, 'cost', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">会员卖出价</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-slate-400 text-xs">¥</span>
                                            <input
                                                type="number"
                                                className="w-full bg-white/60 border border-slate-200 rounded-lg pl-7 pr-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/50 transition-colors"
                                                value={item.vipPrice}
                                                onChange={(e) => updateItem(item.id, 'vipPrice', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Time & Delete */}
                                <div className="flex items-end gap-3 pt-2">
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">开通月份</label>
                                        <input
                                            type="month"
                                            className="w-full bg-white/60 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/50 transition-colors"
                                            value={item.startMonth}
                                            onChange={(e) => updateItem(item.id, 'startMonth', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 block">持续时长 (月)</label>
                                        <input
                                            type="number"
                                            className="w-full bg-white/60 border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold text-slate-700 focus:outline-none focus:border-primary/50 transition-colors"
                                            placeholder="-1 为无限期"
                                            value={item.duration}
                                            onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Actions Row */}
                                <div className="flex justify-between items-center pt-2 pb-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                        className="w-10 h-10 flex items-center justify-center bg-red-50 text-red-500 rounded-xl border border-red-100 hover:bg-red-100 transition-colors"
                                        title="删除"
                                    >
                                        <Trash2 size={16} />
                                    </button>

                                    <button
                                        onClick={() => setExpanded(false)}
                                        className="h-10 px-6 bg-slate-800 text-white rounded-xl text-sm font-bold hover:bg-slate-700 flex items-center gap-2 shadow-lg shadow-slate-200 transition-all"
                                    >
                                        <Check size={16} /> 完成编辑
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
