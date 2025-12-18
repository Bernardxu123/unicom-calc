import React, { useState, useEffect } from 'react';
import useAppStore from '../store/useAppStore';
import { Download, Upload, FileJson, Trash2, RefreshCw, Smartphone, Share } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
    const { cards, currentDate, customPresets, globalVipPrice, setGlobalVipPrice, resetData, importData } = useAppStore();
    const [installPrompt, setInstallPrompt] = useState(null);
    const isIOS = /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());

    useEffect(() => {
        // PWA Install Prompt
        const handler = (e) => {
            e.preventDefault();
            setInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    if (!isOpen) return null;

    const handleBackup = () => {
        const { cards, currentDate, customPresets, globalVipPrice } = useAppStore.getState();
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({
            cards,
            currentDate,
            customPresets: customPresets || [],
            globalVipPrice
        }));
        const link = document.createElement('a');
        link.href = dataStr;
        link.download = `Unicom_Backup_${currentDate}.json`;
        link.click();
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data && data.cards) {
                    if (confirm("恢复数据将覆盖当前内容，确定吗？")) {
                        importData(data);
                        alert("✅ 数据已恢复");
                        onClose();
                    }
                } else alert("❌ 格式错误");
            } catch { alert("❌ 解析失败"); }
        };
        reader.readAsText(file);
        e.target.value = ''; // reset
    };

    const handleExportCSV = () => {
        let csv = "\uFEFF类型,卡名,业务,开始,时长,月支,会员卖出\n";
        cards.forEach(c => {
            c.items.forEach(i => csv += `主卡,${c.name},${i.title},${i.startMonth},${i.duration},${i.cost},${i.vipPrice}\n`);
            c.subCards.forEach(s => s.items.forEach(i => csv += `副卡,${s.name},${i.title},${i.startMonth},${i.duration},${i.cost},${i.vipPrice}\n`));
        });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
        link.download = `Unicom_Bill_${currentDate}.csv`;
        link.click();
    };

    const handleForceUpdate = async () => {
        if (!confirm("确定要强制刷新并更新吗？将会清理所有浏览器缓存。")) return;

        // 1. Unregister Service Workers
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            for (const registration of registrations) {
                await registration.unregister();
            }
        }

        // 2. Clear Cache Storage (Crucial for PWA)
        if ('caches' in window) {
            const cacheNames = await caches.keys();
            for (const name of cacheNames) {
                await caches.delete(name);
            }
        }

        // 3. Force reload from server
        window.location.reload(true);
    };

    const handleInstall = async () => {
        if (!installPrompt) return;
        installPrompt.prompt();
        const { outcome } = await installPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallPrompt(null);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose}></div>
            <div className="bg-white w-full max-w-2xl rounded-t-[2rem] p-6 shadow-2xl relative z-10 animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-6"></div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">设置与数据</h3>

                <div className="grid grid-cols-2 gap-3 mb-6">
                    {/* Add to Home Screen */}
                    {installPrompt && (
                        <button onClick={handleInstall} className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:shadow-lg hover:brightness-110 transition col-span-2">
                            <Smartphone className="text-white" size={20} /> 添加到桌面 (安装 App)
                        </button>
                    )}

                    {/* iOS Hint */}
                    {isIOS && !window.matchMedia('(display-mode: standalone)').matches && (
                        <div className="bg-slate-50 border-dashed border border-slate-300 text-slate-500 py-3 rounded-xl font-bold text-[10px] flex items-center justify-center gap-2 col-span-2">
                            <Share size={14} /> Safari 点击分享，选择 "添加到主屏幕"
                        </div>
                    )}

                    <button onClick={handleForceUpdate} className="bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-green-50 hover:border-green-200 transition">
                        <RefreshCw className="text-green-600" size={20} /> 检查更新 (强制刷新)
                    </button>

                    <button onClick={handleBackup} className="bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/30 transition">
                        <FileJson className="text-primary" size={20} /> 备份数据 ({customPresets?.length || 0} 个模板)
                    </button>
                    <label className="bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition cursor-pointer">
                        <Upload className="text-blue-500" size={20} /> 恢复数据
                        <input type="file" hidden accept=".json" onChange={handleImport} />
                    </label>
                    <button onClick={handleExportCSV} className="bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition">
                        <Download className="text-slate-500" size={20} /> 导出表格 (CSV)
                    </button>
                    <label className="bg-slate-50 border border-slate-200 text-slate-700 py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-slate-100 transition relative">
                        <span className="text-slate-400 text-[10px] uppercase tracking-wider">默认会员价</span>
                        <div className="flex items-center gap-0.5">
                            <span className="text-slate-400 text-xs translate-y-[1px]">¥</span>
                            <input
                                type="number"
                                value={globalVipPrice ?? 16.25}
                                onChange={(e) => setGlobalVipPrice(e.target.value)}
                                className="w-12 bg-transparent text-center font-bold text-slate-700 outline-none border-b border-transparent focus:border-primary/50 transition-colors p-0 text-base"
                            />
                        </div>
                    </label>
                    <button onClick={() => { if (confirm("重置所有?")) { resetData(); onClose(); } }} className="bg-slate-50 border border-slate-200 text-red-500 py-3.5 rounded-xl font-bold text-xs flex flex-col items-center justify-center gap-2 hover:bg-red-50 hover:border-red-100 transition">
                        <Trash2 className="text-red-500" size={20} /> 重置所有
                    </button>
                </div>

                <button onClick={onClose} className="w-full py-3 text-slate-400 font-bold text-sm hover:text-slate-600 transition">关闭菜单</button>
            </div>
        </div>
    )
}
