export type RestaurantOrderingVocabulary = {
  term: string;
  meaning: string;
};

export type RestaurantOrderingScene = {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  explanation: string;
  vocabulary: RestaurantOrderingVocabulary[];
  harvest: string[];
  learningTip?: string;
};

export const restaurantOrderingCategory = {
  slug: 'restaurant',
  indonesian: 'Makan di Restoran',
  title: '餐厅吃饭',
  subtitle: '找座位、点餐、口味、加菜、打包和结账。',
} as const;

const scene = (
  id: string,
  task: string,
  indonesian: string,
  chinese: string,
  explanation: string,
  vocabulary: RestaurantOrderingVocabulary[],
  learningTip?: string,
): RestaurantOrderingScene => ({
  id,
  task,
  indonesian,
  chinese,
  explanation,
  vocabulary,
  harvest: vocabulary.map(({ term, meaning }) => `${term}（${meaning}）`),
  ...(learningTip ? { learningTip } : {}),
});

// Human-approved canonical source package. Preserve F01-F50 Indonesian and Chinese exactly.
export const restaurantOrderingScenes: RestaurantOrderingScene[] = [
  scene('F01', '再来一份米饭', 'Tambah nasi satu lagi, ya.', '再来一份米饭。',
    '已经点过米饭后，用 “satu lagi” 明确表示再加一份；句尾 “ya” 让要求听起来更自然。', [
      { term: 'tambah nasi', meaning: '加米饭；再来米饭' },
      { term: 'satu lagi', meaning: '再一个；再一份' },
    ]),
  scene('F02', '我要温水', 'Saya mau air hangat.', '我要温水。',
    '在餐厅里 “air hangat” 通常指温水或温热的水，不是滚烫的开水。', [
      { term: 'saya mau', meaning: '我要；我想要' },
      { term: 'air hangat', meaning: '温水；温热的水' },
    ], '如果需要热水，可以进一步确认温度；“air hangat” 本身重点是温热。'),
  scene('F03', '有温水吗？', 'Ada air hangat?', '有温水吗？',
    '点饮料前先用 “Ada...?” 询问店里有没有某样东西，是很直接自然的问法。', [
      { term: 'ada...?', meaning: '有……吗？' },
      { term: 'air hangat', meaning: '温水；温热的水' },
    ]),
  scene('F04', '不要冰', 'Jangan pakai es, ya.', '不要加冰。',
    '“jangan pakai...” 是点餐时要求不要放某种配料的常用结构。', [
      { term: 'jangan pakai', meaning: '不要放；不要加' },
      { term: 'es', meaning: '冰' },
    ]),
  scene('F05', '少冰', 'Esnya sedikit aja, ya.', '冰少一点。',
    '“sedikit aja” 表示少一点就行；放在 “esnya” 后面就是要求少冰。', [
      { term: 'esnya', meaning: '冰；这里指这杯饮料里的冰' },
      { term: 'sedikit aja', meaning: '少一点就行；一点点就可以' },
    ]),
  scene('F06', '冰另外放', 'Esnya dipisah, ya.', '冰另外放。',
    '希望冰块不要直接放进饮料时，用 “dipisah” 要求分开放。', [
      { term: 'esnya', meaning: '冰块' },
      { term: 'dipisah', meaning: '分开；另外放' },
    ]),
  scene('F07', '少糖', 'Gulanya sedikit aja, ya.', '糖少一点。',
    '“sedikit aja” 可以灵活接在糖、冰、辣椒酱或盐后面，表示少一点就可以。', [
      { term: 'gulanya', meaning: '糖；这里指饮料里的糖' },
      { term: 'sedikit aja', meaning: '少一点就行；一点点就可以' },
    ]),
  scene('F08', '不要糖', 'Jangan pakai gula, ya.', '不要放糖。',
    '这是 “jangan pakai...” 在饮料场景中的用法，明确要求制作时不要加糖。', [
      { term: 'jangan pakai', meaning: '不要放；不要加' },
      { term: 'gula', meaning: '糖' },
    ]),
  scene('F09', '不要太甜', 'Jangan terlalu manis, ya.', '不要太甜。',
    '“jangan terlalu + 形容词” 用来表达不要达到某种过高程度，这里是甜度不要太高。', [
      { term: 'jangan terlalu', meaning: '不要太……' },
      { term: 'manis', meaning: '甜' },
    ]),
  scene('F10', '再来一瓶水', 'Minta air mineral satu lagi, ya.', '再来一瓶矿泉水。',
    '已经有水后，用 “minta...satu lagi” 向服务员再要一份。', [
      { term: 'minta', meaning: '要；麻烦给' },
      { term: 'air mineral', meaning: '矿泉水；瓶装饮用水' },
      { term: 'satu lagi', meaning: '再一个；再一份' },
    ]),
  scene('F11', '不要辣', 'Jangan pedas, ya.', '不要辣。',
    '点菜时直接说 “jangan pedas” 是简洁的口味要求，表示不要做辣。', [
      { term: 'jangan pedas', meaning: '不要辣；不要做辣' },
      { term: 'ya', meaning: '柔和语气，使要求更自然' },
    ]),
  scene('F12', '少辣一点', 'Jangan terlalu pedas, ya.', '不要太辣。',
    '这句话不是完全不要辣，而是要求辣度不要太高。', [
      { term: 'jangan terlalu', meaning: '不要太……' },
      { term: 'pedas', meaning: '辣' },
    ]),
  scene('F13', '辣椒少一点', 'Sambalnya sedikit aja, ya.', '辣椒酱少一点。',
    '“sambal” 指常见的辣椒酱；“sedikit aja” 表示只放少量。', [
      { term: 'sambalnya', meaning: '辣椒酱；这里指随餐或菜里的辣椒酱' },
      { term: 'sedikit aja', meaning: '少一点就行' },
    ]),
  scene('F14', '辣椒另外放', 'Sambalnya dipisah, ya.', '辣椒酱另外放。',
    '想自己控制辣度时，可以要求把辣椒酱分开放。', [
      { term: 'sambalnya', meaning: '辣椒酱' },
      { term: 'dipisah', meaning: '分开；另外放' },
    ]),
  scene('F15', '不要辣椒酱', 'Jangan pakai sambal, ya.', '不要放辣椒酱。',
    '用 “jangan pakai...” 明确要求制作或上菜时不要放辣椒酱。', [
      { term: 'jangan pakai', meaning: '不要放；不要加' },
      { term: 'sambal', meaning: '辣椒酱' },
    ]),
  scene('F16', '盐少一点', 'Garamnya sedikit aja, ya.', '盐少一点。',
    '“garamnya sedikit aja” 是直接要求少放盐的自然说法。', [
      { term: 'garamnya', meaning: '盐；这里指菜里的盐' },
      { term: 'sedikit aja', meaning: '少一点就行' },
    ]),
  scene('F17', '不要太咸', 'Jangan terlalu asin, ya.', '不要太咸。',
    '用 “jangan terlalu asin” 描述希望成品不要太咸，重点是整体咸度。', [
      { term: 'jangan terlalu', meaning: '不要太……' },
      { term: 'asin', meaning: '咸' },
    ]),
  scene('F18', '不要味精', 'Jangan pakai MSG, ya.', '不要放味精。',
    '点餐时可用 “jangan pakai...” 要求不要添加 MSG。', [
      { term: 'jangan pakai', meaning: '不要放；不要加' },
      { term: 'MSG', meaning: '味精' },
    ], '在餐厅沟通里直接说字母缩写 MSG 通常容易被理解。'),
  scene('F19', '不要葱', 'Jangan pakai daun bawang, ya.', '不要放葱。',
    '“daun bawang” 指葱；这句话用于点菜时要求不要加入。', [
      { term: 'jangan pakai', meaning: '不要放；不要加' },
      { term: 'daun bawang', meaning: '葱' },
    ]),
  scene('F20', '不要香菜', 'Jangan pakai daun ketumbar, ya.', '不要放香菜。',
    '“daun ketumbar” 指香菜；用 “jangan pakai” 表示制作时不要放。', [
      { term: 'jangan pakai', meaning: '不要放；不要加' },
      { term: 'daun ketumbar', meaning: '香菜' },
    ]),
  scene('F21', '这是什么肉？', 'Ini daging apa?', '这是什么肉？',
    '看到不熟悉的菜时，用 “daging apa” 询问它是哪一种肉。', [
      { term: 'ini', meaning: '这个；这里指眼前的菜' },
      { term: 'daging apa?', meaning: '什么肉？' },
    ]),
  scene('F22', '这里面有猪肉吗？', 'Ini ada daging babinya?', '这里面有猪肉吗？',
    '用于确认某道菜或食品里是否含有猪肉；“ada...nya” 在口语中用于询问其中有没有。', [
      { term: 'ada...?', meaning: '有……吗？' },
      { term: 'daging babi', meaning: '猪肉' },
    ]),
  scene('F23', '我不要内脏', 'Saya nggak mau jeroan.', '我不要内脏。',
    '“nggak mau” 是口语里的“不要、不想要”；“nggak” 是 “tidak” 的常见口语形式。', [
      { term: 'nggak mau', meaning: '不要；不想要' },
      { term: 'jeroan', meaning: '内脏' },
    ]),
  scene('F24', '这个里面有什么？', 'Ini isinya apa aja?', '这个里面都有些什么？',
    '询问菜品包含哪些东西时，“apa aja” 有“都有些什么、有哪些”的意思。', [
      { term: 'isinya', meaning: '里面的内容；配料' },
      { term: 'apa aja', meaning: '都有些什么；有哪些' },
    ], '口语里的 “aja” 对应较正式的 “saja”；这里不是“只”的意思，而是用于问有哪些。'),
  scene('F25', '这个辣吗？', 'Ini pedas nggak?', '这个辣不辣？',
    '“形容词 + nggak?” 是常见口语问法，这里用来确认菜品辣不辣。', [
      { term: 'pedas nggak?', meaning: '辣不辣？' },
      { term: 'nggak', meaning: '不；tidak 的常见口语形式' },
    ]),
  scene('F26', '哪个不辣？', 'Yang nggak pedas yang mana?', '哪个是不辣的？',
    '面对多个选项时，用 “yang mana” 问是哪一个；前面的 “yang nggak pedas” 限定为不辣的。', [
      { term: 'yang nggak pedas', meaning: '不辣的那个；不辣的' },
      { term: 'yang mana?', meaning: '哪一个？' },
    ]),
  scene('F27', '这个是什么？', 'Ini apa?', '这个是什么？',
    '指着菜单或菜品询问名称时，这是最简短直接的说法。', [
      { term: 'ini', meaning: '这个' },
      { term: 'apa?', meaning: '什么？' },
    ]),
  scene('F28', '这个怎么吃？', 'Ini makannya gimana?', '这个怎么吃？',
    '遇到不熟悉的食物时，“makannya gimana” 是口语里的“要怎么吃”。', [
      { term: 'makannya', meaning: '吃法；这里指这个东西怎么吃' },
      { term: 'gimana?', meaning: '怎么？；bagaimana 的口语形式' },
    ]),
  scene('F29', '我们再加一个', 'Mau tambah satu lagi, ya.', '我们再加一个。',
    '继续加点时，“tambah satu lagi” 表示再加一个或再加一份。', [
      { term: 'mau tambah', meaning: '想再加；要加点' },
      { term: 'satu lagi', meaning: '再一个；再一份' },
    ]),
  scene('F30', '再加这个', 'Tambah yang ini satu, ya.', '这个再加一份。',
    '指着菜单加点时，“yang ini” 指所选的这一项，“satu” 表示一份。', [
      { term: 'tambah', meaning: '再加；加点' },
      { term: 'yang ini', meaning: '这个；这一项' },
      { term: 'satu', meaning: '一个；一份' },
    ]),
  scene('F31', '这个要两份', 'Yang ini dua, ya.', '这个要两份。',
    '指着菜单说数量时，可以直接用 “yang ini + 数量”。', [
      { term: 'yang ini', meaning: '这个；这一项' },
      { term: 'dua', meaning: '两个；两份' },
    ]),
  scene('F32', '这个不要了', 'Yang ini nggak jadi, ya.', '这个不要了/取消这个。',
    '点单过程中改变主意时，“nggak jadi” 表示不要了、算了或取消原来的决定。', [
      { term: 'yang ini', meaning: '这个；这一项' },
      { term: 'nggak jadi', meaning: '不要了；算了；取消了' },
    ], '“nggak jadi” 很常用，也可以说 “nggak jadi beli” 表示不买了。'),
  scene('F33', '我们点的这个还没上', 'Yang ini belum keluar, ya?', '我们点的这个还没上吗？',
    '在餐厅催菜时，“belum keluar” 指菜还没上或还没出餐，不是字面上的“还没出去”。', [
      { term: 'yang ini', meaning: '这个；这道菜' },
      { term: 'belum keluar', meaning: '还没上；还没出餐' },
    ], '餐厅语境决定 “keluar” 指从厨房出餐；不要机械理解成“出去”。'),
  scene('F34', '还有菜没上', 'Masih ada makanan yang belum keluar.', '还有菜没上。',
    '向服务员说明订单尚未全部上齐时，用 “masih ada” 表示还有。', [
      { term: 'masih ada', meaning: '还有；仍然有' },
      { term: 'makanan yang belum keluar', meaning: '还没上的菜；还没出餐的食物' },
    ]),
  scene('F35', '可以快一点吗？', 'Bisa agak cepat nggak, Mas/Mbak?', '可以稍微快一点吗？',
    '催菜时用 “agak cepat” 表示稍微快一点；“nggak?” 构成自然口语问句，并用 “Mas/Mbak” 礼貌称呼男女服务人员。', [
      { term: 'agak cepat', meaning: '稍微快一点' },
      { term: 'nggak?', meaning: '这里用于构成口语问句' },
      { term: 'Mas/Mbak', meaning: '对男性/女性服务人员的常见礼貌称呼' },
    ]),
  scene('F36', '这个不是我们点的', 'Ini bukan pesanan kami.', '这个不是我们点的。',
    '服务员上错菜时，用 “bukan pesanan kami” 明确说明这不是本桌的订单。', [
      { term: 'bukan', meaning: '不是' },
      { term: 'pesanan kami', meaning: '我们点的；我们的订单' },
    ]),
  scene('F37', '我们没有点这个', 'Kami nggak pesan ini.', '我们没点这个。',
    '发现多出菜品时，用 “nggak pesan” 表示没有点过。', [
      { term: 'kami', meaning: '我们（不包括听话人）' },
      { term: 'nggak pesan', meaning: '没有点；没下单' },
    ]),
  scene('F38', '可以帮我换一下吗？', 'Bisa tolong ganti yang ini?', '可以帮我换一下这个吗？',
    '需要更换菜品或餐具时，“bisa tolong...” 是礼貌提出请求的结构。', [
      { term: 'bisa tolong...?', meaning: '可以帮忙……吗？' },
      { term: 'ganti yang ini', meaning: '换一下这个' },
    ]),
  scene('F39', '再给我一个碗', 'Minta mangkuk satu lagi, ya.', '再给我一个碗。',
    '已有餐具后，用 “satu lagi” 表示再要一个。', [
      { term: 'minta', meaning: '要；麻烦给' },
      { term: 'mangkuk', meaning: '碗' },
      { term: 'satu lagi', meaning: '再一个' },
    ]),
  scene('F40', '给我一个勺子', 'Minta sendok satu, ya.', '给我一个勺子。',
    '向服务员补要餐具时，可以用 “minta + 物品 + 数量”。', [
      { term: 'minta', meaning: '要；麻烦给' },
      { term: 'sendok', meaning: '勺子' },
      { term: 'satu', meaning: '一个' },
    ]),
  scene('F41', '给我一双筷子', 'Minta sumpit satu pasang, ya.', '给我一双筷子。',
    '筷子的数量常用 “satu pasang” 表示一双。', [
      { term: 'sumpit', meaning: '筷子' },
      { term: 'satu pasang', meaning: '一双；一对' },
    ]),
  scene('F42', '给我一些纸巾', 'Minta tisu, ya.', '给我一些纸巾。',
    '在餐桌上补要纸巾时，不必说明数量，直接说 “minta tisu” 即可。', [
      { term: 'minta', meaning: '要；麻烦给' },
      { term: 'tisu', meaning: '纸巾' },
    ]),
  scene('F43', '可以打包吗？', 'Bisa dibungkus?', '可以打包吗？',
    '询问食物能否带走时，“dibungkus” 在餐厅语境中就是打包。', [
      { term: 'bisa...?', meaning: '可以……吗？' },
      { term: 'dibungkus', meaning: '打包；包起来带走' },
    ], '常听到 “Makan di sini atau dibungkus?”，意思是“在这里吃还是打包？”。'),
  scene('F44', '剩下的帮我打包', 'Sisanya tolong dibungkus, ya.', '剩下的帮我打包。',
    '用 “sisanya” 指吃剩下的部分，再用 “tolong dibungkus” 请服务员打包。', [
      { term: 'sisanya', meaning: '剩下的；其余部分' },
      { term: 'tolong dibungkus', meaning: '请帮忙打包' },
    ]),
  scene('F45', '买单', 'Minta bill-nya, ya.', '麻烦买单。',
    '用餐结束后向服务员要账单；“bill-nya” 是餐厅里常见的说法。', [
      { term: 'minta', meaning: '要；麻烦给' },
      { term: 'bill-nya', meaning: '账单' },
    ]),
  scene('F46', '可以用 QRIS 吗？', 'Bisa bayar pakai QRIS?', '可以用 QRIS 付款吗？',
    '结账前用 “bayar pakai QRIS” 询问能否通过 QRIS 付款。', [
      { term: 'bisa bayar', meaning: '可以付款' },
      { term: 'pakai QRIS', meaning: '用 QRIS 付款' },
    ], '这里只是在确认付款方式，不涉及开户或其他金融操作。'),
  scene('F47', '可以转账吗？', 'Bisa bayar lewat transfer?', '可以转账付款吗？',
    '询问付款渠道时，“lewat transfer” 表示通过转账来支付。', [
      { term: 'bisa bayar', meaning: '可以付款' },
      { term: 'lewat transfer', meaning: '通过转账' },
    ]),
  scene('F48', '可以付现金吗？', 'Bisa bayar tunai?', '可以付现金吗？',
    '结账时用 “bayar tunai” 确认是否接受现金付款。', [
      { term: 'bisa bayar', meaning: '可以付款' },
      { term: 'tunai', meaning: '现金；现金支付' },
    ]),
  scene('F49', '可以刷卡吗？', 'Bisa bayar pakai kartu?', '可以刷卡吗？',
    '询问是否能用卡付款时，用 “bayar pakai kartu”。', [
      { term: 'bisa bayar', meaning: '可以付款' },
      { term: 'pakai kartu', meaning: '用卡付款；刷卡' },
    ]),
  scene('F50', '钱到账了吗？', 'Pembayarannya sudah masuk?', '付款已经到账了吗？',
    '完成电子付款后，用这句话确认对方是否已经收到款；这里 “sudah masuk” 指到账。', [
      { term: 'pembayarannya', meaning: '这笔付款；付款款项' },
      { term: 'sudah masuk', meaning: '已经到账；已经收到款' },
    ], '付款语境里的 “masuk” 要按“到账”理解，不是普通的“进入”。'),
];

export const restaurantOrderingReuse = {
  F05: 'EXP-LIF-097',
  F07: 'EXP-LIF-096',
} as const;

const reusedIds = new Set<string>(Object.keys(restaurantOrderingReuse));

export const newRestaurantOrderingScenes = restaurantOrderingScenes.filter((item) => !reusedIds.has(item.id));
