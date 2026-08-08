import type { LifeExperience } from '@/lib/life-experiences';
import type { WorkplacePattern } from '@/lib/workplace-patterns';

const p = (indonesian: string, chinese: string): WorkplacePattern => ({ indonesian, chinese });

const lesson = (
  id: string,
  task: string,
  indonesian: string,
  explanation: string,
  harvest: string[],
  pattern: WorkplacePattern,
  tags: string[],
  difficultyLevel: 'L1' | 'L2' | 'L3' = 'L1',
): LifeExperience => ({
  id, category: 'home', task, chinese: task, indonesian, explanation, harvest, pattern,
  tags: ['LIFE_HOME', '生活居家', ...tags], difficultyLevel, requiredMembershipTier: 'TRIAL', status: 'PUBLISHED',
});

/** V2.1A-L1: high-frequency, natural household communication in the stable Experience model. */
export const livingHomeExperiences: LifeExperience[] = [
  // 起床睡觉（8）
  lesson('EXP-LIF-224', '我先起床了。', 'Aku bangun dulu ya.', '早上先起床、离开房间时，用轻松的口语告诉家人或同住的人。', ['aku（我）', 'bangun（起床）', 'dulu（先）'], p('Aku [kegiatan] dulu ya.', '我先[做某事]。'), ['起床睡觉', '家庭成员', '时间']),
  lesson('EXP-LIF-225', '我想再睡一会儿。', 'Aku mau tidur lagi sebentar.', '还没睡够时，向家人自然地说自己想再睡一会儿。', ['mau（想要）', 'tidur lagi（再睡）', 'sebentar（一会儿）'], p('Aku mau [kegiatan] lagi sebentar.', '我想再[做某事]一会儿。'), ['起床睡觉', '状态描述', '时间']),
  lesson('EXP-LIF-226', '等一下叫我起床。', 'Nanti bangunin aku ya.', '需要别人稍后叫醒你时，用 bangunin 表达“叫醒”。', ['nanti（等一下）', 'bangunin（叫醒）', 'aku（我）'], p('Nanti [kata kerja] aku ya.', '等一下[做某事]我。'), ['起床睡觉', '请求', '时间']),
  lesson('EXP-LIF-227', '我昨晚没睡好。', 'Tadi malam aku kurang tidur.', '早上说明昨晚睡得不够、状态不太好时可以这样说。', ['tadi malam（昨晚）', 'kurang tidur（睡得不够）', 'aku（我）'], p('Aku kurang [kegiatan].', '我[做某事]得不够。'), ['起床睡觉', '状态描述']),
  lesson('EXP-LIF-228', '我睡不着。', 'Aku nggak bisa tidur.', '晚上失眠或暂时睡不着时，直接说明自己的状态。', ['nggak bisa（不能）', 'tidur（睡觉）', 'aku（我）'], p('Aku nggak bisa [kegiatan].', '我不能[做某事]。'), ['起床睡觉', '状态描述']),
  lesson('EXP-LIF-229', '我去准备睡觉了。', 'Aku siap-siap tidur dulu ya.', '准备洗漱、上床前，用 siap-siap tidur 表达“准备睡觉”。', ['siap-siap（准备）', 'tidur（睡觉）', 'dulu（先）'], p('Aku siap-siap [kegiatan] dulu ya.', '我先准备[做某事]。'), ['起床睡觉', '家庭成员', '时间']),
  lesson('EXP-LIF-230', '我先睡了，晚安。', 'Aku tidur dulu ya, selamat malam.', '准备结束当天的聊天、先回房休息时，用自然口语道晚安。', ['aku（我）', 'tidur dulu（先睡）', 'selamat malam（晚安）'], p('Aku [kegiatan] dulu ya.', '我先[做某事]。'), ['起床睡觉', '家庭成员']),
  lesson('EXP-LIF-231', '闹钟定在六点半。', 'Pasang alarm jam setengah tujuh ya.', '请家人帮忙设闹钟或确认闹钟时间时使用；setengah tujuh 是六点半。', ['pasang alarm（设闹钟）', 'jam setengah tujuh（六点半）', 'ya（语气词）'], p('Pasang alarm jam [waktu] ya.', '把闹钟定在[时间]。'), ['起床睡觉', '时间', '请求'], 'L2'),

  // 厕所洗澡（10）
  lesson('EXP-LIF-232', '我想去一下洗手间。', 'Aku mau ke toilet sebentar.', '在家里、朋友家或公共场所，礼貌说明自己想去洗手间。', ['mau（想要）', 'ke toilet（去洗手间）', 'sebentar（一会儿）'], p('Aku mau ke [tempat] sebentar.', '我想去[地点]一会儿。'), ['厕所洗澡', '请求']),
  lesson('EXP-LIF-233', '洗手间在哪里？', 'Toiletnya di mana ya?', '在陌生地方找洗手间时，简短而自然的问法。', ['toiletnya（洗手间）', 'di mana（在哪里）', 'ya（语气词）'], p('[Tempat]nya di mana ya?', '[地点]在哪里？'), ['厕所洗澡', '请求']),
  lesson('EXP-LIF-234', '我先去洗个澡。', 'Aku mandi dulu ya.', '回家、运动后或准备出门前，告诉家人自己先去洗澡。', ['mandi（洗澡）', 'dulu（先）', 'aku（我）'], p('Aku [kegiatan] dulu ya.', '我先[做某事]。'), ['厕所洗澡', '家庭成员']),
  lesson('EXP-LIF-235', '热水器好像没开。', 'Water heater-nya kayak belum nyala.', '洗澡前没有热水时，先自然确认热水器是不是还没打开。', ['water heater（热水器）', 'kayak（好像）', 'belum nyala（还没开）'], p('[Barang]nya kayak belum [keadaan].', '[物品]好像还没[状态]。'), ['厕所洗澡', '状态描述', '家庭操作']),
  lesson('EXP-LIF-236', '水太烫了。', 'Airnya panas banget.', '试水时觉得烫手，用 panas banget 直接描述水温太高。', ['airnya（水）', 'panas（烫）', 'banget（非常）'], p('[Barang]nya panas banget.', '直接描述东西很烫。'), ['厕所洗澡', '状态描述']),
  lesson('EXP-LIF-237', '水有点太冷。', 'Airnya terlalu dingin.', '洗澡时水温太低，直接描述“太冷”。', ['airnya（水）', 'terlalu（太）', 'dingin（冷）'], p('[Barang]nya terlalu [sifat].', '[物品]太[形容]。'), ['厕所洗澡', '状态描述']),
  lesson('EXP-LIF-238', '卫生纸没有了。', 'Tisu toiletnya habis.', '发现卫生纸用完时，提醒家人及时补充。', ['tisu toilet（卫生纸）', 'habis（用完）', 'nya（指代语尾）'], p('[Barang]nya habis.', '[物品]用完了。'), ['厕所洗澡', '家庭操作', '状态描述']),
  lesson('EXP-LIF-239', '等一下，我马上出来。', 'Sebentar ya, aku keluar.', '洗手间有人敲门时，说明自己马上会出来。', ['sebentar（一会儿）', 'keluar（出来）', 'aku（我）'], p('Sebentar ya, aku [kegiatan].', '等一下，我[做某事]。'), ['厕所洗澡', '请求', '时间']),
  lesson('EXP-LIF-240', '帮我拿条毛巾好吗？', 'Tolong ambilin handuk buat aku, ya.', '洗澡后忘拿毛巾时，向家人礼貌求助。', ['tolong（请）', 'ambilin（拿给）', 'handuk（毛巾）', 'buat aku（给我）'], p('Tolong ambilin [barang] buat aku.', '请帮我拿[物品]给我。'), ['厕所洗澡', '请求', '家庭成员']),
  lesson('EXP-LIF-241', '我的洗漱用品放哪儿？', 'Perlengkapan mandi aku ditaruh di mana?', '搬家、住亲友家或整理浴室时，询问洗漱用品的位置。', ['perlengkapan mandi（洗漱用品）', 'ditaruh（被放在）', 'di mana（在哪里）'], p('[Barang] aku ditaruh di mana?', '我的[物品]放在哪里？'), ['厕所洗澡', '请求', '家庭操作'], 'L2'),

  // 厨房做饭（12）
  lesson('EXP-LIF-242', '我饿了，家里有吃的吗？', 'Aku lapar, ada makanan di rumah?', '回家后肚子饿，先问家里有没有现成的食物。', ['lapar（饿）', 'makanan（食物）', 'di rumah（在家）'], p('Ada [barang] di rumah?', '家里有[物品]吗？'), ['厨房做饭', '状态描述', '家庭成员']),
  lesson('EXP-LIF-243', '今天想吃什么？', 'Hari ini mau makan apa?', '准备做饭或点餐前，最自然地问家人想吃什么。', ['hari ini（今天）', 'mau makan（想吃）', 'apa（什么）'], p('[Waktu] mau makan apa?', '[时间]想吃什么？'), ['厨房做饭', '家庭成员']),
  lesson('EXP-LIF-244', '我来做饭吧。', 'Biar aku yang masak ya.', '主动提出自己做饭时，用 biar aku yang… 很自然。', ['biar aku yang（让我来）', 'masak（做饭）', 'ya（语气词）'], p('Biar aku yang [kegiatan] ya.', '让我来[做某事]吧。'), ['厨房做饭', '家庭成员', '请求']),
  lesson('EXP-LIF-245', '帮我洗一下菜。', 'Tolong cuci sayurnya dulu.', '做饭时请家人协助洗菜；dulu 表示先做这一步。', ['tolong（请）', 'cuci（洗）', 'sayurnya（蔬菜）', 'dulu（先）'], p('Tolong [kata kerja] [barang] dulu.', '请先[做某事][物品]。'), ['厨房做饭', '请求', '家庭成员']),
  lesson('EXP-LIF-246', '这些菜帮我切一下。', 'Sayurnya tolong dipotong ya.', '需要别人帮忙切菜时，用被动式 dipotong 很常见。', ['sayurnya（蔬菜）', 'tolong（请）', 'dipotong（切好）'], p('[Barang]nya tolong di[kata kerja] ya.', '请把[物品][做某事]一下。'), ['厨房做饭', '请求', '家庭成员'], 'L2'),
  lesson('EXP-LIF-247', '盐放在哪里？', 'Garamnya di mana ya?', '做饭时一时找不到盐，用简短问法询问位置。', ['garam（盐）', 'di mana（在哪里）', 'ya（语气词）'], p('[Barang]nya di mana ya?', '[物品]在哪里？'), ['厨房做饭', '请求']),
  lesson('EXP-LIF-248', '家里没米了。', 'Beras di rumah habis.', '准备做饭才发现大米用完时，及时提醒家人。', ['beras（大米）', 'di rumah（在家）', 'habis（用完）'], p('[Barang] di rumah habis.', '家里的[物品]用完了。'), ['厨房做饭', '状态描述', '家庭操作']),
  lesson('EXP-LIF-249', '这个材料没有了。', 'Bahan ini sudah habis.', '发现某种食材或配料没有了，做饭前说明缺少什么。', ['bahan（材料、食材）', 'sudah habis（已经用完）', 'ini（这个）'], p('[Barang] ini sudah habis.', '这个[物品]已经用完了。'), ['厨房做饭', '状态描述']),
  lesson('EXP-LIF-250', '饭做好了，可以吃了。', 'Makanannya sudah siap, ayo makan.', '饭菜准备好后，招呼家人开饭时的自然表达。', ['makanannya（饭菜）', 'sudah siap（做好了）', 'ayo makan（来吃饭）'], p('[Makanan] sudah siap, ayo makan.', '[食物]做好了，来吃饭。'), ['厨房做饭', '家庭成员']),
  lesson('EXP-LIF-251', '这个有点咸。', 'Ini agak asin.', '尝菜时觉得偏咸，用 agak 缓和语气，避免太直接。', ['ini（这个）', 'agak（有点）', 'asin（咸）'], p('Ini agak [rasa].', '这个有点[味道]。'), ['厨房做饭', '状态描述']),
  lesson('EXP-LIF-252', '这个太辣了。', 'Ini pedas banget.', '吃到明显太辣的食物时，自然表达自己的感受。', ['pedas（辣）', 'banget（非常）', 'ini（这个）'], p('Ini [sifat] banget.', '这个非常[形容]。'), ['厨房做饭', '状态描述']),
  lesson('EXP-LIF-253', '我已经吃饱了。', 'Aku sudah kenyang.', '用餐后礼貌地说自己已经吃饱，不需要再添饭。', ['sudah（已经）', 'kenyang（饱）', 'aku（我）'], p('Aku sudah [keadaan].', '我已经[状态]了。'), ['厨房做饭', '状态描述']),

  // 饮水（10）
  lesson('EXP-LIF-254', '我渴了，想喝水。', 'Aku haus, mau minum air.', '日常最直接地表达口渴并想喝水。', ['haus（渴）', 'mau minum（想喝）', 'air（水）'], p('Aku [keadaan], mau [kegiatan].', '我[状态]，想[做某事]。'), ['饮水', '状态描述']),
  lesson('EXP-LIF-255', '有干净的饮用水吗？', 'Ada air minum yang bersih?', '在家、办公室或朋友家确认是否有可直接喝的水。', ['ada（有吗）', 'air minum（饮用水）', 'bersih（干净）'], p('Ada [barang] yang [sifat]?', '有[形容]的[物品]吗？'), ['饮水', '请求']),
  lesson('EXP-LIF-256', '帮我拿个杯子。', 'Tolong ambilin gelas, ya.', '想喝水却没有杯子时，请家人顺手拿一个杯子。', ['tolong（请）', 'ambilin（拿给）', 'gelas（杯子）'], p('Tolong ambilin [barang], ya.', '请帮我拿[物品]。'), ['饮水', '请求', '家庭成员']),
  lesson('EXP-LIF-257', '我想喝热水。', 'Aku mau minum air hangat.', '觉得凉或不想喝冰水时，air hangat 指温热水。', ['mau minum（想喝）', 'air hangat（温水）', 'aku（我）'], p('Aku mau minum [minuman].', '我想喝[饮料]。'), ['饮水', '状态描述']),
  lesson('EXP-LIF-258', '给我一杯冰水吧。', 'Minta satu gelas air es, ya.', '天气热或吃辣后，向家人或店员要一杯冰水。', ['minta（要）', 'satu gelas（一杯）', 'air es（冰水）'], p('Minta satu gelas [minuman], ya.', '要一杯[饮料]。'), ['饮水', '请求']),
  lesson('EXP-LIF-259', '我想喝咖啡。', 'Aku pengin ngopi.', '在家或休息时，用 ngopi 表达“想喝杯咖啡”，很口语。', ['pengin（想）', 'ngopi（喝咖啡）', 'aku（我）'], p('Aku pengin [kegiatan].', '我想[做某事]。'), ['饮水', '状态描述']),
  lesson('EXP-LIF-260', '我要一杯热茶。', 'Aku mau satu teh panas, ya.', '在家或小店点一杯热茶时，简短自然。', ['satu（一杯）', 'teh panas（热茶）', 'ya（语气词）'], p('Aku mau satu [minuman], ya.', '我要一杯[饮料]。'), ['饮水', '请求']),
  lesson('EXP-LIF-261', '慢点喝，烫。', 'Pelan-pelan, masih panas.', '提醒家人或孩子饮料还烫，要慢慢喝。', ['pelan-pelan（慢一点）', 'masih（还）', 'panas（烫）'], p('Pelan-pelan, masih [sifat].', '慢一点，还很[形容]。'), ['饮水', '家庭成员', '请求']),
  lesson('EXP-LIF-262', '等一下，我去倒水。', 'Sebentar, aku ambil minum dulu.', '有人要喝水时，告诉对方自己先去拿饮料。', ['sebentar（一会儿）', 'ambil minum（拿喝的）', 'dulu（先）'], p('Sebentar, aku [kegiatan] dulu.', '等一下，我先[做某事]。'), ['饮水', '时间', '家庭成员']),
  lesson('EXP-LIF-263', '谢谢，正好我很渴。', 'Makasih ya, aku memang haus.', '别人递水给你时，用 memang haus 表达“我确实正渴”。', ['makasih（谢谢）', 'memang（确实）', 'haus（渴）'], p('Makasih ya, aku memang [keadaan].', '谢谢，我确实[状态]。'), ['饮水', '状态描述', '家庭成员']),

  // 家庭操作（10）
  lesson('EXP-LIF-264', '帮我把门打开。', 'Tolong bukain pintunya.', '手上拿着东西或不方便时，请家人帮忙开门。', ['tolong（请）', 'bukain（打开）', 'pintunya（门）'], p('Tolong bukain [barang]nya.', '请帮我打开[物品]。'), ['家庭操作', '请求', '家庭成员']),
  lesson('EXP-LIF-265', '门先关上吧。', 'Pintunya ditutup dulu ya.', '出门、开空调或需要安静时，请人先把门关上。', ['pintunya（门）', 'ditutup（关上）', 'dulu（先）'], p('[Barang]nya di[kata kerja] dulu ya.', '请先把[物品][做某事]。'), ['家庭操作', '请求']),
  lesson('EXP-LIF-266', '把灯打开一下。', 'Tolong nyalakan lampunya.', '房间暗时，请家人把灯打开；nyalakan 常用于开电器。', ['tolong（请）', 'nyalakan（打开）', 'lampunya（灯）'], p('Tolong nyalakan [barang]nya.', '请打开[物品]。'), ['家庭操作', '请求', '家庭成员']),
  lesson('EXP-LIF-267', '不用的灯关掉吧。', 'Lampu yang nggak dipakai dimatikan ya.', '离开房间或节约用电时，提醒把不用的灯关掉。', ['lampu（灯）', 'nggak dipakai（不用）', 'dimatikan（关掉）'], p('[Barang] yang nggak dipakai di[kata kerja] ya.', '不用的[物品]请[做某事]。'), ['家庭操作', '请求']),
  lesson('EXP-LIF-268', '请把空调打开。', 'Tolong nyalakan AC-nya.', '天气热时，礼貌请家人或同事开空调。', ['tolong（请）', 'nyalakan（打开）', 'AC（空调）'], p('Tolong nyalakan [barang]nya.', '请打开[物品]。'), ['家庭操作', '请求']),
  lesson('EXP-LIF-269', '空调太冷了。', 'AC-nya terlalu dingin.', '觉得空调温度太低时，说明具体问题。', ['AC（空调）', 'terlalu（太）', 'dingin（冷）'], p('[Barang]nya terlalu [sifat].', '[物品]太[形容]了。'), ['家庭操作', '状态描述']),
  lesson('EXP-LIF-270', '窗户打开一点吧。', 'Jendelanya dibuka sedikit aja.', '房间闷时，请人把窗户开一点点通风。', ['jendelanya（窗户）', 'dibuka（打开）', 'sedikit aja（一点点）'], p('[Barang]nya di[kata kerja] sedikit aja.', '把[物品][做某事]一点点。'), ['家庭操作', '请求']),
  lesson('EXP-LIF-271', '窗户关一下，要下雨了。', 'Tolong tutup jendelanya, mau hujan.', '看到快下雨时，马上提醒家人把窗户关上。', ['tolong（请）', 'tutup（关）', 'jendelanya（窗户）', 'mau hujan（要下雨）'], p('Tolong tutup [barang]nya, mau [kejadian].', '请关上[物品]，要[发生情况]了。'), ['家庭操作', '请求', '状态描述']),
  lesson('EXP-LIF-272', '遥控器放在哪里了？', 'Remote-nya ditaruh di mana?', '找不到电视或空调遥控器时，问家人最后放在哪里。', ['remote（遥控器）', 'ditaruh（被放在）', 'di mana（在哪里）'], p('[Barang]nya ditaruh di mana?', '[物品]放在哪里？'), ['家庭操作', '请求']),
  lesson('EXP-LIF-273', '我的手机在充电。', 'HP-ku lagi dicas.', '告诉家人手机正在充电，避免对方误拿或拔掉充电线。', ['HP-ku（我的手机）', 'lagi（正在）', 'dicas（充电）'], p('[Barang] lagi di[kata kerja].', '[物品]正在[做某事]。'), ['家庭操作', '状态描述'], 'L2'),
];
