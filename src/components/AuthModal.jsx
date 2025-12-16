import React, { useState } from 'react';
import useAppStore from '../store/useAppStore';
import { X, User, Lock, ArrowRight, LogOut, CloudUpload, CloudDownload, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function AuthModal({ isOpen, onClose }) {
    const [isLogin, setIsLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register, user, logout, saveCloudConfig, fetchCloudConfig, syncStatus } = useAppStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const action = isLogin ? login : register;
        const res = await action(username, password);

        setLoading(false);
        if (res.success) {
            if (!isLogin) {
                setIsLogin(true); // Switch to login after register
                setError('注册成功！请登录。');
            } else {
                onClose();
            }
        } else {
            setError(res.error);
        }
    };

    const handleLogout = () => {
        logout();
        setIsLogin(true);
    };

    if (!isOpen) return null;

    // View for Logged In User
    if (user) {
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
                        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6"
                    >
                        <button
                            onClick={onClose}
                            className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            <X size={16} />
                        </button>

                        <div className="text-center mb-8 mt-4">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-emerald-600 text-white mx-auto flex items-center justify-center mb-4 shadow-xl shadow-primary/20">
                                <span className="text-3xl font-black">{user.username.charAt(0).toUpperCase()}</span>
                            </div>
                            <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user.username}</h2>
                            <p className="text-sm text-slate-500 font-bold uppercase tracking-wider mt-1">已登录</p>
                        </div>

                        <div className="space-y-3">
                            <button
                                onClick={saveCloudConfig}
                                disabled={syncStatus === 'syncing'}
                                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-xl transition-all flex items-center justify-between px-6"
                            >
                                <div className="flex items-center gap-3">
                                    <CloudUpload size={20} className="text-slate-400" />
                                    <span>备份配置到云端</span>
                                </div>
                                {syncStatus === 'success' ? <Check size={18} className="text-green-500" /> : null}
                            </button>

                            <button
                                onClick={async () => {
                                    if (confirm('确定要从云端恢复配置吗？当前本地配置将被覆盖。')) {
                                        await fetchCloudConfig();
                                        onClose();
                                    }
                                }}
                                className="w-full bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold py-4 rounded-xl transition-all flex items-center justify-between px-6"
                            >
                                <div className="flex items-center gap-3">
                                    <CloudDownload size={20} className="text-slate-400" />
                                    <span>从云端恢复配置</span>
                                </div>
                            </button>
                        </div>

                        <div className="mt-8 border-t border-slate-100 pt-6">
                            <button
                                onClick={handleLogout}
                                className="w-full text-red-500 font-bold py-3 rounded-xl hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut size={18} />
                                退出登录
                            </button>
                        </div>
                    </motion.div>
                </div>
            </AnimatePresence>
        );
    }

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
                    className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-6"
                >
                    <button
                        onClick={onClose}
                        className="absolute right-4 top-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors"
                    >
                        <X size={16} />
                    </button>

                    <div className="text-center mb-6 mt-2">
                        <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-4">
                            <User size={32} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                            {isLogin ? '欢迎回来' : '创建账户'}
                        </h2>
                        <p className="text-sm text-slate-500 mt-1">
                            {isLogin ? '登录以同步您的配置和排名' : '注册一个新账户开始使用'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">用户名</label>
                            <div className="relative">
                                <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="输入用户名"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase ml-1">密码</label>
                            <div className="relative">
                                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                                    placeholder="输入密码"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="text-red-500 text-xs font-bold text-center bg-red-50 py-2 rounded-lg">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl shadow-lg shadow-slate-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
                            {!loading && <ArrowRight size={18} />}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <button
                            type="button"
                            onClick={() => { setIsLogin(!isLogin); setError(''); }}
                            className="text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                        >
                            {isLogin ? '没有账户? 去注册' : '已有账户? 去登录'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
