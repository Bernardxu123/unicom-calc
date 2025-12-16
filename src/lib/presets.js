export const DISCOUNT_RATE = 0.6; // 携转6折的折扣率（实际扣减40%）

export const PRESETS = [
    { id: 'custom', name: '✏️ 自定义填写...', title: '', cost: 0, vip: 16.25, duration: 12 },

    // 主套餐
    { id: 'p_29', name: '📱 畅视套餐 (29元)', title: '畅视套餐29', cost: 29, vip: 0, duration: -1 },
    { id: 'p_39', name: '📱 畅视套餐 (39元)', title: '畅视套餐39', cost: 39, vip: 0, duration: -1 },
    { id: 'p_generic', name: '📱 通用主套餐 (填金额)', title: '主套餐', cost: 0, vip: 0, duration: -1 },

    // 折扣与权益
    { id: 'p_port', name: '📉 携转6折 (自动关联)', title: '携转6折优惠', cost: 0, vip: 0, duration: 12 },
    { id: 'p_wopai', name: '🎓 沃派会员 (免费年包)', title: '沃派会员年包', cost: 0, vip: 16.25, duration: 12 },
    { id: 'p_plus', name: '💎 联通PLUS白银', title: '联通PLUS白银', cost: 8.25, vip: 16.25, duration: -1 },

    // 云盘
    { id: 'p_cloud_free', name: '☁️ 云Plus (免)', title: '云Plus (免)', cost: 0, vip: 16.25, duration: -1 },
    { id: 'p_cloud_paid', name: '☁️ 云Plus (费)', title: '云Plus (费)', cost: 10, vip: 16.25, duration: -1 },

    // 赠送
    { id: 'p_300', name: '🎁 300元充值返赠', title: '300充值返赠', cost: 0, vip: 16.25, duration: 4 },
    { id: 'p_200', name: '🎁 200元充值返赠', title: '200充值返赠', cost: 0, vip: 16.25, duration: 2 },
    { id: 'p_sub_gift', name: '🎉 新办副卡赠送', title: '新办副卡赠送', cost: 0, vip: 16.25, duration: 6 },
];
