export type ModuleRole = 'driver' | 'nanny';

import { getDriverExperiences, type DriverExperience } from '@/lib/driver-experiences';

export type ModuleExperience = DriverExperience & {
  id: string;
  task: string;
  indonesian: string;
  chinese: string;
  harvest: string[];
};

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

function createNannyExperiences(prefix: string, tasks: string[]): ModuleExperience[] {
  return tasks.map((task, index) => {
    const id = `${prefix}-${String(index + 1).padStart(3, '0')}`;
    return { id, task, indonesian: 'Tolong bantu urus rumah ya.', chinese: task, explanation: task, harvest: ['tolong（请）', 'sudah（已经）', 'nanti（之后）'] };
  });
}

export const moduleExperiences: Record<ModuleRole, ModuleExperience[]> = {
  driver: getDriverExperiences(),
  nanny: createNannyExperiences('EXP-NAN', nannyTasks),
};

export const moduleMeta = {
  driver: { indonesian: 'Sopir', chinese: '司机', chatRole: 'driver' },
  nanny: { indonesian: 'ART', chinese: '保姆', chatRole: 'nanny' },
} as const;
