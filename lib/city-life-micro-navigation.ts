export type CityLifeMicroSectionSlug = 'life-services' | 'social-relationships';

export type CityLifeMicroGroupDefinition = {
  slug: string;
  indonesian: string;
  title: string;
  subtitle: string;
  sourceIds: string[];
};

export type CityLifeMicroSectionDefinition = {
  slug: CityLifeMicroSectionSlug;
  title: string;
  description: string;
  groups: CityLifeMicroGroupDefinition[];
};

const range = (prefix: 'EXP-LIF' | 'EXP-SOC', start: number, end: number) =>
  Array.from({ length: end - start + 1 }, (_, index) => `${prefix}-${String(start + index).padStart(3, '0')}`);

const ids = (prefix: 'EXP-LIF' | 'EXP-SOC', values: number[]) =>
  values.map((value) => `${prefix}-${String(value).padStart(3, '0')}`);

export const cityLifeMicroSceneTaxonomy: CityLifeMicroSectionDefinition[] = [
  {
    slug: 'life-services',
    title: '生活办事',
    description: '今天要去哪里、买什么，或处理哪件生活小事？',
    groups: [
      {
        slug: 'restaurant',
        indonesian: 'Makan di Restoran',
        title: '餐厅吃饭',
        subtitle: '找座位、点餐、口味、加菜、打包和结账。',
        sourceIds: [...range('EXP-LIF', 93, 103), ...range('EXP-LIF', 137, 139)],
      },
      {
        slug: 'supermarket',
        indonesian: 'Belanja di Supermarket',
        title: '超市购物',
        subtitle: '找商品、问价格、称重、包装和付款。',
        sourceIds: range('EXP-LIF', 83, 92),
      },
      {
        slug: 'bank-payments',
        indonesian: 'Bank & Pembayaran',
        title: '银行·支付',
        subtitle: 'ATM、取现、换钱、转账和付款确认。',
        sourceIds: range('EXP-LIF', 112, 117),
      },
      {
        slug: 'medical-pharmacy',
        indonesian: 'Dokter & Apotek',
        title: '医院·药店',
        subtitle: '看医生、说明症状、药物过敏和用药。',
        sourceIds: range('EXP-LIF', 118, 122),
      },
      {
        slug: 'grooming-wellness',
        indonesian: 'Perawatan Diri',
        title: '理发·美容',
        subtitle: '理发、健身和日常个人护理。',
        sourceIds: range('EXP-LIF', 123, 127),
      },
      {
        slug: 'housing-property',
        indonesian: 'Hunian & Pengelola',
        title: '住房·物业',
        subtitle: '门禁、房间问题和物业沟通。',
        sourceIds: range('EXP-LIF', 131, 132),
      },
      {
        slug: 'repairs',
        indonesian: 'Perbaikan',
        title: '维修服务',
        subtitle: '空调、热水和安排人员上门维修。',
        sourceIds: range('EXP-LIF', 128, 130),
      },
      {
        slug: 'delivery-takeout',
        indonesian: 'Paket & Pesan Antar',
        title: '快递·外卖',
        subtitle: '查包裹、前台代收、不在家和到付。',
        sourceIds: range('EXP-LIF', 133, 136),
      },
      {
        slug: 'documents-window',
        indonesian: 'Dokumen & Loket',
        title: '办证·窗口',
        subtitle: '询问文件应该在哪里办理。',
        sourceIds: ids('EXP-LIF', [143]),
      },
      {
        slug: 'hotel-stay',
        indonesian: 'Menginap di Hotel',
        title: '酒店住宿',
        subtitle: '入住、房间和酒店服务沟通。',
        sourceIds: [],
      },
      {
        slug: 'airport-travel',
        indonesian: 'Bandara & Perjalanan',
        title: '机场·旅行',
        subtitle: '问路、叫车、等候、下车和出行安排。',
        sourceIds: range('EXP-LIF', 104, 111),
      },
    ],
  },
  {
    slug: 'social-relationships',
    title: '社交关系',
    description: '从第一次认识，到朋友日常、约见和关系沟通。',
    groups: [
      {
        slug: 'new-friends',
        indonesian: 'Kenalan Baru',
        title: '认识新朋友',
        subtitle: '自我介绍、聊来历、交换联系方式和自然认识。',
        sourceIds: [
          ...range('EXP-SOC', 1, 5),
          ...range('EXP-SOC', 7, 10),
          ...range('EXP-SOC', 51, 54),
        ],
      },
      {
        slug: 'friend-daily',
        indonesian: 'Keseharian Teman',
        title: '朋友日常',
        subtitle: '一起活动、告别、关心到家、感谢和帮忙。',
        sourceIds: [...range('EXP-LIF', 140, 142), ...range('EXP-SOC', 66, 70)],
      },
      {
        slug: 'meals-coffee',
        indonesian: 'Makan & Ngopi',
        title: '约饭·喝咖啡',
        subtitle: '发出邀请、选时间地点、会合和用餐安排。',
        sourceIds: [...range('EXP-SOC', 21, 30), ...range('EXP-SOC', 61, 65)],
      },
      {
        slug: 'daily-chat',
        indonesian: 'Obrolan Sehari-hari',
        title: '日常聊天',
        subtitle: '近况、天气、周末、路况和聊天中的小回应。',
        sourceIds: [
          ...range('EXP-SOC', 11, 13),
          ...range('EXP-SOC', 15, 20),
          ...ids('EXP-SOC', [56, 59]),
        ],
      },
      {
        slug: 'cultural-exchange',
        indonesian: 'Budaya & Kebiasaan',
        title: '文化交流',
        subtitle: '称呼、待客、聊天习惯、礼貌拒绝和告别。',
        sourceIds: range('EXP-SOC', 31, 50),
      },
      {
        slug: 'dating',
        indonesian: 'Kencan & Hubungan',
        title: '恋爱交友',
        subtitle: '表达好感、约会、误会处理、边界和关心。',
        sourceIds: range('EXP-LIF', 199, 223),
      },
      {
        slug: 'business-social',
        indonesian: 'Relasi Profesional',
        title: '商务社交',
        subtitle: '活动认识、聊工作、交换名片和同事间自然联系。',
        sourceIds: ids('EXP-SOC', [6, 14, 55, 57, 58, 60]),
      },
    ],
  },
];

export function getCityLifeMicroSourceIds() {
  return cityLifeMicroSceneTaxonomy.flatMap((section) => section.groups.flatMap((group) => group.sourceIds));
}
