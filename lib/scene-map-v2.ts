import { getDriverExperiences } from '@/lib/driver-experiences';
import { driverWorkflow, type DriverWorkflowSlug } from '@/lib/driver-workflow';
import { getFactoryExperiences } from '@/lib/factory-experiences';
import { factoryWorkflow, type FactoryWorkflowSlug } from '@/lib/factory-workflow';
import { getLifeExperiences, type LifeCategory } from '@/lib/life-experiences';
import { isLifeWorkflow, type LifeWorkflowSlug } from '@/lib/life-workflow';
import { moduleExperiences, type ModuleRole } from '@/lib/module-experiences';
import { getNannyExperiences } from '@/lib/nanny-experiences';
import { nannyWorkflow, type NannyWorkflowSlug } from '@/lib/nanny-workflow';
import { getSocialExperiences } from '@/lib/social-experiences';

export type SceneMapLevel2Slug = 'life-home' | 'transport' | 'work-business' | 'social-relationship' | 'public-service' | 'travel-emergency';
export type SceneMapEntryKind = 'golden' | 'quick';

export type SceneMapEntry = {
  id: string;
  title: string;
  indonesian: string;
  href: string;
  module: string;
  kind: SceneMapEntryKind;
};

type EntrySeed = { id: string; task: string; indonesian?: string; missing?: boolean; goldenScene?: unknown };
type SourceSpec =
  | { type: 'lifeCategory'; category: LifeCategory }
  | { type: 'lifeIds'; ids: number[] }
  | { type: 'driverWorkflow'; workflow: DriverWorkflowSlug }
  | { type: 'driverIds'; ids: number[] }
  | { type: 'nannyWorkflow'; workflow: NannyWorkflowSlug }
  | { type: 'factoryWorkflow'; workflow: FactoryWorkflowSlug }
  | { type: 'factoryIds'; ids: number[] }
  | { type: 'moduleRole'; role: ModuleRole }
  | { type: 'socialIds'; ids?: number[] };

export type SceneMapTopic = { slug: string; title: string; subtitle: string; sources: SourceSpec[] };
export type SceneMapLevel2 = { slug: SceneMapLevel2Slug; icon: string; title: string; subtitle: string; topics: SceneMapTopic[] };

const range = (start: number, end: number) => Array.from({ length: end - start + 1 }, (_, index) => start + index);
const idNumber = (id: string) => Number(id.slice(-3));
const compact = (value: string) => value.replace(/\s+/g, ' ').trim();

function sceneEntry(seed: EntrySeed, href: string, module: string): SceneMapEntry | undefined {
  if (seed.missing || !seed.indonesian) return undefined;
  return { id: seed.id, title: compact(seed.task), indonesian: seed.indonesian, href, module, kind: seed.goldenScene ? 'golden' : 'quick' };
}

function lifeEntry(item: EntrySeed & { category: LifeCategory }): SceneMapEntry | undefined {
  const number = idNumber(item.id);
  const flow = number >= 174 && number <= 198 ? '&flow=golden-batch-6' : '';
  return sceneEntry(item, `/life/${item.id.slice(-3)}?category=${item.category}${flow}`, 'Life');
}

function collectSource(source: SourceSpec): SceneMapEntry[] {
  if (source.type === 'lifeCategory') return getLifeExperiences().filter((item) => item.category === source.category).map(lifeEntry).filter(Boolean) as SceneMapEntry[];
  if (source.type === 'lifeIds') {
    const ids = new Set(source.ids);
    return getLifeExperiences().filter((item) => ids.has(idNumber(item.id))).map(lifeEntry).filter(Boolean) as SceneMapEntry[];
  }
  if (source.type === 'driverWorkflow') {
    const workflow = driverWorkflow.find((item) => item.slug === source.workflow);
    const ids = new Set<number>([...(workflow?.ids ?? [])]);
    return getDriverExperiences().filter((item) => ids.has(idNumber(item.id))).map((item) => sceneEntry(item, `/driver/${item.id.slice(-3)}?workflow=${source.workflow}`, 'Driver')).filter(Boolean) as SceneMapEntry[];
  }
  if (source.type === 'driverIds') {
    const ids = new Set(source.ids);
    return getDriverExperiences().filter((item) => ids.has(idNumber(item.id))).map((item) => sceneEntry(item, `/driver/${item.id.slice(-3)}`, 'Driver')).filter(Boolean) as SceneMapEntry[];
  }
  if (source.type === 'nannyWorkflow') {
    const workflow = nannyWorkflow.find((item) => item.slug === source.workflow);
    const ids = new Set<number>([...(workflow?.ids ?? [])]);
    return getNannyExperiences().filter((item) => ids.has(idNumber(item.id))).map((item) => sceneEntry(item, `/nanny/${item.id.slice(-3)}?workflow=${source.workflow}`, 'Nanny')).filter(Boolean) as SceneMapEntry[];
  }
  if (source.type === 'factoryWorkflow') {
    const workflow = factoryWorkflow.find((item) => item.slug === source.workflow);
    const ids = new Set<number>([...(workflow?.ids ?? [])]);
    return getFactoryExperiences().filter((item) => ids.has(idNumber(item.id))).map((item) => sceneEntry(item, `/factory/manager/${item.id.slice(-3)}?workflow=${source.workflow}`, 'Factory')).filter(Boolean) as SceneMapEntry[];
  }
  if (source.type === 'factoryIds') {
    const ids = new Set(source.ids);
    return getFactoryExperiences().filter((item) => ids.has(idNumber(item.id))).map((item) => sceneEntry(item, `/factory/manager/${item.id.slice(-3)}`, 'Factory')).filter(Boolean) as SceneMapEntry[];
  }
  if (source.type === 'moduleRole') return (moduleExperiences[source.role] ?? []).map((item) => sceneEntry(item, `/module/${source.role}/${item.id.slice(-3)}`, 'Quick Scene')).filter(Boolean) as SceneMapEntry[];
  const ids = source.ids ? new Set(source.ids) : undefined;
  return getSocialExperiences().filter((item) => !ids || ids.has(idNumber(item.id))).map((item) => sceneEntry(item, `/social/${item.id.slice(-3)}`, 'Social')).filter(Boolean) as SceneMapEntry[];
}

export const sceneMapV2: SceneMapLevel2[] = [
  { slug: 'life-home', icon: '🏠', title: '生活居家', subtitle: '家里每天会发生的吃饭、家务、补给和小问题。', topics: [
    { slug: 'rumah-harian', title: '居家日常', subtitle: '厕所、充电、门、快递、垃圾等家中即时问题。', sources: [{ type: 'lifeCategory', category: 'rumah-harian' }] },
    { slug: 'urusan-rumah', title: '家务沟通', subtitle: '打扫、整理、洗衣、家务安排。', sources: [{ type: 'nannyWorkflow', workflow: 'rumah' }] },
    { slug: 'masak-makan', title: '吃饭做饭', subtitle: '今天吃什么、怎么做、口味和上菜。', sources: [{ type: 'nannyWorkflow', workflow: 'makan' }, { type: 'lifeCategory', category: 'restaurant' }] },
    { slug: 'belanja-konsumsi', title: '购物消费', subtitle: '超市、餐厅付款、价格和找商品。', sources: [{ type: 'lifeCategory', category: 'supermarket' }] },
    { slug: 'antar-persediaan', title: '外卖与补给', subtitle: '买菜、煤气、家庭用品、快递和补货。', sources: [{ type: 'nannyWorkflow', workflow: 'belanja' }, { type: 'lifeIds', ids: range(133, 136) }] },
    { slug: 'masalah-rumah', title: '生活问题', subtitle: '空调、热水、门禁、漏水、网络和维修。', sources: [{ type: 'lifeIds', ids: [...range(128, 132), 191, 193] }] },
  ] },
  { slug: 'transport', icon: '🚗', title: '出行交通', subtitle: '司机、路线、堵车、停车等待和接送安排。', topics: [
    { slug: 'pickup-dropoff', title: '接送安排', subtitle: '让司机来接、确认到达、安排上下车。', sources: [{ type: 'driverWorkflow', workflow: 'jemput' }, { type: 'lifeIds', ids: range(104, 111) }] },
    { slug: 'route-change', title: '路线改动', subtitle: '临时改目的地、换路线、处理堵车。', sources: [{ type: 'driverWorkflow', workflow: 'perjalanan' }] },
    { slug: 'parking-waiting', title: '停车等待', subtitle: '停车、等我、办完事再接。', sources: [{ type: 'driverWorkflow', workflow: 'menunggu' }] },
    { slug: 'airport-pickup', title: '机场接送', subtitle: '机场、航站楼、接客人和行李。', sources: [{ type: 'driverIds', ids: [17, 35, 39] }, { type: 'lifeIds', ids: [196] }] },
    { slug: 'daily-errands', title: '日常跑腿', subtitle: '银行、仓库、客户、加油和临时行程。', sources: [{ type: 'driverWorkflow', workflow: 'kunjungan' }, { type: 'driverWorkflow', workflow: 'lanjutan' }] },
  ] },
  { slug: 'work-business', icon: '💼', title: '工作商务', subtitle: '办公室、工厂、供应商、客户和电商运营。', topics: [
    { slug: 'employee-management', title: '员工管理', subtitle: '员工汇报、完成标准、纪律、离职和责任。', sources: [{ type: 'lifeIds', ids: range(144, 153) }, { type: 'factoryIds', ids: range(21, 35) }] },
    { slug: 'office-collaboration', title: '办公室协作', subtitle: 'WhatsApp、文件、会议、跨部门协作。', sources: [{ type: 'lifeIds', ids: [144, 146, 147, 148, 149, 150, 151] }] },
    { slug: 'meeting-report', title: '会议汇报', subtitle: '把问题、结果、方案和下一步说清楚。', sources: [{ type: 'lifeIds', ids: [144, 148, 149, 150, 154, 173] }] },
    { slug: 'recruiting-hr', title: '招聘人事', subtitle: '面试、入职、请假、工资和离职沟通。', sources: [{ type: 'lifeIds', ids: [152, 153] }, { type: 'nannyWorkflow', workflow: 'kerja' }] },
    { slug: 'factory-production', title: '工厂生产', subtitle: '产量、设备、原料、生产计划和现场管理。', sources: [{ type: 'factoryWorkflow', workflow: 'produksi' }, { type: 'moduleRole', role: 'production' }] },
    { slug: 'quality-management', title: '品质管理', subtitle: '质量异常、抽检、返工、SOP 和安全。', sources: [{ type: 'factoryWorkflow', workflow: 'kualitas' }, { type: 'factoryWorkflow', workflow: 'keamanan' }, { type: 'moduleRole', role: 'qc' }] },
    { slug: 'warehouse-logistics', title: '仓库物流', subtitle: '库存、发货、物流、交付和出口。', sources: [{ type: 'factoryWorkflow', workflow: 'material' }, { type: 'factoryWorkflow', workflow: 'pengiriman' }, { type: 'moduleRole', role: 'warehouse' }, { type: 'moduleRole', role: 'logistics' }, { type: 'moduleRole', role: 'shipping' }, { type: 'moduleRole', role: 'export' }] },
    { slug: 'supplier-purchasing', title: '供应商采购', subtitle: '询价、砍价、MOQ、付款、催货和对账。', sources: [{ type: 'lifeIds', ids: range(157, 166) }, { type: 'moduleRole', role: 'purchasing' }] },
    { slug: 'client-business', title: '客户商务', subtitle: '客户见面、跟进、不满处理和长期关系。', sources: [{ type: 'lifeIds', ids: range(184, 189) }, { type: 'factoryWorkflow', workflow: 'pelanggan' }] },
    { slug: 'ecommerce-ops', title: '电商运营', subtitle: 'GMV、广告、直播、客服、仓库和复盘。', sources: [{ type: 'lifeIds', ids: [154, 155, 156, ...range(167, 173)] }, { type: 'moduleRole', role: 'customerService' }] },
  ] },
  { slug: 'social-relationship', icon: '🧑‍🤝‍🧑', title: '社交关系', subtitle: '认识朋友、关系推进、聚会、边界和商务社交。', topics: [
    { slug: 'new-friends', title: '认识新朋友', subtitle: '第一次认识、共同话题、WhatsApp 和邀约。', sources: [{ type: 'lifeIds', ids: range(174, 183) }, { type: 'socialIds', ids: range(1, 20) }] },
    { slug: 'daily-friendship', title: '朋友日常', subtitle: '聊天、吃饭、帮忙、感谢和自然联系。', sources: [{ type: 'socialIds', ids: range(21, 70) }] },
    { slug: 'dating-relationship', title: '恋爱关系', subtitle: '约会、边界、表达好感和关系沟通。', sources: [{ type: 'lifeCategory', category: 'dating' }] },
    { slug: 'business-social', title: '商务社交', subtitle: '客户饭局、跟进、关系维护和不冒犯。', sources: [{ type: 'lifeIds', ids: range(184, 189) }] },
  ] },
  { slug: 'public-service', icon: '🏛', title: '办事服务', subtitle: '银行、医疗、文件、公寓管理和窗口沟通。', topics: [
    { slug: 'bank-payment', title: '银行支付', subtitle: 'ATM、取钱、换钱、转账和付款确认。', sources: [{ type: 'lifeIds', ids: [...range(112, 117), 190] }] },
    { slug: 'medical-pharmacy', title: '医院药店', subtitle: '看医生、买药、过敏和用药说明。', sources: [{ type: 'lifeIds', ids: range(118, 122) }] },
    { slug: 'documents-counter', title: '窗口办事', subtitle: '文件不齐、问流程、确认下一步。', sources: [{ type: 'lifeIds', ids: [143, 190] }] },
    { slug: 'property-service', title: '物业服务', subtitle: '找管理处、报修、门禁、漏水和网络问题。', sources: [{ type: 'lifeIds', ids: [128, 129, 130, 131, 132, 191, 193] }] },
    { slug: 'courier-service', title: '快递服务', subtitle: '快递显示送达、实际没收到、送错和联系骑手。', sources: [{ type: 'lifeIds', ids: [133, 134, 135, 136, 192] }] },
  ] },
  { slug: 'travel-emergency', icon: '✈️', title: '旅行突发', subtitle: '酒店、问路、航班延误、事故和东西丢失。', topics: [
    { slug: 'hotel-problem', title: '酒店问题', subtitle: '入住后发现房间、设施或服务问题。', sources: [{ type: 'lifeIds', ids: [194] }] },
    { slug: 'ask-directions', title: '问路确认', subtitle: '陌生地点问路、确认没走错。', sources: [{ type: 'lifeIds', ids: [195] }] },
    { slug: 'flight-delay', title: '航班延误', subtitle: '航班变化、重新安排行程。', sources: [{ type: 'lifeIds', ids: [196] }] },
    { slug: 'accident-emergency', title: '事故处理', subtitle: '交通事故、现场安全、联系司机和保险。', sources: [{ type: 'lifeIds', ids: [197] }] },
    { slug: 'lost-item', title: '物品丢失', subtitle: '手机、钱包、证件或重要东西突然丢了。', sources: [{ type: 'lifeIds', ids: [198] }] },
    { slug: 'airport-help', title: '机场求助', subtitle: '机场接人、航站楼、行李和延误沟通。', sources: [{ type: 'driverIds', ids: [17, 35, 39] }] },
  ] },
];

export const legacyLifeCategoryToSceneMap: Partial<Record<LifeWorkflowSlug, { group: SceneMapLevel2Slug; topic: string }>> = {
  friends: { group: 'social-relationship', topic: 'new-friends' },
  basics: { group: 'public-service', topic: 'bank-payment' },
  supermarket: { group: 'life-home', topic: 'belanja-konsumsi' },
  restaurant: { group: 'life-home', topic: 'masak-makan' },
  business: { group: 'work-business', topic: 'office-collaboration' },
  dating: { group: 'social-relationship', topic: 'dating-relationship' },
  'rumah-harian': { group: 'life-home', topic: 'rumah-harian' },
};

export function resolveLegacyLifeCategory(category: string | undefined) {
  return isLifeWorkflow(category) ? legacyLifeCategoryToSceneMap[category] : undefined;
}

export function getSceneMapGroup(slug: string | undefined) {
  return sceneMapV2.find((group) => group.slug === slug);
}

export function getSceneMapTopic(groupSlug: string | undefined, topicSlug: string | undefined) {
  return getSceneMapGroup(groupSlug)?.topics.find((topic) => topic.slug === topicSlug);
}

export function getSceneMapEntries(topic: SceneMapTopic): SceneMapEntry[] {
  const unique = new Map<string, SceneMapEntry>();
  for (const source of topic.sources) for (const item of collectSource(source)) unique.set(item.id, item);
  return [...unique.values()].sort((a, b) => a.id.localeCompare(b.id, 'en', { numeric: true }));
}

export function getSceneMapTopicCounts(topic: SceneMapTopic) {
  const entries = getSceneMapEntries(topic);
  return { all: entries.length, golden: entries.filter((item) => item.kind === 'golden').length, quick: entries.filter((item) => item.kind === 'quick').length };
}

export function getSceneMapGroupCount(group: SceneMapLevel2) {
  return group.topics.reduce((total, topic) => total + getSceneMapTopicCounts(topic).all, 0);
}

