export type RecruitmentInterviewVocabulary = {
  term: string;
  meaning: string;
};

export type RecruitmentInterviewScene = {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  explanation: string;
  vocabulary: RecruitmentInterviewVocabulary[];
  harvest: string[];
  learningTip?: string;
};

export const recruitmentInterviewCategory = {
  slug: 'recruitment-interview',
  indonesian: 'Rekrutmen & Interview',
  title: '招聘与面试',
  subtitle: '工作经历、能力确认、薪资沟通、到岗安排和录用通知。',
} as const;

// Human-approved canonical source package. Preserve R01-R20 exactly.
export const recruitmentInterviewScenes: RecruitmentInterviewScene[] = [
  {
    id: 'R01',
    task: '询问以前在哪里工作',
    indonesian: 'Sebelumnya kamu pernah kerja di mana?',
    chinese: '你之前在哪里工作过？',
    explanation: '“sebelumnya” 表示“之前、以前”。面试时用 “pernah kerja di mana?” 可以很自然地询问候选人过去在哪里工作过。',
    vocabulary: [
      { term: 'sebelumnya', meaning: '之前；以前' },
      { term: 'pernah kerja', meaning: '工作过；曾经工作' },
      { term: 'kerja di mana?', meaning: '在哪里工作？' },
    ],
    harvest: ['sebelumnya（之前；以前）', 'pernah kerja（工作过；曾经工作）', 'kerja di mana?（在哪里工作？）'],
  },
  {
    id: 'R02',
    task: '询问上一份工作做了多久',
    indonesian: 'Kamu kerja di sana berapa lama?',
    chinese: '你在那里工作了多久？',
    explanation: '“berapa lama” 用来询问持续了多长时间。除了工作年限，也可以用于问学习、居住、等待等持续时间。',
    vocabulary: [
      { term: 'di sana', meaning: '在那里' },
      { term: 'berapa lama', meaning: '多久；多长时间' },
      { term: 'kerja di sana', meaning: '在那里工作' },
    ],
    harvest: ['di sana（在那里）', 'berapa lama（多久；多长时间）', 'kerja di sana（在那里工作）'],
  },
  {
    id: 'R03',
    task: '询问上一份工作负责什么',
    indonesian: 'Di pekerjaan sebelumnya, kamu pegang bagian apa?',
    chinese: '上一份工作你主要负责什么？',
    explanation: '这里的 “pegang” 不是字面上的“拿、握”，而是印尼职场口语中非常常见的“负责、管理”。“pegang bagian apa?” 就是在问“你负责哪一块？”',
    vocabulary: [
      { term: 'pekerjaan sebelumnya', meaning: '上一份工作；之前的工作' },
      { term: 'pegang', meaning: '负责；管理（职场语境）' },
      { term: 'pegang bagian apa?', meaning: '负责哪一部分？' },
    ],
    harvest: ['pekerjaan sebelumnya（上一份工作；之前的工作）', 'pegang（负责；管理（职场语境））', 'pegang bagian apa?（负责哪一部分？）'],
  },
  {
    id: 'R04',
    task: '询问为什么离职',
    indonesian: 'Kenapa kamu keluar dari pekerjaan sebelumnya?',
    chinese: '你为什么离开上一份工作？',
    explanation: '“keluar dari pekerjaan” 在这里表示离开一份工作。面试口语里可以用这句话直接询问离职原因，语气取决于实际说话方式。',
    vocabulary: [
      { term: 'kenapa', meaning: '为什么' },
      { term: 'keluar dari', meaning: '离开……' },
      { term: 'pekerjaan sebelumnya', meaning: '上一份工作' },
    ],
    harvest: ['kenapa（为什么）', 'keluar dari（离开……）', 'pekerjaan sebelumnya（上一份工作）'],
  },
  {
    id: 'R05',
    task: '询问有没有类似工作经验',
    indonesian: 'Kamu pernah kerja di bidang seperti ini sebelumnya?',
    chinese: '你以前做过类似领域的工作吗？',
    explanation: '“bidang” 表示“领域、行业、工作方向”。“pernah kerja di bidang seperti ini” 是询问候选人有没有相关领域经验的自然说法。',
    vocabulary: [
      { term: 'pernah kerja', meaning: '曾经工作过' },
      { term: 'bidang', meaning: '领域；行业' },
      { term: 'bidang seperti ini', meaning: '类似这样的领域' },
      { term: 'sebelumnya', meaning: '以前；之前' },
    ],
    harvest: ['pernah kerja（曾经工作过）', 'bidang（领域；行业）', 'bidang seperti ini（类似这样的领域）', 'sebelumnya（以前；之前）'],
  },
  {
    id: 'R06',
    task: '询问会不会使用某个工具或设备',
    indonesian: 'Kamu bisa pakai ini?',
    chinese: '你会用这个吗？',
    explanation: '“bisa pakai” 就是“会使用”。这是非常口语、非常直接的问法，可以指机器、软件、工具或设备。',
    vocabulary: [
      { term: 'bisa', meaning: '会；能够' },
      { term: 'pakai', meaning: '使用；用' },
      { term: 'bisa pakai ini?', meaning: '会用这个吗？' },
    ],
    harvest: ['bisa（会；能够）', 'pakai（使用；用）', 'bisa pakai ini?（会用这个吗？）'],
  },
  {
    id: 'R07',
    task: '询问能不能独立处理工作',
    indonesian: 'Kalau kerja sendiri, kamu bisa handle?',
    chinese: '如果让你独立做，你能处理吗？',
    explanation: '“handle” 是印尼职场中很常见的英语借词，表示“负责处理、搞定”。这里是在问候选人能不能独立承担并处理工作。',
    vocabulary: [
      { term: 'kerja sendiri', meaning: '独立工作；自己做' },
      { term: 'bisa handle?', meaning: '能处理吗？能搞定吗？' },
      { term: 'handle', meaning: '负责处理；搞定（职场口语）' },
    ],
    harvest: ['kerja sendiri（独立工作；自己做）', 'bisa handle?（能处理吗？能搞定吗？）', 'handle（负责处理；搞定（职场口语））'],
  },
  {
    id: 'R08',
    task: '询问是否能加班',
    indonesian: 'Kalau diperlukan, kamu bisa lembur?',
    chinese: '如果有需要，你能加班吗？',
    explanation: '“kalau diperlukan” 表示“如果有需要”。“lembur” 就是“加班”，是印尼工作场景中的高频词。',
    vocabulary: [
      { term: 'kalau diperlukan', meaning: '如果有需要' },
      { term: 'lembur', meaning: '加班' },
      { term: 'bisa lembur?', meaning: '能加班吗？' },
    ],
    harvest: ['kalau diperlukan（如果有需要）', 'lembur（加班）', 'bisa lembur?（能加班吗？）'],
  },
  {
    id: 'R09',
    task: '询问现在住在哪里',
    indonesian: 'Sekarang kamu tinggal di mana?',
    chinese: '你现在住在哪里？',
    explanation: '“tinggal” 在这里表示“居住、住”。面试时询问居住地点，通常是为了了解通勤距离和到岗便利程度。',
    vocabulary: [
      { term: 'sekarang', meaning: '现在' },
      { term: 'tinggal', meaning: '居住；住' },
      { term: 'tinggal di mana?', meaning: '住在哪里？' },
    ],
    harvest: ['sekarang（现在）', 'tinggal（居住；住）', 'tinggal di mana?（住在哪里？）'],
  },
  {
    id: 'R10',
    task: '询问上班距离远不远',
    indonesian: 'Dari rumah ke sini jauh gak?',
    chinese: '从你家到这里远吗？',
    explanation: '“jauh gak?” 是非常自然的口语“远不远？”。这里的 “gak” 是 “tidak” 常见的口语形式。',
    vocabulary: [
      { term: 'dari rumah', meaning: '从家里' },
      { term: 'ke sini', meaning: '到这里' },
      { term: 'jauh gak?', meaning: '远不远？' },
    ],
    harvest: ['dari rumah（从家里）', 'ke sini（到这里）', 'jauh gak?（远不远？）'],
    learningTip: '“gak” 是日常口语里非常常见的 “tidak”。正式书面语中通常使用 “tidak”。',
  },
  {
    id: 'R11',
    task: '询问期望工资',
    indonesian: 'Gaji yang kamu harapkan berapa?',
    chinese: '你的期望工资是多少？',
    explanation: '“yang kamu harapkan” 表示“你所期望的”。整个 “gaji yang kamu harapkan” 可以直接理解成“你期望的工资”。',
    vocabulary: [
      { term: 'gaji', meaning: '工资' },
      { term: 'yang kamu harapkan', meaning: '你所期望的' },
      { term: 'gaji yang kamu harapkan', meaning: '你期望的工资' },
      { term: 'berapa?', meaning: '多少？' },
    ],
    harvest: ['gaji（工资）', 'yang kamu harapkan（你所期望的）', 'gaji yang kamu harapkan（你期望的工资）', 'berapa?（多少？）'],
  },
  {
    id: 'R12',
    task: '询问上一份工作的工资',
    indonesian: 'Gaji kamu di tempat sebelumnya berapa?',
    chinese: '你上一份工作的工资是多少？',
    explanation: '“tempat sebelumnya” 在面试上下文里指之前工作的地方。这是比较直接的口语问法。',
    vocabulary: [
      { term: 'gaji kamu', meaning: '你的工资' },
      { term: 'tempat sebelumnya', meaning: '之前工作的地方' },
      { term: 'berapa?', meaning: '多少？' },
    ],
    harvest: ['gaji kamu（你的工资）', 'tempat sebelumnya（之前工作的地方）', 'berapa?（多少？）'],
  },
  {
    id: 'R13',
    task: '向候选人介绍以后负责的工作',
    indonesian: 'Nanti kamu akan pegang bagian ini.',
    chinese: '以后你主要负责这部分。',
    explanation: '这里再次使用职场中的 “pegang”，表示“负责、管理”。“nanti” 在这个场景里可以理解成“之后、以后”。',
    vocabulary: [
      { term: 'nanti', meaning: '之后；以后' },
      { term: 'pegang bagian ini', meaning: '负责这部分' },
      { term: 'pegang', meaning: '负责；管理（职场语境）' },
    ],
    harvest: ['nanti（之后；以后）', 'pegang bagian ini（负责这部分）', 'pegang（负责；管理（职场语境））'],
  },
  {
    id: 'R14',
    task: '说明会有试用期',
    indonesian: 'Nanti ada masa percobaan dulu.',
    chinese: '前面会先有试用期。',
    explanation: '“masa percobaan” 在工作语境里表示“试用期、试用阶段”。这里的 “dulu” 表示“先”，意思是正式进入后续安排前先经过试用阶段。',
    vocabulary: [
      { term: 'masa', meaning: '时期；阶段' },
      { term: 'masa percobaan', meaning: '试用期；试用阶段' },
      { term: 'dulu', meaning: '先' },
    ],
    harvest: ['masa（时期；阶段）', 'masa percobaan（试用期；试用阶段）', 'dulu（先）'],
  },
  {
    id: 'R15',
    task: '询问什么时候可以开始上班',
    indonesian: 'Kalau cocok, kapan kamu bisa mulai kerja?',
    chinese: '如果合适，你什么时候可以开始上班？',
    explanation: '“kalau cocok” 表示“如果合适”。“mulai kerja” 是“开始工作、开始上班”。这句话非常适合面试接近结束时确认到岗时间。',
    vocabulary: [
      { term: 'kalau cocok', meaning: '如果合适' },
      { term: 'kapan', meaning: '什么时候' },
      { term: 'bisa mulai kerja', meaning: '可以开始上班' },
      { term: 'mulai kerja', meaning: '开始工作；开始上班' },
    ],
    harvest: ['kalau cocok（如果合适）', 'kapan（什么时候）', 'bisa mulai kerja（可以开始上班）', 'mulai kerja（开始工作；开始上班）'],
  },
  {
    id: 'R16',
    task: '确认候选人是否接受这个工资',
    indonesian: 'Kalau gajinya segini, kamu oke?',
    chinese: '如果工资是这个数，你能接受吗？',
    explanation: '“segini” 表示“这么多、这个数”。“kamu oke?” 在这里不是单纯问“你好吗”，而是在确认对方是否可以接受这个条件。',
    vocabulary: [
      { term: 'gajinya', meaning: '这个工资；工资' },
      { term: 'segini', meaning: '这么多；这个数' },
      { term: 'gajinya segini', meaning: '工资是这个数' },
      { term: 'kamu oke?', meaning: '你可以接受吗？' },
    ],
    harvest: ['gajinya（这个工资；工资）', 'segini（这么多；这个数）', 'gajinya segini（工资是这个数）', 'kamu oke?（你可以接受吗？）'],
    learningTip: '“oke” 在真实口语里经常表示“可以、接受、没问题”，具体意思要根据上下文判断。',
  },
  {
    id: 'R17',
    task: '双方谈妥后先试几天',
    indonesian: 'Kita coba dulu beberapa hari, ya.',
    chinese: '我们先试几天看看。',
    explanation: '“coba dulu” 表示“先试试看”，“beberapa hari” 表示“几天”。这句话适合双方已经谈妥试工或试用安排后，用口语确认先实际配合几天看看。',
    vocabulary: [
      { term: 'coba dulu', meaning: '先试试看' },
      { term: 'beberapa hari', meaning: '几天' },
      { term: 'kita coba dulu', meaning: '我们先试试看' },
    ],
    harvest: ['coba dulu（先试试看）', 'beberapa hari（几天）', 'kita coba dulu（我们先试试看）'],
  },
  {
    id: 'R18',
    task: '告诉候选人面试后再通知',
    indonesian: 'Nanti kami kabari lagi setelah interview.',
    chinese: '面试后我们再通知你。',
    explanation: '“kami kabari lagi” 表示“我们之后再通知你”。这里使用 “kami” 是因为说话者代表公司或招聘方，而不包括候选人在内。',
    vocabulary: [
      { term: 'kami', meaning: '我们（不包括对方）' },
      { term: 'kabari lagi', meaning: '再通知；之后再告知' },
      { term: 'setelah interview', meaning: '面试以后' },
    ],
    harvest: ['kami（我们（不包括对方））', 'kabari lagi（再通知；之后再告知）', 'setelah interview（面试以后）'],
    learningTip: '“kita” 包括说话双方，“kami” 不包括听话的人。代表公司对候选人说“我们会通知你”时，用 “kami” 很自然。',
  },
  {
    id: 'R19',
    task: '通知候选人被录用',
    indonesian: 'Kamu diterima. Bisa mulai kerja hari Senin?',
    chinese: '你被录用了，星期一可以开始上班吗？',
    explanation: '“diterima” 在招聘场景里表示“被录用、被接受”。后面直接询问到岗日期，是很实用的录用通知表达。',
    vocabulary: [
      { term: 'diterima', meaning: '被录用；被接受' },
      { term: 'mulai kerja', meaning: '开始上班' },
      { term: 'hari Senin', meaning: '星期一' },
    ],
    harvest: ['diterima（被录用；被接受）', 'mulai kerja（开始上班）', 'hari Senin（星期一）'],
  },
  {
    id: 'R20',
    task: '礼貌告诉候选人暂时不继续录用流程',
    indonesian: 'Untuk sekarang, kami belum bisa lanjut dengan kamu.',
    chinese: '目前我们暂时不能继续录用流程。',
    explanation: '“untuk sekarang” 表示“目前、现阶段”。“belum bisa lanjut” 比非常直接地说“不录用你”更缓和，适合结束招聘流程时使用。',
    vocabulary: [
      { term: 'untuk sekarang', meaning: '目前；现阶段' },
      { term: 'belum bisa lanjut', meaning: '暂时不能继续' },
      { term: 'lanjut', meaning: '继续' },
    ],
    harvest: ['untuk sekarang（目前；现阶段）', 'belum bisa lanjut（暂时不能继续）', 'lanjut（继续）'],
  },
];
