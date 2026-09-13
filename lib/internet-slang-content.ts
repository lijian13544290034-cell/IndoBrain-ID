export type InternetSlangStatus = 'COMMON' | 'TRENDING' | 'VOLATILE';

export type InternetSlangConceptSeed = {
  code: string;
  key: string;
  indonesian: string;
  chinese: string;
  status: InternetSlangStatus;
  realUse: { indonesian: string; chinese: string };
  note?: string;
  relatedSceneIds?: string[];
};

export const internetSlangConcepts: InternetSlangConceptSeed[] = [
  { code: 'G01', key: 'slang-baper', indonesian: 'baper', chinese: '太走心 / 太当真 / 动感情', status: 'COMMON', realUse: { indonesian: 'Jangan baper, aku cuma bercanda.', chinese: '别太当真，我只是开玩笑。' }, note: 'baper = bawa perasaan' },
  { code: 'G02', key: 'slang-salting', indonesian: 'salting', chinese: '因为紧张、暧昧、被夸等而不知所措', status: 'COMMON', realUse: { indonesian: 'Dia bikin aku salting.', chinese: '他/她搞得我都不好意思了。' }, note: 'salting = salah tingkah', relatedSceneIds: ['EXP-SOC-306'] },
  { code: 'G03', key: 'slang-bucin', indonesian: 'bucin', chinese: '恋爱脑 / 对对象宠得过头', status: 'COMMON', realUse: { indonesian: 'Sejak punya pacar, dia bucin banget.', chinese: '自从谈恋爱以后，他/她特别恋爱脑。' }, note: 'bucin = budak cinta' },
  { code: 'G04', key: 'slang-mager', indonesian: 'mager', chinese: '懒得动', status: 'COMMON', realUse: { indonesian: 'Mau keluar, tapi mager.', chinese: '想出去，但是懒得动。' }, note: 'mager = malas gerak' },
  { code: 'G05', key: 'slang-gabut', indonesian: 'gabut', chinese: '没事干 / 无聊', status: 'COMMON', realUse: { indonesian: 'Lagi gabut nih.', chinese: '现在好无聊 / 正闲着呢。' } },
  { code: 'G06', key: 'slang-kepo', indonesian: 'kepo', chinese: '特别好奇 / 爱打听', status: 'COMMON', realUse: { indonesian: 'Kepo banget sih kamu.', chinese: '你也太爱打听了吧。' } },
  { code: 'G07', key: 'slang-gercep', indonesian: 'gercep', chinese: '动作快 / 赶紧行动', status: 'COMMON', realUse: { indonesian: 'Gercep dong, keburu habis!', chinese: '快点啊，不然就卖完了！' }, note: 'gercep = gerak cepat' },
  { code: 'G08', key: 'slang-gamon', indonesian: 'gamon', chinese: '对前任/过去感情走不出来', status: 'COMMON', realUse: { indonesian: 'Dia masih gamon sama mantannya.', chinese: '他/她还是忘不了前任。' }, note: 'gamon = gagal move on' },
  { code: 'G09', key: 'slang-spill', indonesian: 'spill', chinese: '快分享 / 快告诉我', status: 'COMMON', realUse: { indonesian: 'Spill tempatnya dong.', chinese: '快告诉我这是哪里。' }, note: 'Spill + noun + dong.' },
  { code: 'G10', key: 'slang-pansos', indonesian: 'pansos', chinese: '蹭热度 / 借别人提高自己曝光', status: 'COMMON', realUse: { indonesian: 'Dia cuma pansos.', chinese: '他/她就是在蹭热度。' }, note: 'pansos = panjat sosial' },
  { code: 'G11', key: 'slang-salfok', indonesian: 'salfok', chinese: '注意力跑到别的地方', status: 'COMMON', realUse: { indonesian: 'Aku malah salfok sama bajunya.', chinese: '我反而一直注意他的衣服。' }, note: 'salfok = salah fokus' },
  { code: 'G12', key: 'slang-ghosting', indonesian: 'ghosting', chinese: '突然消失、不回复、不联系', status: 'COMMON', realUse: { indonesian: 'Abis ketemu sekali, dia langsung ghosting aku.', chinese: '见过一次以后，他/她就直接消失不理我了。' }, relatedSceneIds: ['EXP-LIF-213'] },
  { code: 'G13', key: 'slang-red-flag', indonesian: 'red flag', chinese: '关系中的危险信号', status: 'COMMON', realUse: { indonesian: 'Cowok kayak gitu red flag banget.', chinese: '这种男生真的很危险 / 很不适合交往。' } },
  { code: 'G14', key: 'slang-green-flag', indonesian: 'green flag', chinese: '健康、值得交往的积极信号', status: 'COMMON', realUse: { indonesian: 'Dia perhatian tapi gak posesif. Green flag.', chinese: '他/她很体贴，但不会控制欲太强，这就是加分项。' } },
  { code: 'G15', key: 'slang-overthinking', indonesian: 'overthinking', chinese: '想太多 / 过度担心', status: 'COMMON', realUse: { indonesian: 'Udah, jangan overthinking.', chinese: '好了，别想太多了。' } },
  { code: 'G16', key: 'slang-healing', indonesian: 'healing', chinese: '出去放松 / 散心', status: 'COMMON', realUse: { indonesian: 'Weekend ini mau healing ke Bali.', chinese: '这个周末想去巴厘岛放松一下。' }, note: 'In Indonesian social-media speech, “healing” is often used more casually than its original English meaning.' },
  { code: 'G17', key: 'slang-nongkrong', indonesian: 'nongkrong', chinese: '一起坐坐 / 聚会 / hang out', status: 'COMMON', realUse: { indonesian: 'Malam ini nongkrong di mana?', chinese: '今晚去哪里坐坐？' }, relatedSceneIds: ['EXP-SOC-009'] },
  { code: 'G18', key: 'slang-pdkt', indonesian: 'PDKT', chinese: '正式恋爱前的接近、追求、暧昧了解阶段', status: 'COMMON', realUse: { indonesian: 'Kalian lagi PDKT, ya?', chinese: '你们俩现在是在互相了解/暧昧阶段吧？' }, note: 'PDKT = pendekatan', relatedSceneIds: ['EXP-SOC-307', 'EXP-SOC-308'] },
  { code: 'G19', key: 'slang-hts', indonesian: 'HTS', chinese: '没有正式名分的暧昧关系', status: 'COMMON', realUse: { indonesian: 'Udah dekat lama tapi masih HTS.', chinese: '都暧昧这么久了，还是没有正式确定关系。' }, note: 'HTS = hubungan tanpa status', relatedSceneIds: ['EXP-SOC-313'] },
  { code: 'G20', key: 'slang-flexing', indonesian: 'flexing', chinese: '炫耀', status: 'COMMON', realUse: { indonesian: 'Isinya flexing terus.', chinese: '发的东西全是在炫耀。' } },
  { code: 'G21', key: 'slang-relate', indonesian: 'relate', chinese: '很有共鸣 / 太像我了', status: 'COMMON', realUse: { indonesian: 'Wah, relate banget sama hidup gue.', chinese: '哇，这跟我的生活也太像了。' }, note: 'Preserve “gue” here because the point is authentic informal internet/social speech.' },
  { code: 'G22', key: 'slang-vibes', indonesian: 'vibes', chinese: '氛围 / 感觉', status: 'COMMON', realUse: { indonesian: 'Tempat ini vibes-nya enak.', chinese: '这个地方氛围很舒服。' } },
  { code: 'G23', key: 'slang-glow-up', indonesian: 'glow up', chinese: '整个人变漂亮/变帅/状态明显升级', status: 'COMMON', realUse: { indonesian: 'Kamu glow up banget sekarang.', chinese: '你现在真的变化好大，整个人都变好看了。' } },
  { code: 'G24', key: 'slang-soft-launch', indonesian: 'soft launch', chinese: '不正式公布，但在社交媒体暗示自己有对象', status: 'COMMON', realUse: { indonesian: 'Dia soft launch pacar barunya di IG.', chinese: '他/她在 Instagram 上偷偷暗示自己有新对象了。' } },
  { code: 'T01', key: 'slang-gemoy', indonesian: 'gemoy', chinese: '他/她也太可爱了吧。', status: 'TRENDING', realUse: { indonesian: 'Gemoy banget sih dia.', chinese: '他/她也太可爱了吧。' }, note: 'Playful form associated with “gemas/gemes”.' },
  { code: 'T02', key: 'slang-paket-lengkap', indonesian: 'paket lengkap', chinese: '漂亮、聪明、人又好，简直全套配置', status: 'TRENDING', realUse: { indonesian: 'Cantik, pintar, baik lagi. Paket lengkap.', chinese: '漂亮、聪明、人又好，简直全套配置。' } },
  { code: 'T03', key: 'slang-delulu', indonesian: 'delulu', chinese: '活在自己的幻想里 / 自我幻想式调侃', status: 'TRENDING', realUse: { indonesian: 'Jangan delulu dulu.', chinese: '先别自己脑补了。' } },
  { code: 'T04', key: 'slang-yapping', indonesian: 'yapping', chinese: '一直说个不停 / 话很多', status: 'TRENDING', realUse: { indonesian: 'Maaf ya, aku yapping terus.', chinese: '不好意思啊，我一直说个不停。' } },
  { code: 'T05', key: 'slang-rizz', indonesian: 'rizz', chinese: '撩人/吸引异性的能力', status: 'VOLATILE', realUse: { indonesian: 'Rizz dia kuat juga.', chinese: '他还挺会撩的。' } },
  { code: 'T06', key: 'slang-aura', indonesian: 'aura', chinese: '网络语境下对一个人气场/魅力值的调侃表达', status: 'VOLATILE', realUse: { indonesian: 'Aura bosnya kuat banget.', chinese: '他的老板气场也太强了。' } },
];

export const internetSlangRealUseUnits = Array.from({ length: Math.ceil(internetSlangConcepts.length / 8) }, (_, index) => {
  const concepts = internetSlangConcepts.slice(index * 8, index * 8 + 8);
  return {
    id: `real-use-be-slang-g${String(index + 1).padStart(3, '0')}`,
    type: 'sentence' as const,
    titleZh: index < 3 ? `网络流行词 · 常用 ${index + 1}` : '网络流行词 · 正流行与可能过时',
    status: 'active' as const,
    items: concepts.map((concept) => ({
      indonesian: concept.realUse.indonesian,
      chinese: concept.realUse.chinese,
      ttsText: concept.realUse.indonesian,
      conceptIds: [concept.key],
    })),
  };
});
