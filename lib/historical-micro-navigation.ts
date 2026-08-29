import { driverWorkflow } from '@/lib/driver-workflow';
import { factoryWorkflow } from '@/lib/factory-workflow';
import { lifeWorkflow } from '@/lib/life-workflow';
import { nannyWorkflow } from '@/lib/nanny-workflow';
import { getHistoricalQuickExperiences, type QuickExperienceLearningUnit } from '@/lib/quick-experience-adapter';

export type HistoricalMicroModuleSlug = 'driver' | 'nanny' | 'factory' | 'life';
export type HistoricalFactoryRoleSlug = 'manager' | 'production' | 'warehouse' | 'qc' | 'purchasing' | 'operator' | 'logistics' | 'shipping' | 'export' | 'customer-service';

export type HistoricalMicroSceneCard = QuickExperienceLearningUnit & {
  progressKey: string;
  legacyProgressKeys: string[];
};

export type HistoricalMicroGroup = {
  slug: string;
  indonesian: string;
  title: string;
  subtitle: string;
  count: number;
};

export type HistoricalMicroModule = HistoricalMicroGroup & {
  slug: HistoricalMicroModuleSlug;
  icon: string;
};

const allQuick = getHistoricalQuickExperiences();
const driverQuick = allQuick.filter((item) => item.source === 'driver');
const nannyQuick = allQuick.filter((item) => item.source === 'nanny');
const factoryManagerQuick = allQuick.filter((item) => item.source === 'factory');
const lifeQuick = allQuick.filter((item) => item.source === 'life');
const socialQuick = allQuick.filter((item) => item.source === 'social');
const factoryRoleQuick = allQuick.filter((item) => item.source === 'module');

const historicalWorkflowSupplements = {
  driver: {
    jemput: [31],
    perjalanan: [33],
    menunggu: [32],
    kunjungan: [34],
    lanjutan: [35],
  },
  nanny: {
    makan: [],
    rumah: [3],
    anak: [4, 51, 52, 55],
    belanja: [2, 53, 54],
    kerja: [1],
  },
} as const;

const factoryRoleDefinitions = [
  { slug: 'manager', prefix: 'EXP-FAC-', indonesian: 'Manajer Pabrik', title: '工厂经理', subtitle: '生产、品质、安全、原料、交付和客户。' },
  { slug: 'production', prefix: 'EXP-PRO-', indonesian: 'Produksi', title: '生产', subtitle: '生产安排、目标、进度和现场协作。' },
  { slug: 'warehouse', prefix: 'EXP-WHS-', indonesian: 'Gudang', title: '仓库', subtitle: '库存、材料、入库和仓库沟通。' },
  { slug: 'qc', prefix: 'EXP-QC-', indonesian: 'QC', title: '品质管理', subtitle: '检查、异常、不良品和品质确认。' },
  { slug: 'purchasing', prefix: 'EXP-PUR-', indonesian: 'Purchasing', title: '采购', subtitle: '供应商、补货、价格和交期。' },
  { slug: 'operator', prefix: 'EXP-OPR-', indonesian: 'Operator', title: '操作员', subtitle: '机器操作、安全和现场指令。' },
  { slug: 'logistics', prefix: 'EXP-LOG-', indonesian: 'Logistik', title: '物流', subtitle: '车辆、地址、配送和物流协调。' },
  { slug: 'shipping', prefix: 'EXP-SHP-', indonesian: 'Pengiriman', title: '发货', subtitle: '装柜、发货时间和运输安排。' },
  { slug: 'export', prefix: 'EXP-EXP-', indonesian: 'Ekspor', title: '出口', subtitle: '出口文件、发票和装箱单。' },
  { slug: 'customer-service', prefix: 'EXP-CS-', indonesian: 'Layanan Pelanggan', title: '客户服务', subtitle: '客户反馈、投诉和后续沟通。' },
] as const;

const numberFromId = (id: string) => Number(id.slice(-3));
const asCard = (item: QuickExperienceLearningUnit): HistoricalMicroSceneCard => ({
  ...item,
  progressKey: item.sourceId,
  legacyProgressKeys: [`micro:${item.sourceId}`],
});

function filterByIds(items: QuickExperienceLearningUnit[], ids: readonly number[]) {
  const allowed = new Set(ids);
  return items.filter((item) => allowed.has(numberFromId(item.sourceId))).map(asCard);
}

function factoryRoleItems(roleSlug: string) {
  if (roleSlug === 'manager') return factoryManagerQuick.map(asCard);
  const role = factoryRoleDefinitions.find((item) => item.slug === roleSlug);
  return role ? factoryRoleQuick.filter((item) => item.sourceId.startsWith(role.prefix)).map(asCard) : [];
}

export function getHistoricalMicroModules(): HistoricalMicroModule[] {
  return [
    { slug: 'driver', icon: '🚗', indonesian: 'Sopir', title: '司机出行', subtitle: '接送、行程、等待和日常跑腿。', count: driverQuick.length },
    { slug: 'nanny', icon: '🏠', indonesian: 'Asisten Rumah Tangga', title: '家庭·保姆', subtitle: '吃饭、家务、孩子、采购和工作安排。', count: nannyQuick.length },
    { slug: 'factory', icon: '🏭', indonesian: 'Pabrik', title: '工厂·工作', subtitle: '工厂经理、生产、仓库、品质和供应链。', count: factoryManagerQuick.length + factoryRoleQuick.length },
    { slug: 'life', icon: '🌿', indonesian: 'Life', title: '生活·社交', subtitle: '朋友、日常服务、购物、餐厅和关系沟通。', count: lifeQuick.length + socialQuick.length },
  ];
}

export function getHistoricalMicroModule(slug: string | undefined) {
  return getHistoricalMicroModules().find((item) => item.slug === slug);
}

export function getDriverMicroGroups(): HistoricalMicroGroup[] {
  return driverWorkflow.map((workflow) => ({
    slug: workflow.slug,
    indonesian: workflow.indonesian,
    title: workflow.chinese,
    subtitle: {
      jemput: '来接我、确认到达和上下车安排。',
      perjalanan: '目的地、路线、堵车和临时改动。',
      menunggu: '停车、等候和办完事再来接。',
      kunjungan: '客户拜访、生活地点和临时跑腿。',
      lanjutan: '机场、行李、加油和更多后续安排。',
    }[workflow.slug],
    count: filterByIds(driverQuick, [...workflow.ids, ...historicalWorkflowSupplements.driver[workflow.slug]]).length,
  }));
}

export function getNannyMicroGroups(): HistoricalMicroGroup[] {
  return nannyWorkflow.map((workflow) => ({
    slug: workflow.slug,
    indonesian: workflow.indonesian,
    title: workflow.chinese,
    subtitle: {
      makan: '做饭、口味、饮料和用餐安排。',
      rumah: '打扫、整理、洗衣和居家事务。',
      anak: '孩子、家庭成员和日常照顾。',
      belanja: '买东西、补货、快递和接待客人。',
      kerja: '到岗、休息、时间和工作安排。',
    }[workflow.slug],
    count: filterByIds(nannyQuick, [...workflow.ids, ...historicalWorkflowSupplements.nanny[workflow.slug]]).length,
  }));
}

export function getFactoryMicroRoles(): HistoricalMicroGroup[] {
  return factoryRoleDefinitions.map((role) => ({
    slug: role.slug,
    indonesian: role.indonesian,
    title: role.title,
    subtitle: role.subtitle,
    count: factoryRoleItems(role.slug).length,
  }));
}

export function getFactoryManagerMicroGroups(): HistoricalMicroGroup[] {
  return factoryWorkflow.map((workflow) => ({
    slug: workflow.slug,
    indonesian: workflow.indonesian,
    title: workflow.chinese,
    subtitle: {
      produksi: '生产计划、产量、设备和现场安排。',
      kualitas: '品质检查、异常、返工和确认。',
      keamanan: '安全要求、风险和现场处理。',
      material: '原材料、库存、缺料和补充。',
      pengiriman: '交付、装车、发货和到达确认。',
      ekspor: '出口进度、文件和出运安排。',
      pelanggan: '客户需求、反馈和关系维护。',
    }[workflow.slug],
    count: filterByIds(factoryManagerQuick, workflow.ids).length,
  }));
}

export function getLifeMicroGroups(): HistoricalMicroGroup[] {
  return lifeWorkflow.map((workflow) => {
    const lifeItems = filterByIds(lifeQuick, workflow.ids);
    const items = workflow.slug === 'friends' ? [...socialQuick.map(asCard), ...lifeItems] : lifeItems;
    return {
      slug: workflow.slug,
      indonesian: workflow.indonesian,
      title: workflow.chinese,
      subtitle: {
        friends: '认识朋友、日常聊天、聚会和自然联系。',
        basics: '银行、医疗、办事、交通和日常求助。',
        supermarket: '找商品、问价格、称重和付款。',
        restaurant: '点餐、口味、加菜、结账和服务沟通。',
        business: '办公室、员工、供应商和客户商务。',
        dating: '认识、邀约、表达好感和关系边界。',
        'rumah-harian': '门、快递、网络、维修和居家小问题。',
      }[workflow.slug],
      count: items.length,
    };
  });
}

export function getHistoricalMicroGroups(moduleSlug: string, roleSlug?: string): HistoricalMicroGroup[] {
  if (moduleSlug === 'driver') return getDriverMicroGroups();
  if (moduleSlug === 'nanny') return getNannyMicroGroups();
  if (moduleSlug === 'life') return getLifeMicroGroups();
  if (moduleSlug === 'factory' && roleSlug === 'manager') return getFactoryManagerMicroGroups();
  if (moduleSlug === 'factory' && !roleSlug) return getFactoryMicroRoles();
  return [];
}

export function getHistoricalMicroItems(moduleSlug: string, categorySlug?: string, roleSlug?: string): HistoricalMicroSceneCard[] {
  if (moduleSlug === 'driver') {
    const workflow = driverWorkflow.find((item) => item.slug === categorySlug);
    return workflow ? filterByIds(driverQuick, [...workflow.ids, ...historicalWorkflowSupplements.driver[workflow.slug]]) : [];
  }
  if (moduleSlug === 'nanny') {
    const workflow = nannyWorkflow.find((item) => item.slug === categorySlug);
    return workflow ? filterByIds(nannyQuick, [...workflow.ids, ...historicalWorkflowSupplements.nanny[workflow.slug]]) : [];
  }
  if (moduleSlug === 'life') {
    const workflow = lifeWorkflow.find((item) => item.slug === categorySlug);
    if (!workflow) return [];
    const items = filterByIds(lifeQuick, workflow.ids);
    return workflow.slug === 'friends' ? [...socialQuick.map(asCard), ...items] : items;
  }
  if (moduleSlug === 'factory' && roleSlug === 'manager') {
    const workflow = factoryWorkflow.find((item) => item.slug === categorySlug);
    return workflow ? filterByIds(factoryManagerQuick, workflow.ids) : [];
  }
  if (moduleSlug === 'factory' && roleSlug) return factoryRoleItems(roleSlug);
  return [];
}

export function getHistoricalMicroReachableIds() {
  const contexts = [
    ...getDriverMicroGroups().flatMap((group) => getHistoricalMicroItems('driver', group.slug)),
    ...getNannyMicroGroups().flatMap((group) => getHistoricalMicroItems('nanny', group.slug)),
    ...getFactoryManagerMicroGroups().flatMap((group) => getHistoricalMicroItems('factory', group.slug, 'manager')),
    ...getFactoryMicroRoles().filter((role) => role.slug !== 'manager').flatMap((role) => getHistoricalMicroItems('factory', undefined, role.slug)),
    ...getLifeMicroGroups().flatMap((group) => getHistoricalMicroItems('life', group.slug)),
  ];
  return [...new Set(contexts.map((item) => item.sourceId))];
}

export function getNextHistoricalMicroGroup(moduleSlug: string, categorySlug?: string, roleSlug?: string) {
  const groups = getHistoricalMicroGroups(moduleSlug, roleSlug);
  const index = groups.findIndex((item) => item.slug === categorySlug);
  return index >= 0 ? groups.slice(index + 1).find((item) => item.count > 0) : undefined;
}
