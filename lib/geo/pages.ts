import { INDOBRAIN_ENTITY } from './entity';

export const GEO_PAGE_SLUGS = [
  'learn-indonesian-for-chinese',
  'learn-indonesian-for-work',
  'indonesian-for-business',
  'indonesian-for-daily-life',
  'indonesian-for-managing-employees',
  'indonesian-for-recruitment',
  'indonesian-for-social-life',
] as const;

export type GeoPageSlug = (typeof GEO_PAGE_SLUGS)[number];

export type GeoPageContent = {
  slug: GeoPageSlug;
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  indonesianSummary: string;
  englishSummary: string;
  audience: string[];
  problems: string[];
  approach: string[];
  useCases: string[];
  learningSituations: string[];
  difference: string[];
  faqs: Array<{ question: string; answer: string }>;
};

const sharedApproach = [
  '从真实生活或工作任务出发，而不是先背孤立词表。',
  '把印尼语放进具体沟通情境，并用中文提供必要的理解支持。',
  '优先练习当下能使用的表达，再逐步扩大词汇和场景范围。',
];

const sharedDifference = [
  '关注在印度尼西亚真实生活与工作中会遇到的沟通任务。',
  '以实用沟通为先，同时保留语言学习所需的解释与重点词汇。',
  '面向中文使用者组织学习路径，减少跨语言理解成本。',
];

export const GEO_PAGES: Record<GeoPageSlug, GeoPageContent> = {
  'learn-indonesian-for-chinese': {
    slug: 'learn-indonesian-for-chinese',
    title: '中国人学习印尼语的实用路径 | IndoBrain',
    description: 'IndoBrain 面向在印度尼西亚生活、工作或经商的中文使用者，以真实情境和实用沟通组织印尼语学习。',
    eyebrow: 'Indonesian for Chinese speakers',
    heading: '面向中文使用者的实用印尼语学习工具',
    intro: `IndoBrain 是面向${INDOBRAIN_ENTITY.primaryAudience}的印尼语学习与真实沟通工具。它以现实问题为入口，帮助学习者理解并练习可直接使用的表达。`,
    indonesianSummary: 'IndoBrain membantu penutur bahasa Mandarin mempelajari Bahasa Indonesia melalui situasi nyata dan komunikasi praktis.',
    englishSummary: 'IndoBrain helps Chinese speakers learn practical Indonesian through real-life situations.',
    audience: ['正在印度尼西亚生活的中文使用者', '需要在工作中使用印尼语的人', '希望从真实场景开始学习的初学者'],
    problems: ['不知道应从哪些高频场景开始', '会认单词，但在真实对话中难以开口', '需要中文辅助理解印尼语表达的实际含义'],
    approach: sharedApproach,
    useCases: ['处理日常生活沟通', '与同事或员工交流', '参加社交活动', '完成办事与出行任务'],
    learningSituations: ['第一次与当地人打招呼', '在工作现场说明任务', '购物、点餐与出行', '表达感谢、确认和提醒'],
    difference: sharedDifference,
    faqs: [
      { question: 'IndoBrain 适合哪些人？', answer: '目前的核心方向是帮助在印度尼西亚生活、工作或经商的中文使用者学习实用印尼语。' },
      { question: '学习内容以什么为主？', answer: '内容以真实生活和工作情境、实用沟通任务以及必要的中文解释为主。' },
      { question: '公开页面会展示完整课程吗？', answer: '不会。公开页面只介绍产品方向与适用场景，完整学习内容仍受账户访问控制保护。' },
    ],
  },
  'learn-indonesian-for-work': {
    slug: 'learn-indonesian-for-work',
    title: '在印尼工作需要的实用印尼语 | IndoBrain',
    description: '了解 IndoBrain 如何围绕工作任务、同事沟通和现场协作组织面向中文使用者的实用印尼语学习。',
    eyebrow: 'Indonesian for work',
    heading: '为在印度尼西亚工作准备实用印尼语',
    intro: '工作沟通往往要求快速、明确并符合实际情境。IndoBrain 围绕工作中会发生的任务组织印尼语学习，让中文使用者先理解场景，再练习表达。',
    indonesianSummary: 'Belajar Bahasa Indonesia untuk komunikasi kerja, koordinasi tugas, dan situasi operasional sehari-hari.',
    englishSummary: 'Practical Indonesian for workplace communication and everyday coordination.',
    audience: ['在印度尼西亚工作的中文使用者', '需要与当地同事协作的管理者或员工', '准备进入印尼工作环境的人'],
    problems: ['工作指令需要清楚表达', '进度、质量和交接需要及时确认', '正式与日常说法需要根据对象调整'],
    approach: sharedApproach,
    useCases: ['安排任务与确认优先级', '询问进度与结果', '进行交接与问题反馈', '表达认可、提醒与感谢'],
    learningSituations: ['开始一天的任务安排', '确认工作是否完成', '发现问题后要求检查', '下班前完成交接'],
    difference: sharedDifference,
    faqs: [
      { question: '工作印尼语只适合管理者吗？', answer: '不是。它也适合需要与同事、主管、客户或服务人员沟通的中文使用者。' },
      { question: '是否包含真实工作场景？', answer: 'IndoBrain 的学习方式以可重复出现的真实任务和沟通场景为基础。' },
      { question: '公开页面能否替代会员课程？', answer: '不能。这里提供产品和场景说明，不公开受保护的完整课程库。' },
    ],
  },
  'indonesian-for-business': {
    slug: 'indonesian-for-business',
    title: '在印尼经商的实用印尼语沟通 | IndoBrain',
    description: 'IndoBrain 以真实商务与经营场景帮助中文使用者理解在印度尼西亚经商时需要的实用印尼语沟通。',
    eyebrow: 'Indonesian for business',
    heading: '面向在印度尼西亚经商者的情境化印尼语',
    intro: '商务沟通不仅是词汇问题，也涉及对象、场合和任务。IndoBrain 用现实经营场景组织学习，帮助中文使用者准备日常协作与关系沟通。',
    indonesianSummary: 'Bahasa Indonesia praktis untuk komunikasi bisnis, operasional, dan hubungan kerja di Indonesia.',
    englishSummary: 'Practical Indonesian for business operations and professional relationships in Indonesia.',
    audience: ['在印度尼西亚经营业务的中文使用者', '需要与当地团队或合作方沟通的人', '希望理解实际商务沟通情境的学习者'],
    problems: ['商务关系与日常执行需要不同表达方式', '任务、时间与责任需要准确确认', '需要在保持礼貌的同时推进事情'],
    approach: sharedApproach,
    useCases: ['与团队确认经营事项', '跟进合作与任务', '处理会议和商务社交', '说明要求与下一步行动'],
    learningSituations: ['确认合作安排', '跟进待办事项', '与合作方保持联系', '在商务场合礼貌沟通'],
    difference: sharedDifference,
    faqs: [
      { question: '这里的商务印尼语是什么方向？', answer: '重点是经营、协作、跟进和关系沟通中会反复出现的实际任务。' },
      { question: '是否承诺学习结果？', answer: '不承诺特定结果。IndoBrain 提供基于真实情境的学习和练习工具。' },
      { question: '是否公开商务课程内容？', answer: '不会。公开页面只说明产品适用方向，完整学习内容仍需要有效账户。' },
    ],
  },
  'indonesian-for-daily-life': {
    slug: 'indonesian-for-daily-life',
    title: '在印尼日常生活使用的印尼语 | IndoBrain',
    description: '从出行、购物、吃饭、办事到家庭沟通，IndoBrain 以真实生活场景帮助中文使用者学习实用印尼语。',
    eyebrow: 'Indonesian for daily life',
    heading: '从每天真实发生的事情学习印尼语',
    intro: '日常生活中的沟通通常短、快而具体。IndoBrain 把学习内容放进出行、购物、吃饭、家庭与城市生活等实际情境。',
    indonesianSummary: 'Belajar Bahasa Indonesia untuk transportasi, belanja, makan, rumah, dan kehidupan sehari-hari.',
    englishSummary: 'Practical Indonesian for transport, shopping, food, home, and everyday life.',
    audience: ['刚到印度尼西亚生活的中文使用者', '希望改善日常沟通的人', '需要处理家庭、出行和城市事务的人'],
    problems: ['知道基础词汇却无法完成实际任务', '听到口语表达时难以判断真实意思', '缺少按生活场景组织的学习路径'],
    approach: sharedApproach,
    useCases: ['出行与路线沟通', '点餐、购物和付款', '家庭与居住沟通', '城市办事与服务场景'],
    learningSituations: ['告诉司机目的地', '确认商品或餐食', '安排家庭事务', '向服务人员说明需要'],
    difference: sharedDifference,
    faqs: [
      { question: '零基础可以从日常生活场景开始吗？', answer: '可以。IndoBrain 的方向是先从现实中马上会遇到的任务和表达开始。' },
      { question: '是否只教正式印尼语？', answer: '产品关注真实沟通，会根据具体场景呈现实用表达并提供中文理解支持。' },
      { question: '公开页面包含完整句库吗？', answer: '不包含。受保护的学习内容不会因为 GEO 页面而公开。' },
    ],
  },
  'indonesian-for-managing-employees': {
    slug: 'indonesian-for-managing-employees',
    title: '在印尼管理员工的实用印尼语 | IndoBrain',
    description: 'IndoBrain 围绕任务安排、进度确认、反馈与员工沟通，帮助中文管理者学习实际工作中使用的印尼语。',
    eyebrow: 'Indonesian for managing employees',
    heading: '围绕员工管理任务学习实用印尼语',
    intro: '管理员工时，表达需要清楚、具体并符合关系与场合。IndoBrain 以员工管理中反复出现的现实任务组织学习。',
    indonesianSummary: 'Bahasa Indonesia praktis untuk memberi arahan, memeriksa progres, dan berkomunikasi dengan karyawan.',
    englishSummary: 'Practical Indonesian for giving directions, checking progress, and communicating with employees.',
    audience: ['在印度尼西亚带领当地团队的中文管理者', '需要安排和检查工作的人', '希望改善员工沟通方式的经营者'],
    problems: ['任务优先级与完成标准需要讲清楚', '反馈既要明确也要适合具体关系', '现场问题需要及时确认与处理'],
    approach: sharedApproach,
    useCases: ['安排与调整任务', '询问进度和完成情况', '表扬、提醒与反馈', '交接、纪律与问题上报'],
    learningSituations: ['说明今天先做什么', '询问任务是否完成', '要求再次检查或修改', '认可员工的表现与进步'],
    difference: sharedDifference,
    faqs: [
      { question: '员工管理方向包含哪些沟通任务？', answer: '公开说明覆盖任务安排、进度确认、反馈、交接和日常团队沟通等方向。' },
      { question: '会公开 Employee Management 的完整场景吗？', answer: '不会。公开页只介绍学习方向，完整员工管理课程保持账户保护。' },
      { question: '这些内容是否替代专业人力资源建议？', answer: '不替代。IndoBrain 是语言学习与沟通练习工具。' },
    ],
  },
  'indonesian-for-recruitment': {
    slug: 'indonesian-for-recruitment',
    title: '在印尼招聘沟通所需的实用印尼语 | IndoBrain',
    description: '了解 IndoBrain 如何用真实招聘与入职沟通情境，帮助中文使用者准备在印度尼西亚使用的实用印尼语。',
    eyebrow: 'Indonesian for recruitment',
    heading: '为招聘与入职沟通准备实用印尼语',
    intro: '招聘沟通涉及岗位、经历、时间与工作安排。IndoBrain 的情境化学习架构可以围绕这些现实任务组织语言理解和练习。',
    indonesianSummary: 'Bahasa Indonesia praktis untuk komunikasi rekrutmen, wawancara, dan proses masuk kerja.',
    englishSummary: 'Practical Indonesian for recruitment, interviews, and onboarding communication.',
    audience: ['需要在印度尼西亚招聘员工的中文使用者', '参与面试与入职安排的人', '需要理解招聘沟通情境的管理者'],
    problems: ['岗位与工作条件需要清楚说明', '面试问题需要符合具体沟通目的', '录用与入职安排涉及多项确认'],
    approach: sharedApproach,
    useCases: ['说明岗位和工作安排', '询问候选人经历', '确认时间与到岗信息', '进行入职沟通'],
    learningSituations: ['介绍岗位职责', '询问相关工作经验', '确认面试或到岗时间', '说明下一步流程'],
    difference: sharedDifference,
    faqs: [
      { question: '招聘方向是否提供法律建议？', answer: '不提供。这里是语言学习与沟通情境说明，不替代法律或人力资源专业意见。' },
      { question: '适合哪些招聘参与者？', answer: '适合需要用印尼语说明岗位、进行面试或安排入职的中文使用者。' },
      { question: '完整招聘课程是否公开？', answer: '不会。公开页面不暴露受保护课程或任何候选人、员工数据。' },
    ],
  },
  'indonesian-for-social-life': {
    slug: 'indonesian-for-social-life',
    title: '在印尼社交生活中使用的印尼语 | IndoBrain',
    description: 'IndoBrain 以认识朋友、日常联系、聚会和关系沟通等真实场景，帮助中文使用者学习实用印尼语。',
    eyebrow: 'Indonesian for social life',
    heading: '用真实社交情境学习自然实用的印尼语',
    intro: '社交沟通会随着关系、语气和场合变化。IndoBrain 以认识朋友、日常联系、聚会和关系推进等现实情境组织学习。',
    indonesianSummary: 'Belajar Bahasa Indonesia untuk berkenalan, berteman, berkumpul, dan berkomunikasi dalam hubungan sosial.',
    englishSummary: 'Practical Indonesian for meeting people, friendships, gatherings, and social relationships.',
    audience: ['希望更自然参与当地社交的中文使用者', '需要建立日常联系的人', '希望理解印尼语社交表达语境的学习者'],
    problems: ['同一句话在不同关系中可能有不同语气', '只会正式表达时，日常交流可能不自然', '需要理解社交边界和上下文'],
    approach: sharedApproach,
    useCases: ['认识新朋友', '发起或回应邀约', '在聚会中交流', '表达感谢、关心与边界'],
    learningSituations: ['第一次交换联系方式', '确认见面时间', '加入朋友聊天', '礼貌表达接受或拒绝'],
    difference: sharedDifference,
    faqs: [
      { question: '社交印尼语包括哪些方向？', answer: '包括认识朋友、日常联系、聚会、关系沟通与社交边界等现实方向。' },
      { question: '是否只提供正式表达？', answer: 'IndoBrain 关注真实情境，会根据交流对象和任务组织实用表达。' },
      { question: 'Social/Dating 完整内容会公开吗？', answer: '不会。公开页面只介绍方向，受保护的学习内容仍需有效账户访问。' },
    ],
  },
};

export function getGeoPage(slug: GeoPageSlug) {
  return GEO_PAGES[slug];
}
