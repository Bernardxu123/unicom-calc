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
        <div className={`glass-card rounded-xl overflow-hidden transition-all duration-300 border border-slate-100 hover:border-primary/30 ${expanded ? 'ring-1 ring-primary/20 shadow-md' : 'shadow-sm'}`}>
            <div
                className="relative p-2.5 cursor-pointer active:bg-slate-50 min-h-[56px] flex items-center"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Badge */}
                <div className="absolute top-3 right-3 z-10 pointer-events-none">
                    <div className={`font-bold text-xs px-1.5 py-0.5 rounded ${net <= 0 ? 'text-green-600 bg-green-50/80' : 'text-slate-600 bg-slate-100/80'}`}>
                        {isDiscount ? safeCost.toFixed(2) : (net <= 0 ? '+' + Math.abs(net).toFixed(2) : '-' + net.toFixed(2))}
                    </div>
                </div>

                <div className="flex items-center gap-3 pr-14 w-full">
                    {/* Icon */}
                    {safeVip > 0 ? (
                        <div className="w-8 h-8 rounded-lg tencent-grad flex items-center justify-center shadow-sm shadow-blue-500/20 shrink-0 text-white">
                            <svg viewBox="0 0 1024 1024" className="w-4 h-4 fill-current"><path d="M192 128l640 384-640 384V128z" /></svg>
                        </div>
                    ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0 border border-slate-100/50">
                            {isDiscount ? <Percent size={14} /> : <FileText size={14} />}
                        </div>
                    )}

                    <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 text-sm truncate flex items-center gap-1">
                            {item.title}
                            {isLinked && (
                                <span className="inline-flex items-center text-[9px] bg-blue-50 text-blue-500 px-1 py-0 rounded border border-blue-100 ml-1">
                                    <Link2 size={8} className="mr-0.5" /> 关联
                                </span>
                            )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-medium truncate leading-tight">
                            {duration === -1 ? '长期有效' : (
                                <span>{duration > 0 ? `剩 ${remaining} 月` : '...'}</span>
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
                        className="bg-slate-50/80 border-t border-slate-100 cursor-default"
                    >
                        <div className="p-3 space-y-3">
                            {/* Preset Select */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select
                                        className="w-full appearance-none bg-white border border-slate-200 text-slate-700 py-1.5 pl-2 pr-6 rounded-lg text-xs font-bold shadow-sm focus:outline-none focus:ring-1 focus:ring-primary/20 transition-all"
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
                                        <option value="" disabled>✨ 快速套用...</option>
                                        {customPresets && customPresets.length > 0 && (
                                            <optgroup label="我的模板">
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
                                    <ChevronDown className="absolute right-2 top-2 text-slate-400 pointer-events-none" size={12} />
                                </div>
                                <button
                                    onClick={handleSavePreset}
                                    title="保存"
                                    className="px-2.5 bg-white border border-slate-200 rounded-lg text-slate-400 hover:text-primary hover:border-primary transition shadow-sm"
                                >
                                    <Save size={14} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <div>
                                    <input
                                        type="text"
                                        value={item.title}
                                        onChange={(e) => updateItem(item.id, 'title', e.target.value)}
                                        className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/50"
                                        placeholder="业务名称"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1.5 text-slate-400 text-[10px] scale-90">¥</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/50"
                                            value={item.cost}
                                            onChange={(e) => updateItem(item.id, 'cost', e.target.value)}
                                            placeholder="支出"
                                        />
                                    </div>
                                    <div className="relative">
                                        <span className="absolute left-2.5 top-1.5 text-slate-400 text-[10px] scale-90">¥</span>
                                        <input
                                            type="number"
                                            className="w-full bg-white border border-slate-200 rounded-lg pl-5 pr-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/50"
                                            value={item.vipPrice}
                                            onChange={(e) => updateItem(item.id, 'vipPrice', e.target.value)}
                                            placeholder="回血"
                                        />
                                    </div>
                                </div>

                                {/* Time & Delete */}
                                <div className="grid grid-cols-3 gap-2 pt-1">
                                    <div className="col-span-1">
                                        <input
                                            type="month"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-[10px] font-bold text-slate-700 focus:outline-none focus:border-primary/50"
                                            value={item.startMonth}
                                            onChange={(e) => updateItem(item.id, 'startMonth', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <input
                                            type="number"
                                            className="w-full bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-primary/50"
                                            placeholder="月数"
                                            value={item.duration}
                                            onChange={(e) => updateItem(item.id, 'duration', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-1 flex gap-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                            className="flex-1 bg-red-50 text-red-500 rounded-lg border border-red-100 hover:bg-red-100 flex items-center justify-center transition-colors"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        <button
                                            onClick={() => setExpanded(false)}
                                            className="flex-1 bg-slate-800 text-white rounded-lg flex items-center justify-center hover:bg-slate-700 transition"
                                        >
                                            <Check size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
