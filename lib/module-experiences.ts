export type ModuleRole = 'driver' | 'nanny';

export type ModuleExperience = {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  harvest: string[];
};

const driverTasks = [
  '明天早上七点半来接我', '你到了吗？', '先去银行，然后去公司', '前面堵车吗？', '通知客户我们会晚到',
  '走另外一条路吧', '停地下停车场', '你先在这里等我', '我开完会了，过来接我', '先去银行',
  '我大概二十分钟出来', '下午去客户公司', '我们到了', '我在楼下等您', '附近有什么好吃的吗？',
  '先去加个油', '今天先去哪里？', '这条路有点堵', '靠边停一下', '到了',
  '明天几点出发？', '去机场接人', '行李多吗？', '先送客户回去', '去加油站',
  '车停在哪里？', '帮我拿一下东西', '今天还有安排吗？', '晚上送我回家', '明天早上还是七点半来接我',
];

const nannyTasks = [
  '今天做什么菜？', '不要放辣椒', '帮我买水果', '今天打扫房间', '孩子放学几点？',
  '请帮我洗衣服', '晚饭几点做好？', '冰箱里还有什么？', '明天早点来', '今天不用来了',
  '帮我照顾孩子', '去超市买东西', '厨房收拾好了吗？', '帮我拿快递', '门口有人吗？',
  '今天要洗车吗？', '垃圾倒了吗？', '帮我准备早餐', '家里没有米了', '今天先休息吧',
  '把衣服晾起来', '帮我买鸡蛋', '晚点做饭', '客人几点来？', '准备一下房间',
  '别忘了关门', '帮我浇花', '这个怎么做？', '明天买菜', '今天辛苦了',
  '帮我整理客厅', '孩子睡了吗？', '药放在哪里？', '今天不用打扫', '帮我看一下锅',
  '晚上不要等我', '明天几点来？', '帮我热一下饭', '洗手间清理了吗？', '帮我买牛奶',
  '今天下雨吗？', '把窗户关上', '客人走了吗？', '帮我换床单', '今天做汤吧',
  '明天记得买菜', '先休息一下', '帮我拿毛巾', '晚上锁门', '明天见',
];

function createExperiences(prefix: string, tasks: string[], role: ModuleRole): ModuleExperience[] {
  return tasks.map((task, index) => {
    const id = `${prefix}-${String(index + 1).padStart(3, '0')}`;
    const indonesian = role === 'driver'
      ? (index === 0 ? 'Besok pagi jemput saya jam setengah delapan ya.' : 'Tolong bantu atur perjalanan saya ya.')
      : 'Tolong bantu urus rumah ya.';
    return { id, task, indonesian, chinese: task, harvest: role === 'driver' ? ['jemput（接人）', 'langsung（直接）', 'tunggu（等待）'] : ['tolong（请）', 'sudah（已经）', 'nanti（之后）'] };
  });
}

export const moduleExperiences: Record<ModuleRole, ModuleExperience[]> = {
  driver: createExperiences('EXP-DRV', driverTasks, 'driver'),
  nanny: createExperiences('EXP-NAN', nannyTasks, 'nanny'),
};

export const moduleMeta = {
  driver: { indonesian: 'Sopir', chinese: '司机', chatRole: 'driver' },
  nanny: { indonesian: 'ART', chinese: '保姆', chatRole: 'nanny' },
} as const;
