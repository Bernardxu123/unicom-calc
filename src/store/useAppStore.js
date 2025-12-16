import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEY, DEFAULT_START } from '../lib/utils';
import { DISCOUNT_RATE, PRESETS } from '../lib/presets';

const defaultData = {
    currentDate: DEFAULT_START,
    globalVipPrice: 16.25,
    customPresets: [],
    cards: [
        {
            id: 'main_def',
            name: '我的主卡',
            items: [
                { id: 'm1', title: '畅视套餐39', subtitle: '长期有效', startMonth: DEFAULT_START, duration: -1, cost: 39, vipPrice: 0 },
                { id: 'm2', title: '携转6折优惠', subtitle: '智能关联', startMonth: DEFAULT_START, duration: 12, cost: -15.6, vipPrice: 0 }
            ],
            subCards: []
        }
    ],
    user: null,
    accessToken: null,
    syncStatus: 'idle', // idle, syncing, success, error
};

function isMainPlan(item) {
    const title = item.title || '';
    return title.includes('套餐') || title.includes('畅视') || title.includes('主套餐');
}

const useAppStore = create(
    persist(
        (set, get) => ({
            ...defaultData,

            setGlobalDate: (date) => set({ currentDate: date }),
            setGlobalVipPrice: (price) => set({ globalVipPrice: parseFloat(price) || 0 }),
            resetData: () => set(defaultData),
            importData: (data) => set({
                ...data,
                customPresets: data.customPresets || [],
                globalVipPrice: data.globalVipPrice !== undefined ? data.globalVipPrice : 16.25
            }),

            addMainCard: () => set((state) => ({
                cards: [...state.cards, {
                    id: 'main_' + Date.now(),
                    name: '新主卡',
                    items: [{ id: 'm_' + Date.now(), title: '畅视套餐39', cost: 39, vipPrice: 0, duration: -1, startMonth: state.currentDate }],
                    subCards: []
                }]
            })),

            deleteCard: (type, mainId, subId) => set((state) => {
                if (type === 'main') {
                    return { cards: state.cards.filter(c => c.id !== mainId) };
                } else {
                    return {
                        cards: state.cards.map(c => {
                            if (c.id === mainId) {
                                return { ...c, subCards: c.subCards.filter(s => s.id !== subId) };
                            }
                            return c;
                        })
                    };
                }
            }),

            updateCardName: (id, isSub, name) => set((state) => {
                const newCards = state.cards.map(c => {
                    if (!isSub && c.id === id) return { ...c, name };
                    if (isSub) {
                        const subIdx = c.subCards.findIndex(s => s.id === id);
                        if (subIdx !== -1) {
                            const newSubs = [...c.subCards];
                            newSubs[subIdx] = { ...newSubs[subIdx], name };
                            return { ...c, subCards: newSubs };
                        }
                    }
                    return c;
                });
                return { cards: newCards };
            }),

            addSubCard: (mainId) => set((state) => {
                return {
                    cards: state.cards.map(c => {
                        if (c.id === mainId && c.subCards.length < 4) {
                            return { ...c, subCards: [...c.subCards, { id: 'sub_' + Date.now(), name: '新副卡', items: [] }] };
                        }
                        return c;
                    })
                };
            }),

            addItem: (parentId, isSub, mainIdOfSub) => set((state) => {
                const newItem = {
                    id: 'i_' + Date.now(),
                    title: '新业务',
                    cost: 0,
                    vipPrice: state.globalVipPrice ?? 16.25,
                    duration: 12,
                    startMonth: state.currentDate
                };

                const newCards = state.cards.map(c => {
                    if (!isSub && c.id === parentId) {
                        return { ...c, items: [...c.items, newItem] };
                    }
                    if (isSub && c.id === mainIdOfSub) {
                        const newSubs = c.subCards.map(s => {
                            if (s.id === parentId) return { ...s, items: [...s.items, newItem] };
                            return s;
                        });
                        return { ...c, subCards: newSubs };
                    }
                    return c;
                });
                return { cards: newCards };
            }),

            deleteItem: (itemId) => set((state) => ({
                cards: state.cards.map(c => ({
                    ...c,
                    items: c.items.filter(i => i.id !== itemId),
                    subCards: c.subCards.map(s => ({
                        ...s,
                        items: s.items.filter(i => i.id !== itemId)
                    }))
                }))
            })),

            addCustomPreset: (preset) => set((state) => ({
                customPresets: [...(state.customPresets || []), { ...preset, id: 'cp_' + Date.now() }]
            })),

            deleteCustomPreset: (id) => set((state) => ({
                customPresets: (state.customPresets || []).filter(p => p.id !== id)
            })),

            updateItem: (itemId, field, value) => {
                set((state) => {
                    const updateList = (list) => list.map(item => {
                        if (item.id !== itemId) return item;
                        let newVal = value;
                        if (['cost', 'vipPrice', 'duration'].includes(field)) {
                            // Fix: Allow empty string or '-' to exist as string to prevent immediate NaN/0 conversion
                            if (value === '' || value === '-') {
                                newVal = value;
                            } else {
                                const p = parseFloat(value);
                                newVal = isNaN(p) ? 0 : p; // Only fallback to 0 if completely invalid
                            }
                        }
                        return { ...item, [field]: newVal };
                    });

                    let newCards = state.cards.map(c => ({
                        ...c,
                        items: updateList(c.items),
                        subCards: c.subCards.map(s => ({ ...s, items: updateList(s.items) }))
                    }));

                    // Smart Linkage
                    if (field === 'cost' || field === 'title') {
                        newCards = newCards.map(c => {
                            const triggerInMain = c.items.find(i => i.id === itemId);
                            // Ensure we use parsed values for logic checks
                            const getCost = (i) => parseFloat(i.cost) || 0;

                            if (triggerInMain && isMainPlan(triggerInMain)) {
                                const discount = c.items.find(i => i.title.includes('携转6折'));
                                if (discount) {
                                    const newCost = parseFloat((-(getCost(triggerInMain) * (1 - DISCOUNT_RATE))).toFixed(2));
                                    c.items = c.items.map(i => i.id === discount.id ? { ...i, cost: newCost } : i);
                                }
                            }

                            c.subCards = c.subCards.map(s => {
                                const triggerInSub = s.items.find(i => i.id === itemId);
                                if (triggerInSub && isMainPlan(triggerInSub)) {
                                    const discount = s.items.find(i => i.title.includes('携转6折'));
                                    if (discount) {
                                        const newCost = parseFloat((-(getCost(triggerInSub) * (1 - DISCOUNT_RATE))).toFixed(2));
                                        s.items = s.items.map(i => i.id === discount.id ? { ...i, cost: newCost } : i);
                                    }
                                }
                                return s;
                            });
                            return c;
                        });
                    }
                    return { cards: newCards };
                });
            },

            applyPreset: (itemId, presetId, allPresets) => {
                // Use passed allPresets if available, otherwise search default PRESETS
                // Actually logic needs to find from unified list.
                // We updated BusinessItem to pass allPresets, but we need to update safe access here?
                // Wait, applyPreset in store (line 187) uses `PRESETS.find`, it ignores custom presets if ID is not found there!
                // FIX: use `allPresets` arg if passed, OR read state.customPresets

                const state = get();
                let preset = null;

                // If allPresets passed from UI component
                if (allPresets && allPresets.length) {
                    preset = allPresets.find(p => p.id === presetId);
                } else {
                    // Fallback check
                    preset = PRESETS.find(p => p.id === presetId);
                    if (!preset) {
                        const customs = state.customPresets || [];
                        preset = customs.find(p => p.id === presetId);
                    }
                }

                if (!preset) return;

                state.updateItem(itemId, 'title', preset.title);
                state.updateItem(itemId, 'vipPrice', preset.vip);
                state.updateItem(itemId, 'duration', preset.duration);

                if (presetId === 'p_port') {
                    // Need to find context and update self cost based on sibling main plan
                    // Since we don't know easily which card this itemId belongs to without scanning,
                    // we scan the latest state.
                    const freshState = get(); // Re-get state after updates
                    let targetCost = 0;

                    freshState.cards.forEach(c => {
                        let siblingMain = c.items.find(i => i.id !== itemId && isMainPlan(i));
                        // Check if this card contains our target item
                        if (c.items.find(i => i.id === itemId)) {
                            if (siblingMain) targetCost = -(siblingMain.cost * (1 - DISCOUNT_RATE));
                        }
                        // Check subs
                        c.subCards.forEach(s => {
                            if (s.items.find(i => i.id === itemId)) {
                                let subSiblingMain = s.items.find(i => i.id !== itemId && isMainPlan(i));
                                if (subSiblingMain) targetCost = -(subSiblingMain.cost * (1 - DISCOUNT_RATE));
                            }
                        });
                    });

                    if (targetCost !== 0) {
                        state.updateItem(itemId, 'cost', parseFloat((targetCost).toFixed(2)));
                    } else {
                        state.updateItem(itemId, 'cost', preset.cost);
                    }
                } else {
                    state.updateItem(itemId, 'cost', preset.cost);
                }
            },

            // --- Authentication Actions ---
            login: async (username, password) => {
                try {
                    const res = await fetch('/api/auth/login', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.error || 'Login failed');

                    set({ user: data.user, accessToken: data.token });
                    return { success: true };
                } catch (err) {
                    return { success: false, error: err.message };
                }
            },

            register: async (username, password) => {
                try {
                    const res = await fetch('/api/auth/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ username, password })
                    });

                    if (!res.ok) {
                        const text = await res.text();
                        console.error('Register Error Response:', text);
                        try {
                            const data = JSON.parse(text);
                            throw new Error(data.error || 'Registration failed');
                        } catch (e) {
                            throw new Error(`Server Error: ${res.status} ${res.statusText}`);
                        }
                    }
                    return { success: true };
                } catch (err) {
                    console.error('Register Exception:', err);
                    return { success: false, error: err.message };
                }
            },

            logout: () => set({ user: null, accessToken: null }),

            // --- Cloud Data Actions ---
            saveCloudConfig: async () => {
                const { user, accessToken, currentDate, globalVipPrice, customPresets, cards } = get();
                if (!user || !accessToken) return;

                set({ syncStatus: 'syncing' });
                try {
                    const config = { currentDate, globalVipPrice, customPresets, cards };
                    const res = await fetch('/api/data/config', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify(config)
                    });
                    if (!res.ok) throw new Error('Save failed');
                    set({ syncStatus: 'success' });
                    setTimeout(() => set({ syncStatus: 'idle' }), 2000);
                } catch (err) {
                    set({ syncStatus: 'error' });
                }
            },

            fetchCloudConfig: async () => {
                const { user, accessToken } = get();
                if (!user || !accessToken) return;

                try {
                    const res = await fetch('/api/data/config', {
                        headers: { 'Authorization': `Bearer ${accessToken}` }
                    });
                    if (!res.ok) throw new Error('Fetch failed');
                    const data = await res.json();
                    if (data.config_json) {
                        const parsed = JSON.parse(data.config_json);
                        get().importData(parsed);
                        return { success: true };
                    }
                } catch (err) {
                    console.error(err);
                    return { success: false, error: err.message };
                }
            },

            submitScore: async (score) => {
                const { user, accessToken } = get();
                if (!user || !accessToken) return;

                try {
                    await fetch('/api/data/ranking', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${accessToken}`
                        },
                        body: JSON.stringify({ score })
                    });
                } catch (err) {
                    console.error('Score submission failed', err);
                }
            }
        }),
        {
            name: STORAGE_KEY,
            storage: createJSONStorage(() => localStorage),
            version: 1, // Add versioning
            migrate: (persistedState, version) => {
                if (version === 0) {
                    // migration logic
                    return { ...defaultData, ...persistedState, customPresets: persistedState.customPresets || [] };
                }
                return persistedState;
            },
            merge: (persistedState, currentState) => {
                // Deep merge or ensure new keys exist
                return {
                    ...currentState,
                    ...persistedState,
                    cards: persistedState.cards || currentState.cards,
                    customPresets: persistedState.customPresets || []
                };
            }
        }
    )
);

export default useAppStore;
