import type { BasicConcept } from './basic-essentials';

export type RealUseType = 'phrase' | 'sentence' | 'micro_scene';

export type RealUseItem = {
  indonesian: string;
  chinese: string;
  ttsText: string;
  conceptIds: string[];
};

export type RealUseUnit = {
  id: string;
  type: RealUseType;
  titleZh: string;
  contextZh?: string;
  items: RealUseItem[];
  relatedSceneIds?: string[];
  status: 'active';
};

export type LearningGroupRealUseBinding = {
  learningGroupId: string;
  categoryId: string;
  subcategoryId: string;
  group: number;
  realUseId: string;
};

export const BASIC_REAL_USE_EXPECTED_STATS = {
  totalConcepts: 633,
  totalLearningGroups: 93,
  totalRealUseUnits: 93,
  totalRealUseItems: 279,
  phrase: 34,
  sentence: 48,
  microScene: 11,
} as const;

export function getLearningGroupId(categoryId: string, subcategoryId: string, group: number) {
  return `${categoryId}:${subcategoryId}:${group}`;
}

export const basicRealUseGroupBindings: LearningGroupRealUseBinding[] = [
  { learningGroupId: getLearningGroupId("core", "numbers", 1), categoryId: "core", subcategoryId: "numbers", group: 1, realUseId: "real-use-be-v1-g001" },
  { learningGroupId: getLearningGroupId("core", "numbers", 2), categoryId: "core", subcategoryId: "numbers", group: 2, realUseId: "real-use-be-v1-g002" },
  { learningGroupId: getLearningGroupId("core", "numbers", 3), categoryId: "core", subcategoryId: "numbers", group: 3, realUseId: "real-use-be-v1-g003" },
  { learningGroupId: getLearningGroupId("core", "numbers", 4), categoryId: "core", subcategoryId: "numbers", group: 4, realUseId: "real-use-be-v1-g004" },
  { learningGroupId: getLearningGroupId("core", "numbers", 5), categoryId: "core", subcategoryId: "numbers", group: 5, realUseId: "real-use-be-v1-g005" },
  { learningGroupId: getLearningGroupId("core", "time-date", 1), categoryId: "core", subcategoryId: "time-date", group: 1, realUseId: "real-use-be-v1-g006" },
  { learningGroupId: getLearningGroupId("core", "time-date", 2), categoryId: "core", subcategoryId: "time-date", group: 2, realUseId: "real-use-be-v1-g007" },
  { learningGroupId: getLearningGroupId("core", "time-date", 3), categoryId: "core", subcategoryId: "time-date", group: 3, realUseId: "real-use-be-v1-g008" },
  { learningGroupId: getLearningGroupId("core", "time-date", 4), categoryId: "core", subcategoryId: "time-date", group: 4, realUseId: "real-use-be-v1-g009" },
  { learningGroupId: getLearningGroupId("core", "time-date", 5), categoryId: "core", subcategoryId: "time-date", group: 5, realUseId: "real-use-be-v1-g010" },
  { learningGroupId: getLearningGroupId("core", "time-date", 6), categoryId: "core", subcategoryId: "time-date", group: 6, realUseId: "real-use-be-v1-g011" },
  { learningGroupId: getLearningGroupId("core", "directions", 1), categoryId: "core", subcategoryId: "directions", group: 1, realUseId: "real-use-be-v1-g012" },
  { learningGroupId: getLearningGroupId("core", "directions", 2), categoryId: "core", subcategoryId: "directions", group: 2, realUseId: "real-use-be-v1-g013" },
  { learningGroupId: getLearningGroupId("core", "directions", 3), categoryId: "core", subcategoryId: "directions", group: 3, realUseId: "real-use-be-v1-g014" },
  { learningGroupId: getLearningGroupId("core", "actions", 1), categoryId: "core", subcategoryId: "actions", group: 1, realUseId: "real-use-be-v1-g015" },
  { learningGroupId: getLearningGroupId("core", "actions", 2), categoryId: "core", subcategoryId: "actions", group: 2, realUseId: "real-use-be-v1-g016" },
  { learningGroupId: getLearningGroupId("core", "actions", 3), categoryId: "core", subcategoryId: "actions", group: 3, realUseId: "real-use-be-v1-g017" },
  { learningGroupId: getLearningGroupId("core", "actions", 4), categoryId: "core", subcategoryId: "actions", group: 4, realUseId: "real-use-be-v1-g018" },
  { learningGroupId: getLearningGroupId("core", "actions", 5), categoryId: "core", subcategoryId: "actions", group: 5, realUseId: "real-use-be-v1-g019" },
  { learningGroupId: getLearningGroupId("core", "actions", 6), categoryId: "core", subcategoryId: "actions", group: 6, realUseId: "real-use-be-v1-g020" },
  { learningGroupId: getLearningGroupId("core", "actions", 7), categoryId: "core", subcategoryId: "actions", group: 7, realUseId: "real-use-be-v1-g021" },
  { learningGroupId: getLearningGroupId("core", "ability-need", 1), categoryId: "core", subcategoryId: "ability-need", group: 1, realUseId: "real-use-be-v1-g022" },
  { learningGroupId: getLearningGroupId("core", "ability-need", 2), categoryId: "core", subcategoryId: "ability-need", group: 2, realUseId: "real-use-be-v1-g023" },
  { learningGroupId: getLearningGroupId("core", "ability-need", 3), categoryId: "core", subcategoryId: "ability-need", group: 3, realUseId: "real-use-be-v1-g024" },
  { learningGroupId: getLearningGroupId("core", "questions-pronouns", 1), categoryId: "core", subcategoryId: "questions-pronouns", group: 1, realUseId: "real-use-be-v1-g025" },
  { learningGroupId: getLearningGroupId("core", "questions-pronouns", 2), categoryId: "core", subcategoryId: "questions-pronouns", group: 2, realUseId: "real-use-be-v1-g026" },
  { learningGroupId: getLearningGroupId("core", "questions-pronouns", 3), categoryId: "core", subcategoryId: "questions-pronouns", group: 3, realUseId: "real-use-be-v1-g027" },
  { learningGroupId: getLearningGroupId("core", "questions-pronouns", 4), categoryId: "core", subcategoryId: "questions-pronouns", group: 4, realUseId: "real-use-be-v1-g028" },
  { learningGroupId: getLearningGroupId("core", "questions-pronouns", 5), categoryId: "core", subcategoryId: "questions-pronouns", group: 5, realUseId: "real-use-be-v1-g029" },
  { learningGroupId: getLearningGroupId("core", "measurement", 1), categoryId: "core", subcategoryId: "measurement", group: 1, realUseId: "real-use-be-v1-g030" },
  { learningGroupId: getLearningGroupId("core", "measurement", 2), categoryId: "core", subcategoryId: "measurement", group: 2, realUseId: "real-use-be-v1-g031" },
  { learningGroupId: getLearningGroupId("core", "descriptions", 1), categoryId: "core", subcategoryId: "descriptions", group: 1, realUseId: "real-use-be-v1-g032" },
  { learningGroupId: getLearningGroupId("core", "descriptions", 2), categoryId: "core", subcategoryId: "descriptions", group: 2, realUseId: "real-use-be-v1-g033" },
  { learningGroupId: getLearningGroupId("core", "descriptions", 3), categoryId: "core", subcategoryId: "descriptions", group: 3, realUseId: "real-use-be-v1-g034" },
  { learningGroupId: getLearningGroupId("core", "descriptions", 4), categoryId: "core", subcategoryId: "descriptions", group: 4, realUseId: "real-use-be-v1-g035" },
  { learningGroupId: getLearningGroupId("core", "descriptions", 5), categoryId: "core", subcategoryId: "descriptions", group: 5, realUseId: "real-use-be-v1-g036" },
  { learningGroupId: getLearningGroupId("core", "descriptions", 6), categoryId: "core", subcategoryId: "descriptions", group: 6, realUseId: "real-use-be-v1-g037" },
  { learningGroupId: getLearningGroupId("core", "particles", 1), categoryId: "core", subcategoryId: "particles", group: 1, realUseId: "real-use-be-v1-g038" },
  { learningGroupId: getLearningGroupId("core", "particles", 2), categoryId: "core", subcategoryId: "particles", group: 2, realUseId: "real-use-be-v1-g039" },
  { learningGroupId: getLearningGroupId("feelings", "body-feelings", 1), categoryId: "feelings", subcategoryId: "body-feelings", group: 1, realUseId: "real-use-be-v1-g040" },
  { learningGroupId: getLearningGroupId("feelings", "body-feelings", 2), categoryId: "feelings", subcategoryId: "body-feelings", group: 2, realUseId: "real-use-be-v1-g041" },
  { learningGroupId: getLearningGroupId("feelings", "pain-discomfort", 1), categoryId: "feelings", subcategoryId: "pain-discomfort", group: 1, realUseId: "real-use-be-v1-g042" },
  { learningGroupId: getLearningGroupId("feelings", "pain-discomfort", 2), categoryId: "feelings", subcategoryId: "pain-discomfort", group: 2, realUseId: "real-use-be-v1-g043" },
  { learningGroupId: getLearningGroupId("feelings", "emotions", 1), categoryId: "feelings", subcategoryId: "emotions", group: 1, realUseId: "real-use-be-v1-g044" },
  { learningGroupId: getLearningGroupId("feelings", "emotions", 2), categoryId: "feelings", subcategoryId: "emotions", group: 2, realUseId: "real-use-be-v1-g045" },
  { learningGroupId: getLearningGroupId("feelings", "emotions", 3), categoryId: "feelings", subcategoryId: "emotions", group: 3, realUseId: "real-use-be-v1-g046" },
  { learningGroupId: getLearningGroupId("food", "vegetables", 1), categoryId: "food", subcategoryId: "vegetables", group: 1, realUseId: "real-use-be-v1-g047" },
  { learningGroupId: getLearningGroupId("food", "vegetables", 2), categoryId: "food", subcategoryId: "vegetables", group: 2, realUseId: "real-use-be-v1-g048" },
  { learningGroupId: getLearningGroupId("food", "vegetables", 3), categoryId: "food", subcategoryId: "vegetables", group: 3, realUseId: "real-use-be-v1-g049" },
  { learningGroupId: getLearningGroupId("food", "fruits", 1), categoryId: "food", subcategoryId: "fruits", group: 1, realUseId: "real-use-be-v1-g050" },
  { learningGroupId: getLearningGroupId("food", "fruits", 2), categoryId: "food", subcategoryId: "fruits", group: 2, realUseId: "real-use-be-v1-g051" },
  { learningGroupId: getLearningGroupId("food", "fruits", 3), categoryId: "food", subcategoryId: "fruits", group: 3, realUseId: "real-use-be-v1-g052" },
  { learningGroupId: getLearningGroupId("food", "meat-seafood", 1), categoryId: "food", subcategoryId: "meat-seafood", group: 1, realUseId: "real-use-be-v1-g053" },
  { learningGroupId: getLearningGroupId("food", "meat-seafood", 2), categoryId: "food", subcategoryId: "meat-seafood", group: 2, realUseId: "real-use-be-v1-g054" },
  { learningGroupId: getLearningGroupId("food", "seasonings", 1), categoryId: "food", subcategoryId: "seasonings", group: 1, realUseId: "real-use-be-v1-g055" },
  { learningGroupId: getLearningGroupId("food", "seasonings", 2), categoryId: "food", subcategoryId: "seasonings", group: 2, realUseId: "real-use-be-v1-g056" },
  { learningGroupId: getLearningGroupId("food", "staples", 1), categoryId: "food", subcategoryId: "staples", group: 1, realUseId: "real-use-be-v1-g057" },
  { learningGroupId: getLearningGroupId("food", "staples", 2), categoryId: "food", subcategoryId: "staples", group: 2, realUseId: "real-use-be-v1-g058" },
  { learningGroupId: getLearningGroupId("food", "drinks", 1), categoryId: "food", subcategoryId: "drinks", group: 1, realUseId: "real-use-be-v1-g059" },
  { learningGroupId: getLearningGroupId("food", "drinks", 2), categoryId: "food", subcategoryId: "drinks", group: 2, realUseId: "real-use-be-v1-g060" },
  { learningGroupId: getLearningGroupId("food", "taste-texture", 1), categoryId: "food", subcategoryId: "taste-texture", group: 1, realUseId: "real-use-be-v1-g061" },
  { learningGroupId: getLearningGroupId("food", "taste-texture", 2), categoryId: "food", subcategoryId: "taste-texture", group: 2, realUseId: "real-use-be-v1-g062" },
  { learningGroupId: getLearningGroupId("food", "cooking-actions", 1), categoryId: "food", subcategoryId: "cooking-actions", group: 1, realUseId: "real-use-be-v1-g063" },
  { learningGroupId: getLearningGroupId("food", "cooking-actions", 2), categoryId: "food", subcategoryId: "cooking-actions", group: 2, realUseId: "real-use-be-v1-g064" },
  { learningGroupId: getLearningGroupId("body-clothing", "body-parts", 1), categoryId: "body-clothing", subcategoryId: "body-parts", group: 1, realUseId: "real-use-be-v1-g065" },
  { learningGroupId: getLearningGroupId("body-clothing", "body-parts", 2), categoryId: "body-clothing", subcategoryId: "body-parts", group: 2, realUseId: "real-use-be-v1-g066" },
  { learningGroupId: getLearningGroupId("body-clothing", "body-parts", 3), categoryId: "body-clothing", subcategoryId: "body-parts", group: 3, realUseId: "real-use-be-v1-g067" },
  { learningGroupId: getLearningGroupId("body-clothing", "clothes-accessories", 1), categoryId: "body-clothing", subcategoryId: "clothes-accessories", group: 1, realUseId: "real-use-be-v1-g068" },
  { learningGroupId: getLearningGroupId("body-clothing", "clothes-accessories", 2), categoryId: "body-clothing", subcategoryId: "clothes-accessories", group: 2, realUseId: "real-use-be-v1-g069" },
  { learningGroupId: getLearningGroupId("body-clothing", "wearing-size", 1), categoryId: "body-clothing", subcategoryId: "wearing-size", group: 1, realUseId: "real-use-be-v1-g070" },
  { learningGroupId: getLearningGroupId("home", "home-items", 1), categoryId: "home", subcategoryId: "home-items", group: 1, realUseId: "real-use-be-v1-g071" },
  { learningGroupId: getLearningGroupId("home", "home-items", 2), categoryId: "home", subcategoryId: "home-items", group: 2, realUseId: "real-use-be-v1-g072" },
  { learningGroupId: getLearningGroupId("home", "home-items", 3), categoryId: "home", subcategoryId: "home-items", group: 3, realUseId: "real-use-be-v1-g073" },
  { learningGroupId: getLearningGroupId("home", "kitchen-items", 1), categoryId: "home", subcategoryId: "kitchen-items", group: 1, realUseId: "real-use-be-v1-g074" },
  { learningGroupId: getLearningGroupId("home", "kitchen-items", 2), categoryId: "home", subcategoryId: "kitchen-items", group: 2, realUseId: "real-use-be-v1-g075" },
  { learningGroupId: getLearningGroupId("home", "kitchen-items", 3), categoryId: "home", subcategoryId: "kitchen-items", group: 3, realUseId: "real-use-be-v1-g076" },
  { learningGroupId: getLearningGroupId("home", "kitchen-items", 4), categoryId: "home", subcategoryId: "kitchen-items", group: 4, realUseId: "real-use-be-v1-g077" },
  { learningGroupId: getLearningGroupId("home", "personal-care", 1), categoryId: "home", subcategoryId: "personal-care", group: 1, realUseId: "real-use-be-v1-g078" },
  { learningGroupId: getLearningGroupId("home", "personal-care", 2), categoryId: "home", subcategoryId: "personal-care", group: 2, realUseId: "real-use-be-v1-g079" },
  { learningGroupId: getLearningGroupId("home", "cleaning-laundry", 1), categoryId: "home", subcategoryId: "cleaning-laundry", group: 1, realUseId: "real-use-be-v1-g080" },
  { learningGroupId: getLearningGroupId("home", "cleaning-laundry", 2), categoryId: "home", subcategoryId: "cleaning-laundry", group: 2, realUseId: "real-use-be-v1-g081" },
  { learningGroupId: getLearningGroupId("home", "personal-electronics", 1), categoryId: "home", subcategoryId: "personal-electronics", group: 1, realUseId: "real-use-be-v1-g082" },
  { learningGroupId: getLearningGroupId("home", "personal-electronics", 2), categoryId: "home", subcategoryId: "personal-electronics", group: 2, realUseId: "real-use-be-v1-g083" },
  { learningGroupId: getLearningGroupId("home", "personal-electronics", 3), categoryId: "home", subcategoryId: "personal-electronics", group: 3, realUseId: "real-use-be-v1-g084" },
  { learningGroupId: getLearningGroupId("transport", "car-ride", 1), categoryId: "transport", subcategoryId: "car-ride", group: 1, realUseId: "real-use-be-v1-g085" },
  { learningGroupId: getLearningGroupId("transport", "car-ride", 2), categoryId: "transport", subcategoryId: "car-ride", group: 2, realUseId: "real-use-be-v1-g086" },
  { learningGroupId: getLearningGroupId("transport", "motorbike", 1), categoryId: "transport", subcategoryId: "motorbike", group: 1, realUseId: "real-use-be-v1-g087" },
  { learningGroupId: getLearningGroupId("transport", "road-parking", 1), categoryId: "transport", subcategoryId: "road-parking", group: 1, realUseId: "real-use-be-v1-g088" },
  { learningGroupId: getLearningGroupId("transport", "road-parking", 2), categoryId: "transport", subcategoryId: "road-parking", group: 2, realUseId: "real-use-be-v1-g089" },
  { learningGroupId: getLearningGroupId("transport", "fuel", 1), categoryId: "transport", subcategoryId: "fuel", group: 1, realUseId: "real-use-be-v1-g090" },
  { learningGroupId: getLearningGroupId("transport", "ev-charging", 1), categoryId: "transport", subcategoryId: "ev-charging", group: 1, realUseId: "real-use-be-v1-g091" },
  { learningGroupId: getLearningGroupId("transport", "airport", 1), categoryId: "transport", subcategoryId: "airport", group: 1, realUseId: "real-use-be-v1-g092" },
  { learningGroupId: getLearningGroupId("transport", "airport", 2), categoryId: "transport", subcategoryId: "airport", group: 2, realUseId: "real-use-be-v1-g093" },
];

export const basicRealUseUnits: RealUseUnit[] = [
  {
    id: "real-use-be-v1-g001",
    type: "phrase",
    titleZh: "最先能用的 0–6",
    status: 'active',
    items: [
      { indonesian: "satu orang", chinese: "一个人", ttsText: "satu orang", conceptIds: ["satu"] },
      { indonesian: "dua botol", chinese: "两瓶", ttsText: "dua botol", conceptIds: ["dua"] },
      { indonesian: "kosong delapan", chinese: "08（读电话号码时）", ttsText: "kosong delapan", conceptIds: ["kosong","delapan"] },
    ],
  },
  {
    id: "real-use-be-v1-g002",
    type: "phrase",
    titleZh: "7–14 的价格和时间",
    status: 'active',
    items: [
      { indonesian: "jam delapan", chinese: "八点", ttsText: "jam delapan", conceptIds: ["delapan"] },
      { indonesian: "sepuluh ribu", chinese: "一万", ttsText: "sepuluh ribu", conceptIds: ["sepuluh"] },
      { indonesian: "dua belas orang", chinese: "十二个人", ttsText: "dua belas orang", conceptIds: ["dua-belas"] },
    ],
  },
  {
    id: "real-use-be-v1-g003",
    type: "phrase",
    titleZh: "十几到几十",
    status: 'active',
    items: [
      { indonesian: "lima belas menit", chinese: "十五分钟", ttsText: "lima belas menit", conceptIds: ["lima-belas"] },
      { indonesian: "dua puluh ribu", chinese: "两万", ttsText: "dua puluh ribu", conceptIds: ["dua-puluh"] },
      { indonesian: "tiga puluh orang", chinese: "三十个人", ttsText: "tiga puluh orang", conceptIds: ["tiga-puluh"] },
    ],
  },
  {
    id: "real-use-be-v1-g004",
    type: "phrase",
    titleZh: "买东西最常见的大数字",
    status: 'active',
    items: [
      { indonesian: "lima puluh ribu", chinese: "五万", ttsText: "lima puluh ribu", conceptIds: ["lima-puluh"] },
      { indonesian: "seratus ribu", chinese: "十万", ttsText: "seratus ribu", conceptIds: ["seratus-ribu"] },
      { indonesian: "dua ratus ribu", chinese: "二十万", ttsText: "dua ratus ribu", conceptIds: ["dua-ratus"] },
    ],
  },
  {
    id: "real-use-be-v1-g005",
    type: "phrase",
    titleZh: "百万级金额",
    status: 'active',
    items: [
      { indonesian: "satu juta rupiah", chinese: "一百万印尼盾", ttsText: "satu juta rupiah", conceptIds: ["satu-juta"] },
      { indonesian: "dua juta rupiah", chinese: "两百万印尼盾", ttsText: "dua juta rupiah", conceptIds: ["dua-juta"] },
      { indonesian: "totalnya satu juta", chinese: "总共一百万", ttsText: "totalnya satu juta", conceptIds: ["satu-juta"] },
    ],
  },
  {
    id: "real-use-be-v1-g006",
    type: "sentence",
    titleZh: "现在、等下、刚才",
    status: 'active',
    items: [
      { indonesian: "Sebentar ya.", chinese: "等一下。", ttsText: "Sebentar ya.", conceptIds: ["sebentar"] },
      { indonesian: "Nanti saya kabari.", chinese: "等下我告诉你。", ttsText: "Nanti saya kabari.", conceptIds: ["nanti"] },
      { indonesian: "Sekarang bisa?", chinese: "现在可以吗？", ttsText: "Sekarang bisa?", conceptIds: ["sekarang"] },
    ],
  },
  {
    id: "real-use-be-v1-g007",
    type: "sentence",
    titleZh: "今天、明天、早中晚",
    status: 'active',
    items: [
      { indonesian: "Besok pagi bisa?", chinese: "明天早上可以吗？", ttsText: "Besok pagi bisa?", conceptIds: ["besok","pagi"] },
      { indonesian: "Hari ini saja.", chinese: "就今天吧。", ttsText: "Hari ini saja.", conceptIds: ["hari-ini"] },
      { indonesian: "Bentar, saya cek dulu.", chinese: "等下，我先看一下。", ttsText: "Bentar, saya cek dulu.", conceptIds: ["bentar"] },
    ],
  },
  {
    id: "real-use-be-v1-g008",
    type: "phrase",
    titleZh: "星期和周期",
    status: 'active',
    items: [
      { indonesian: "Senin malam", chinese: "周一晚上", ttsText: "Senin malam", conceptIds: ["senin","malam"] },
      { indonesian: "minggu depan", chinese: "下周", ttsText: "minggu depan", conceptIds: ["minggu"] },
      { indonesian: "bulan ini", chinese: "这个月", ttsText: "bulan ini", conceptIds: ["bulan"] },
    ],
  },
  {
    id: "real-use-be-v1-g009",
    type: "phrase",
    titleZh: "具体日期约时间",
    status: 'active',
    items: [
      { indonesian: "Jumat pagi", chinese: "周五早上", ttsText: "Jumat pagi", conceptIds: ["jumat"] },
      { indonesian: "Sabtu sore", chinese: "周六下午", ttsText: "Sabtu sore", conceptIds: ["sabtu"] },
      { indonesian: "bulan Maret", chinese: "三月", ttsText: "bulan Maret", conceptIds: ["maret"] },
    ],
  },
  {
    id: "real-use-be-v1-g010",
    type: "phrase",
    titleZh: "月份表达",
    status: 'active',
    items: [
      { indonesian: "awal Mei", chinese: "五月初", ttsText: "awal Mei", conceptIds: ["mei"] },
      { indonesian: "akhir Desember", chinese: "十二月底", ttsText: "akhir Desember", conceptIds: ["desember"] },
      { indonesian: "bulan Agustus", chinese: "八月", ttsText: "bulan Agustus", conceptIds: ["agustus"] },
    ],
  },
  {
    id: "real-use-be-v1-g011",
    type: "sentence",
    titleZh: "半点不要听错",
    status: 'active',
    items: [
      { indonesian: "Jam setengah sembilan.", chinese: "八点半。", ttsText: "Jam setengah sembilan.", conceptIds: ["setengah"] },
      { indonesian: "Saya datang jam setengah sembilan.", chinese: "我八点半来。", ttsText: "Saya datang jam setengah sembilan.", conceptIds: ["setengah"] },
      { indonesian: "Jam setengah sembilan ya.", chinese: "八点半哦。", ttsText: "Jam setengah sembilan ya.", conceptIds: ["setengah"] },
      { indonesian: "Jam setengah sembilan, bukan sembilan.", chinese: "八点半，不是九点。", ttsText: "Jam setengah sembilan, bukan sembilan.", conceptIds: ["setengah"] },
    ],
  },
  {
    id: "real-use-be-v1-g012",
    type: "phrase",
    titleZh: "最基础方位块",
    status: 'active',
    items: [
      { indonesian: "sebelah kanan", chinese: "右边", ttsText: "sebelah kanan", conceptIds: ["kanan"] },
      { indonesian: "di depan", chinese: "在前面", ttsText: "di depan", conceptIds: ["depan"] },
      { indonesian: "di dalam", chinese: "在里面", ttsText: "di dalam", conceptIds: ["dalam"] },
    ],
  },
  {
    id: "real-use-be-v1-g013",
    type: "phrase",
    titleZh: "这里、那里、旁边",
    status: 'active',
    items: [
      { indonesian: "di samping", chinese: "在旁边", ttsText: "di samping", conceptIds: ["samping"] },
      { indonesian: "dekat sini", chinese: "离这里近", ttsText: "dekat sini", conceptIds: ["dekat","sini"] },
      { indonesian: "di seberang sana", chinese: "在那边对面", ttsText: "di seberang sana", conceptIds: ["seberang","sana"] },
    ],
  },
  {
    id: "real-use-be-v1-g014",
    type: "micro_scene",
    titleZh: "找入口和等人",
    contextZh: "这些位置块天然可以组成一个真实找人/找入口的小瞬间。",
    status: 'active',
    items: [
      { indonesian: "Saya di sini.", chinese: "我在这里。", ttsText: "Saya di sini.", conceptIds: ["di-sini"] },
      { indonesian: "Kamu tunggu di depan.", chinese: "你在前面等。", ttsText: "Kamu tunggu di depan.", conceptIds: ["di-depan"] },
      { indonesian: "Pintu masuk di sebelah kanan.", chinese: "入口在右边。", ttsText: "Pintu masuk di sebelah kanan.", conceptIds: ["sebelah-kanan"] },
    ],
  },
  {
    id: "real-use-be-v1-g015",
    type: "micro_scene",
    titleZh: "问人到没到",
    contextZh: "这一组动作自然形成“来、到、进去、回去”的真实沟通链。",
    status: 'active',
    items: [
      { indonesian: "Kamu sudah sampai?", chinese: "你到了吗？", ttsText: "Kamu sudah sampai?", conceptIds: ["sampai"] },
      { indonesian: "Saya baru masuk.", chinese: "我刚进去。", ttsText: "Saya baru masuk.", conceptIds: ["masuk"] },
      { indonesian: "Nanti saya pulang.", chinese: "等下我回去。", ttsText: "Nanti saya pulang.", conceptIds: ["pulang"] },
    ],
  },
  {
    id: "real-use-be-v1-g016",
    type: "micro_scene",
    titleZh: "在家里让人帮忙拿放",
    contextZh: "拿、放、带、坐、起身天然适合短指令微场景。",
    status: 'active',
    items: [
      { indonesian: "Tolong ambil ini.", chinese: "帮我拿这个。", ttsText: "Tolong ambil ini.", conceptIds: ["ambil"] },
      { indonesian: "Taruh di sini.", chinese: "放在这里。", ttsText: "Taruh di sini.", conceptIds: ["taruh"] },
      { indonesian: "Bawa ke mobil ya.", chinese: "帮我带到车上。", ttsText: "Bawa ke mobil ya.", conceptIds: ["bawa"] },
    ],
  },
  {
    id: "real-use-be-v1-g017",
    type: "micro_scene",
    titleZh: "开关和确认",
    contextZh: "开、关、看、听是家里和办公室最常见的即时动作请求。",
    status: 'active',
    items: [
      { indonesian: "Buka pintunya.", chinese: "把门打开。", ttsText: "Buka pintunya.", conceptIds: ["buka"] },
      { indonesian: "Matikan lampunya.", chinese: "把灯关掉。", ttsText: "Matikan lampunya.", conceptIds: ["matikan"] },
      { indonesian: "Coba lihat ini.", chinese: "你看一下这个。", ttsText: "Coba lihat ini.", conceptIds: ["lihat"] },
    ],
  },
  {
    id: "real-use-be-v1-g018",
    type: "micro_scene",
    titleZh: "买东西前先问清楚",
    contextZh: "问、找、买、付钱自然组成一个低门槛真实购物瞬间。",
    status: 'active',
    items: [
      { indonesian: "Tanya dulu harganya.", chinese: "先问一下价格。", ttsText: "Tanya dulu harganya.", conceptIds: ["tanya"] },
      { indonesian: "Saya mau beli yang ini.", chinese: "我想买这个。", ttsText: "Saya mau beli yang ini.", conceptIds: ["beli"] },
      { indonesian: "Bayar pakai QRIS bisa?", chinese: "可以用 QRIS 付款吗？", ttsText: "Bayar pakai QRIS bisa?", conceptIds: ["bayar"] },
    ],
  },
  {
    id: "real-use-be-v1-g019",
    type: "micro_scene",
    titleZh: "让人调整东西",
    contextZh: "这一组最常用于“换一下、加一点、少一点、洗一下”的现实指令。",
    status: 'active',
    items: [
      { indonesian: "Pakai yang ini saja.", chinese: "用这个就行。", ttsText: "Pakai yang ini saja.", conceptIds: ["pakai"] },
      { indonesian: "Tambah sedikit ya.", chinese: "加一点。", ttsText: "Tambah sedikit ya.", conceptIds: ["tambah"] },
      { indonesian: "Tolong cuci dulu.", chinese: "请先洗一下。", ttsText: "Tolong cuci dulu.", conceptIds: ["cuci"] },
    ],
  },
  {
    id: "real-use-be-v1-g020",
    type: "sentence",
    titleZh: "工作和家务里的处理动作",
    status: 'active',
    items: [
      { indonesian: "Tolong cek dulu.", chinese: "请先检查一下。", ttsText: "Tolong cek dulu.", conceptIds: ["cek"] },
      { indonesian: "Kalau sudah, kirim ke saya.", chinese: "好了发给我。", ttsText: "Kalau sudah, kirim ke saya.", conceptIds: ["kirim"] },
      { indonesian: "Buang yang rusak.", chinese: "把坏的扔掉。", ttsText: "Buang yang rusak.", conceptIds: ["buang"] },
    ],
  },
  {
    id: "real-use-be-v1-g021",
    type: "sentence",
    titleZh: "睡醒和打包",
    status: 'active',
    items: [
      { indonesian: "Saya mau tidur dulu.", chinese: "我想先睡一下。", ttsText: "Saya mau tidur dulu.", conceptIds: ["tidur"] },
      { indonesian: "Besok bangun jam enam.", chinese: "明天六点起床。", ttsText: "Besok bangun jam enam.", conceptIds: ["bangun"] },
      { indonesian: "Tolong bungkus ya.", chinese: "帮我打包。", ttsText: "Tolong bungkus ya.", conceptIds: ["bungkus"] },
    ],
  },
  {
    id: "real-use-be-v1-g022",
    type: "sentence",
    titleZh: "有、没有、好了没",
    status: 'active',
    items: [
      { indonesian: "Sudah ada?", chinese: "已经有了吗？", ttsText: "Sudah ada?", conceptIds: ["sudah","ada"] },
      { indonesian: "Belum sampai.", chinese: "还没到。", ttsText: "Belum sampai.", conceptIds: ["belum"] },
      { indonesian: "Masih ada lagi?", chinese: "还有吗？", ttsText: "Masih ada lagi?", conceptIds: ["masih","ada","lagi"] },
    ],
  },
  {
    id: "real-use-be-v1-g023",
    type: "sentence",
    titleZh: "要不要、可不可以、必须",
    status: 'active',
    items: [
      { indonesian: "Saya mau yang ini.", chinese: "我要这个。", ttsText: "Saya mau yang ini.", conceptIds: ["mau"] },
      { indonesian: "Boleh coba?", chinese: "可以试一下吗？", ttsText: "Boleh coba?", conceptIds: ["boleh"] },
      { indonesian: "Harus hari ini.", chinese: "必须今天。", ttsText: "Harus hari ini.", conceptIds: ["harus"] },
    ],
  },
  {
    id: "real-use-be-v1-g024",
    type: "sentence",
    titleZh: "需要、不要、够不够",
    status: 'active',
    items: [
      { indonesian: "Saya butuh ini.", chinese: "我需要这个。", ttsText: "Saya butuh ini.", conceptIds: ["butuh"] },
      { indonesian: "Jangan terlalu banyak.", chinese: "不要太多。", ttsText: "Jangan terlalu banyak.", conceptIds: ["jangan"] },
      { indonesian: "Cukup, terima kasih.", chinese: "够了，谢谢。", ttsText: "Cukup, terima kasih.", conceptIds: ["cukup"] },
    ],
  },
  {
    id: "real-use-be-v1-g025",
    type: "sentence",
    titleZh: "我、你、这个、那个",
    status: 'active',
    items: [
      { indonesian: "Saya mau ini.", chinese: "我要这个。", ttsText: "Saya mau ini.", conceptIds: ["saya","ini"] },
      { indonesian: "Kamu ambil itu.", chinese: "你拿那个。", ttsText: "Kamu ambil itu.", conceptIds: ["kamu","itu"] },
      { indonesian: "Kita tunggu dulu.", chinese: "我们先等一下。", ttsText: "Kita tunggu dulu.", conceptIds: ["kita"] },
    ],
  },
  {
    id: "real-use-be-v1-g026",
    type: "sentence",
    titleZh: "最有用的提问",
    status: 'active',
    items: [
      { indonesian: "Toiletnya di mana?", chinese: "厕所在哪里？", ttsText: "Toiletnya di mana?", conceptIds: ["di-mana"] },
      { indonesian: "Ini berapa?", chinese: "这个多少钱？", ttsText: "Ini berapa?", conceptIds: ["berapa"] },
      { indonesian: "Siapa yang pegang?", chinese: "谁拿着？", ttsText: "Siapa yang pegang?", conceptIds: ["siapa","yang"] },
    ],
  },
  {
    id: "real-use-be-v1-g027",
    type: "sentence",
    titleZh: "问时间、原因和情况",
    status: 'active',
    items: [
      { indonesian: "Kapan selesai?", chinese: "什么时候好？", ttsText: "Kapan selesai?", conceptIds: ["kapan"] },
      { indonesian: "Kenapa begitu?", chinese: "为什么会这样？", ttsText: "Kenapa begitu?", conceptIds: ["kenapa"] },
      { indonesian: "Gimana caranya?", chinese: "怎么弄？", ttsText: "Gimana caranya?", conceptIds: ["gimana"] },
    ],
  },
  {
    id: "real-use-be-v1-g028",
    type: "phrase",
    titleZh: "称呼和家庭关系",
    status: 'active',
    items: [
      { indonesian: "Pak Budi", chinese: "Budi 先生 / 对 Budi 的尊称", ttsText: "Pak Budi", conceptIds: ["pak"] },
      { indonesian: "Bu Sari", chinese: "Sari 女士 / 对 Sari 的尊称", ttsText: "Bu Sari", conceptIds: ["bu"] },
      { indonesian: "Kak, boleh tanya?", chinese: "Kak，可以问一下吗？（礼貌称呼，不一定是亲属）", ttsText: "Kak, boleh tanya?", conceptIds: ["kak"] },
    ],
  },
  {
    id: "real-use-be-v1-g029",
    type: "sentence",
    titleZh: "要名字、号码和照片",
    status: 'active',
    items: [
      { indonesian: "Nomornya berapa, Kak?", chinese: "号码是多少，Kak？", ttsText: "Nomornya berapa, Kak?", conceptIds: ["nomor","kak"] },
      { indonesian: "Kirim foto lewat WA ya.", chinese: "通过 WA 发照片。", ttsText: "Kirim foto lewat WA ya.", conceptIds: ["foto","wa"] },
      { indonesian: "Saya sudah kirim pesan.", chinese: "我已经发消息了。", ttsText: "Saya sudah kirim pesan.", conceptIds: ["pesan"] },
    ],
  },
  {
    id: "real-use-be-v1-g030",
    type: "phrase",
    titleZh: "数量和单位",
    status: 'active',
    items: [
      { indonesian: "sedikit saja", chinese: "一点点就行", ttsText: "sedikit saja", conceptIds: ["sedikit"] },
      { indonesian: "dua kilo", chinese: "两公斤", ttsText: "dua kilo", conceptIds: ["kilo"] },
      { indonesian: "satu meter", chinese: "一米", ttsText: "satu meter", conceptIds: ["meter"] },
    ],
  },
  {
    id: "real-use-be-v1-g031",
    type: "phrase",
    titleZh: "采购和生活单位",
    status: 'active',
    items: [
      { indonesian: "dua liter air", chinese: "两升水", ttsText: "dua liter air", conceptIds: ["liter"] },
      { indonesian: "satu kotak", chinese: "一盒", ttsText: "satu kotak", conceptIds: ["kotak-counter"] },
      { indonesian: "tiga lembar", chinese: "三张", ttsText: "tiga lembar", conceptIds: ["lembar-counter"] },
    ],
  },
  {
    id: "real-use-be-v1-g032",
    type: "phrase",
    titleZh: "大小长短高低",
    status: 'active',
    items: [
      { indonesian: "terlalu besar", chinese: "太大了", ttsText: "terlalu besar", conceptIds: ["besar"] },
      { indonesian: "agak sempit", chinese: "有点窄", ttsText: "agak sempit", conceptIds: ["sempit"] },
      { indonesian: "lebih tinggi", chinese: "更高一点", ttsText: "lebih tinggi", conceptIds: ["tinggi"] },
    ],
  },
  {
    id: "real-use-be-v1-g033",
    type: "sentence",
    titleZh: "厚薄、轻重、快慢",
    status: 'active',
    items: [
      { indonesian: "Ini terlalu berat.", chinese: "这个太重了。", ttsText: "Ini terlalu berat.", conceptIds: ["berat"] },
      { indonesian: "Pelan-pelan ya.", chinese: "慢一点。", ttsText: "Pelan-pelan ya.", conceptIds: ["pelan"] },
      { indonesian: "Ada yang baru?", chinese: "有新的吗？", ttsText: "Ada yang baru?", conceptIds: ["baru"] },
    ],
  },
  {
    id: "real-use-be-v1-g034",
    type: "sentence",
    titleZh: "好坏、干净、准备好",
    status: 'active',
    items: [
      { indonesian: "Sudah bersih?", chinese: "干净了吗？", ttsText: "Sudah bersih?", conceptIds: ["bersih"] },
      { indonesian: "Ini rusak.", chinese: "这个坏了。", ttsText: "Ini rusak.", conceptIds: ["rusak"] },
      { indonesian: "Sudah siap?", chinese: "准备好了吗？", ttsText: "Sudah siap?", conceptIds: ["siap"] },
    ],
  },
  {
    id: "real-use-be-v1-g035",
    type: "sentence",
    titleZh: "对不对、懂不懂",
    status: 'active',
    items: [
      { indonesian: "Betul, seperti itu.", chinese: "对，就那样。", ttsText: "Betul, seperti itu.", conceptIds: ["betul"] },
      { indonesian: "Ini beda.", chinese: "这个不一样。", ttsText: "Ini beda.", conceptIds: ["beda"] },
      { indonesian: "Sudah paham?", chinese: "明白了吗？", ttsText: "Sudah paham?", conceptIds: ["paham"] },
    ],
  },
  {
    id: "real-use-be-v1-g036",
    type: "sentence",
    titleZh: "价格和付款",
    status: 'active',
    items: [
      { indonesian: "Harganya berapa?", chinese: "价格多少？", ttsText: "Harganya berapa?", conceptIds: ["harga"] },
      { indonesian: "Mahal banget.", chinese: "太贵了。", ttsText: "Mahal banget.", conceptIds: ["mahal"] },
      { indonesian: "Bisa cash?", chinese: "可以现金吗？", ttsText: "Bisa cash?", conceptIds: ["cash"] },
    ],
  },
  {
    id: "real-use-be-v1-g037",
    type: "sentence",
    titleZh: "找零和转账",
    status: 'active',
    items: [
      { indonesian: "Ada kembalian?", chinese: "有零钱找吗？", ttsText: "Ada kembalian?", conceptIds: ["kembalian"] },
      { indonesian: "Bisa transfer?", chinese: "可以转账吗？", ttsText: "Bisa transfer?", conceptIds: ["transfer"] },
      { indonesian: "QRIS bisa?", chinese: "可以用 QRIS 吗？", ttsText: "QRIS bisa?", conceptIds: ["qris"] },
    ],
  },
  {
    id: "real-use-be-v1-g038",
    type: "sentence",
    titleZh: "不要乱用语气词",
    status: 'active',
    items: [
      { indonesian: "Tunggu sebentar ya.", chinese: "稍等一下。", ttsText: "Tunggu sebentar ya.", conceptIds: ["ya"] },
      { indonesian: "Ini nih.", chinese: "就是这个。", ttsText: "Ini nih.", conceptIds: ["nih"] },
      { indonesian: "Halo, Pak.", chinese: "您好，先生。", ttsText: "Halo, Pak.", conceptIds: ["halo"] },
    ],
  },
  {
    id: "real-use-be-v1-g039",
    type: "sentence",
    titleZh: "印尼最基本礼貌句",
    status: 'active',
    items: [
      { indonesian: "Terima kasih.", chinese: "谢谢。", ttsText: "Terima kasih.", conceptIds: ["terima-kasih"] },
      { indonesian: "Permisi, Pak.", chinese: "不好意思，先生。", ttsText: "Permisi, Pak.", conceptIds: ["permisi"] },
      { indonesian: "Hati-hati di jalan.", chinese: "路上小心。", ttsText: "Hati-hati di jalan.", conceptIds: ["hati-hati"] },
    ],
  },
  {
    id: "real-use-be-v1-g040",
    type: "sentence",
    titleZh: "身体状态马上说出口",
    status: 'active',
    items: [
      { indonesian: "Lapar nih.", chinese: "饿了。", ttsText: "Lapar nih.", conceptIds: ["lapar"] },
      { indonesian: "Capek banget.", chinese: "好累啊。", ttsText: "Capek banget.", conceptIds: ["capek"] },
      { indonesian: "Aku ngantuk.", chinese: "我困了。", ttsText: "Aku ngantuk.", conceptIds: ["ngantuk"] },
    ],
  },
  {
    id: "real-use-be-v1-g041",
    type: "sentence",
    titleZh: "热、不舒服、没力气",
    status: 'active',
    items: [
      { indonesian: "Gerah banget.", chinese: "好闷热。", ttsText: "Gerah banget.", conceptIds: ["gerah"] },
      { indonesian: "Badan lemas.", chinese: "身体没力气。", ttsText: "Badan lemas.", conceptIds: ["lemas"] },
      { indonesian: "Badan nggak enak.", chinese: "身体不舒服。", ttsText: "Badan nggak enak.", conceptIds: ["nggak-enak"] },
    ],
  },
  {
    id: "real-use-be-v1-g042",
    type: "sentence",
    titleZh: "不舒服时先说清症状",
    status: 'active',
    items: [
      { indonesian: "Saya pusing.", chinese: "我头晕。", ttsText: "Saya pusing.", conceptIds: ["pusing"] },
      { indonesian: "Saya batuk.", chinese: "我咳嗽。", ttsText: "Saya batuk.", conceptIds: ["batuk"] },
      { indonesian: "Ada luka di sini.", chinese: "这里有伤口。", ttsText: "Ada luka di sini.", conceptIds: ["luka"] },
    ],
  },
  {
    id: "real-use-be-v1-g043",
    type: "sentence",
    titleZh: "具体哪里痛",
    status: 'active',
    items: [
      { indonesian: "Saya sakit kepala.", chinese: "我头痛。", ttsText: "Saya sakit kepala.", conceptIds: ["sakit-kepala"] },
      { indonesian: "Saya sakit perut.", chinese: "我肚子疼。", ttsText: "Saya sakit perut.", conceptIds: ["sakit-perut"] },
      { indonesian: "Tenggorokan sakit.", chinese: "喉咙痛。", ttsText: "Tenggorokan sakit.", conceptIds: ["sakit-tenggorokan"] },
    ],
  },
  {
    id: "real-use-be-v1-g044",
    type: "sentence",
    titleZh: "基本情绪",
    status: 'active',
    items: [
      { indonesian: "Saya senang.", chinese: "我很开心。", ttsText: "Saya senang.", conceptIds: ["senang"] },
      { indonesian: "Saya khawatir.", chinese: "我有点担心。", ttsText: "Saya khawatir.", conceptIds: ["khawatir"] },
      { indonesian: "Jangan marah ya.", chinese: "别生气哦。", ttsText: "Jangan marah ya.", conceptIds: ["marah"] },
    ],
  },
  {
    id: "real-use-be-v1-g045",
    type: "sentence",
    titleZh: "复杂一点的心情",
    status: 'active',
    items: [
      { indonesian: "Saya bingung.", chinese: "我有点懵 / 不太懂。", ttsText: "Saya bingung.", conceptIds: ["bingung"] },
      { indonesian: "Tenang dulu.", chinese: "先冷静一下。", ttsText: "Tenang dulu.", conceptIds: ["tenang"] },
      { indonesian: "Jangan stres.", chinese: "别太有压力。", ttsText: "Jangan stres.", conceptIds: ["stres"] },
    ],
  },
  {
    id: "real-use-be-v1-g046",
    type: "sentence",
    titleZh: "喜欢、想念、加油",
    status: 'active',
    items: [
      { indonesian: "Semangat ya.", chinese: "加油哦。", ttsText: "Semangat ya.", conceptIds: ["semangat"] },
      { indonesian: "Saya suka ini.", chinese: "我喜欢这个。", ttsText: "Saya suka ini.", conceptIds: ["suka"] },
      { indonesian: "Kangen rumah.", chinese: "想家了。", ttsText: "Kangen rumah.", conceptIds: ["kangen"] },
    ],
  },
  {
    id: "real-use-be-v1-g047",
    type: "phrase",
    titleZh: "买菜最常见组合",
    status: 'active',
    items: [
      { indonesian: "cabai merah", chinese: "红辣椒", ttsText: "cabai merah", conceptIds: ["cabai"] },
      { indonesian: "bawang putih", chinese: "大蒜", ttsText: "bawang putih", conceptIds: ["bawang-putih"] },
      { indonesian: "dua kilo kentang", chinese: "两公斤土豆", ttsText: "dua kilo kentang", conceptIds: ["kentang"] },
    ],
  },
  {
    id: "real-use-be-v1-g048",
    type: "phrase",
    titleZh: "菜市场常见叶菜",
    status: 'active',
    items: [
      { indonesian: "daun bawang", chinese: "葱", ttsText: "daun bawang", conceptIds: ["daun-bawang"] },
      { indonesian: "Ada kangkung?", chinese: "有空心菜吗？", ttsText: "Ada kangkung?", conceptIds: ["kangkung"] },
      { indonesian: "satu ikat bayam", chinese: "一把菠菜", ttsText: "satu ikat bayam", conceptIds: ["bayam"] },
    ],
  },
  {
    id: "real-use-be-v1-g049",
    type: "phrase",
    titleZh: "继续认菜",
    status: 'active',
    items: [
      { indonesian: "timun segar", chinese: "新鲜黄瓜", ttsText: "timun segar", conceptIds: ["timun"] },
      { indonesian: "jagung manis", chinese: "甜玉米", ttsText: "jagung manis", conceptIds: ["jagung"] },
      { indonesian: "jamur segar", chinese: "新鲜蘑菇", ttsText: "jamur segar", conceptIds: ["jamur"] },
    ],
  },
  {
    id: "real-use-be-v1-g050",
    type: "phrase",
    titleZh: "常见水果",
    status: 'active',
    items: [
      { indonesian: "pisang matang", chinese: "熟香蕉", ttsText: "pisang matang", conceptIds: ["pisang"] },
      { indonesian: "jeruk manis", chinese: "甜橙子", ttsText: "jeruk manis", conceptIds: ["jeruk"] },
      { indonesian: "mangga matang", chinese: "熟芒果", ttsText: "mangga matang", conceptIds: ["mangga"] },
    ],
  },
  {
    id: "real-use-be-v1-g051",
    type: "phrase",
    titleZh: "热带水果和饮品水果",
    status: 'active',
    items: [
      { indonesian: "jus alpukat", chinese: "牛油果汁", ttsText: "jus alpukat", conceptIds: ["alpukat"] },
      { indonesian: "air kelapa", chinese: "椰子水", ttsText: "air kelapa", conceptIds: ["kelapa"] },
      { indonesian: "durian matang", chinese: "熟榴莲", ttsText: "durian matang", conceptIds: ["durian"] },
    ],
  },
  {
    id: "real-use-be-v1-g052",
    type: "phrase",
    titleZh: "少量但常见的水果名",
    status: 'active',
    items: [
      { indonesian: "jambu merah", chinese: "红番石榴", ttsText: "jambu merah", conceptIds: ["jambu"] },
      { indonesian: "salak manis", chinese: "甜蛇皮果", ttsText: "salak manis", conceptIds: ["salak"] },
      { indonesian: "Ada jambu?", chinese: "有番石榴吗？", ttsText: "Ada jambu?", conceptIds: ["jambu"] },
    ],
  },
  {
    id: "real-use-be-v1-g053",
    type: "phrase",
    titleZh: "买肉和海鲜",
    status: 'active',
    items: [
      { indonesian: "daging sapi", chinese: "牛肉", ttsText: "daging sapi", conceptIds: ["daging-sapi"] },
      { indonesian: "ikan segar", chinese: "新鲜鱼", ttsText: "ikan segar", conceptIds: ["ikan"] },
      { indonesian: "udang satu kilo", chinese: "一公斤虾", ttsText: "udang satu kilo", conceptIds: ["udang"] },
    ],
  },
  {
    id: "real-use-be-v1-g054",
    type: "phrase",
    titleZh: "海鲜和鸡蛋",
    status: 'active',
    items: [
      { indonesian: "dua telur", chinese: "两个鸡蛋", ttsText: "dua telur", conceptIds: ["telur"] },
      { indonesian: "cumi-cumi goreng", chinese: "炸鱿鱼", ttsText: "cumi-cumi goreng", conceptIds: ["cumi-cumi"] },
      { indonesian: "kepiting besar", chinese: "大螃蟹", ttsText: "kepiting besar", conceptIds: ["kepiting"] },
    ],
  },
  {
    id: "real-use-be-v1-g055",
    type: "phrase",
    titleZh: "做饭调料",
    status: 'active',
    items: [
      { indonesian: "sedikit garam", chinese: "一点盐", ttsText: "sedikit garam", conceptIds: ["garam"] },
      { indonesian: "tanpa gula", chinese: "不加糖", ttsText: "tanpa gula", conceptIds: ["gula"] },
      { indonesian: "minyak goreng", chinese: "食用油", ttsText: "minyak goreng", conceptIds: ["minyak-goreng"] },
    ],
  },
  {
    id: "real-use-be-v1-g056",
    type: "phrase",
    titleZh: "辣酱、醋和胡椒",
    status: 'active',
    items: [
      { indonesian: "sambal sedikit", chinese: "辣酱少一点", ttsText: "sambal sedikit", conceptIds: ["sambal"] },
      { indonesian: "tanpa cuka", chinese: "不放醋", ttsText: "tanpa cuka", conceptIds: ["cuka"] },
      { indonesian: "lada hitam", chinese: "黑胡椒", ttsText: "lada hitam", conceptIds: ["lada"] },
    ],
  },
  {
    id: "real-use-be-v1-g057",
    type: "phrase",
    titleZh: "主食和常见食品",
    status: 'active',
    items: [
      { indonesian: "nasi putih", chinese: "白米饭", ttsText: "nasi putih", conceptIds: ["nasi"] },
      { indonesian: "mie goreng", chinese: "炒面", ttsText: "mie goreng", conceptIds: ["mie"] },
      { indonesian: "susu dingin", chinese: "冷牛奶", ttsText: "susu dingin", conceptIds: ["susu"] },
    ],
  },
  {
    id: "real-use-be-v1-g058",
    type: "phrase",
    titleZh: "外卖和小吃里常见主食",
    status: 'active',
    items: [
      { indonesian: "nasi goreng satu", chinese: "一份炒饭", ttsText: "nasi goreng satu", conceptIds: ["nasi-goreng"] },
      { indonesian: "mie instan", chinese: "方便面", ttsText: "mie instan", conceptIds: ["mie-instan"] },
      { indonesian: "Ada gorengan?", chinese: "有炸物 / 炸小吃吗？", ttsText: "Ada gorengan?", conceptIds: ["gorengan"] },
    ],
  },
  {
    id: "real-use-be-v1-g059",
    type: "phrase",
    titleZh: "最常点的饮料",
    status: 'active',
    items: [
      { indonesian: "air putih", chinese: "白水 / 饮用水", ttsText: "air putih", conceptIds: ["air-putih"] },
      { indonesian: "air dingin", chinese: "冷水", ttsText: "air dingin", conceptIds: ["air-dingin"] },
      { indonesian: "es teh", chinese: "冰茶", ttsText: "es teh", conceptIds: ["es","teh"] },
    ],
  },
  {
    id: "real-use-be-v1-g060",
    type: "sentence",
    titleZh: "饮料少冰少糖",
    status: 'active',
    items: [
      { indonesian: "Es tehnya satu.", chinese: "一杯冰茶。", ttsText: "Es tehnya satu.", conceptIds: ["es-teh"] },
      { indonesian: "Tanpa gula ya.", chinese: "不加糖哦。", ttsText: "Tanpa gula ya.", conceptIds: ["tanpa-gula"] },
      { indonesian: "Sedikit es saja.", chinese: "少冰就行。", ttsText: "Sedikit es saja.", conceptIds: ["sedikit-es"] },
    ],
  },
  {
    id: "real-use-be-v1-g061",
    type: "sentence",
    titleZh: "味道反馈",
    status: 'active',
    items: [
      { indonesian: "Jangan terlalu pedas.", chinese: "不要太辣。", ttsText: "Jangan terlalu pedas.", conceptIds: ["pedas"] },
      { indonesian: "Agak asin.", chinese: "有点咸。", ttsText: "Agak asin.", conceptIds: ["asin"] },
      { indonesian: "Air hangat saja.", chinese: "温水就行。", ttsText: "Air hangat saja.", conceptIds: ["hangat"] },
    ],
  },
  {
    id: "real-use-be-v1-g062",
    type: "sentence",
    titleZh: "生了、熟了、糊了",
    status: 'active',
    items: [
      { indonesian: "Ini masih mentah.", chinese: "这个还没熟。", ttsText: "Ini masih mentah.", conceptIds: ["mentah"] },
      { indonesian: "Sudah matang?", chinese: "熟了吗？", ttsText: "Sudah matang?", conceptIds: ["matang"] },
      { indonesian: "Agak gosong.", chinese: "有点糊了。", ttsText: "Agak gosong.", conceptIds: ["gosong"] },
    ],
  },
  {
    id: "real-use-be-v1-g063",
    type: "sentence",
    titleZh: "做饭动作",
    status: 'active',
    items: [
      { indonesian: "Tolong goreng dulu.", chinese: "请先炸 / 煎一下。", ttsText: "Tolong goreng dulu.", conceptIds: ["goreng"] },
      { indonesian: "Kukus saja.", chinese: "蒸就行。", ttsText: "Kukus saja.", conceptIds: ["kukus"] },
      { indonesian: "Jangan campur.", chinese: "不要混在一起。", ttsText: "Jangan campur.", conceptIds: ["campur"] },
    ],
  },
  {
    id: "real-use-be-v1-g064",
    type: "sentence",
    titleZh: "分开放",
    status: 'active',
    items: [
      { indonesian: "Pisah ya.", chinese: "分开放哦。", ttsText: "Pisah ya.", conceptIds: ["pisah"] },
      { indonesian: "Sausnya pisah.", chinese: "酱料分开放。", ttsText: "Sausnya pisah.", conceptIds: ["pisah"] },
    ],
  },
  {
    id: "real-use-be-v1-g065",
    type: "phrase",
    titleZh: "头脸五官",
    status: 'active',
    items: [
      { indonesian: "sakit kepala", chinese: "头痛", ttsText: "sakit kepala", conceptIds: ["kepala"] },
      { indonesian: "sakit gigi", chinese: "牙痛", ttsText: "sakit gigi", conceptIds: ["gigi"] },
      { indonesian: "cuci muka", chinese: "洗脸", ttsText: "cuci muka", conceptIds: ["muka"] },
    ],
  },
  {
    id: "real-use-be-v1-g066",
    type: "phrase",
    titleZh: "身体中部和手",
    status: 'active',
    items: [
      { indonesian: "sakit perut", chinese: "肚子疼", ttsText: "sakit perut", conceptIds: ["perut"] },
      { indonesian: "sakit tenggorokan", chinese: "喉咙痛", ttsText: "sakit tenggorokan", conceptIds: ["tenggorokan"] },
      { indonesian: "tangan kanan", chinese: "右手", ttsText: "tangan kanan", conceptIds: ["tangan"] },
    ],
  },
  {
    id: "real-use-be-v1-g067",
    type: "sentence",
    titleZh: "哪里受伤或不舒服",
    status: 'active',
    items: [
      { indonesian: "Kaki saya sakit.", chinese: "我的脚疼。", ttsText: "Kaki saya sakit.", conceptIds: ["kaki"] },
      { indonesian: "Kulitnya gatal.", chinese: "皮肤痒。", ttsText: "Kulitnya gatal.", conceptIds: ["kulit"] },
      { indonesian: "Ada darah.", chinese: "有血。", ttsText: "Ada darah.", conceptIds: ["darah"] },
    ],
  },
  {
    id: "real-use-be-v1-g068",
    type: "phrase",
    titleZh: "常穿衣物",
    status: 'active',
    items: [
      { indonesian: "baju putih", chinese: "白衣服", ttsText: "baju putih", conceptIds: ["baju"] },
      { indonesian: "celana pendek", chinese: "短裤", ttsText: "celana pendek", conceptIds: ["celana-pendek"] },
      { indonesian: "sepatu baru", chinese: "新鞋", ttsText: "sepatu baru", conceptIds: ["sepatu"] },
    ],
  },
  {
    id: "real-use-be-v1-g069",
    type: "phrase",
    titleZh: "配件和随身物品",
    status: 'active',
    items: [
      { indonesian: "tas saya", chinese: "我的包", ttsText: "tas saya", conceptIds: ["tas"] },
      { indonesian: "kacamata hitam", chinese: "墨镜", ttsText: "kacamata hitam", conceptIds: ["kacamata"] },
      { indonesian: "jam tangan", chinese: "手表", ttsText: "jam tangan", conceptIds: ["jam-tangan"] },
    ],
  },
  {
    id: "real-use-be-v1-g070",
    type: "sentence",
    titleZh: "尺寸合不合适",
    status: 'active',
    items: [
      { indonesian: "Ini cocok.", chinese: "这个合适。", ttsText: "Ini cocok.", conceptIds: ["cocok"] },
      { indonesian: "Kebesaran.", chinese: "太大了。", ttsText: "Kebesaran.", conceptIds: ["kebesaran"] },
      { indonesian: "Agak longgar.", chinese: "有点松。", ttsText: "Agak longgar.", conceptIds: ["longgar"] },
    ],
  },
  {
    id: "real-use-be-v1-g071",
    type: "micro_scene",
    titleZh: "在家找房间和门",
    contextZh: "房间、厨房、卫生间和门窗自然形成一个真实找位置小任务。",
    status: 'active',
    items: [
      { indonesian: "Kamar mandinya di mana?", chinese: "洗手间在哪里？", ttsText: "Kamar mandinya di mana?", conceptIds: ["kamar-mandi"] },
      { indonesian: "Saya di ruang tamu.", chinese: "我在客厅。", ttsText: "Saya di ruang tamu.", conceptIds: ["ruang-tamu"] },
      { indonesian: "Tolong buka pintunya.", chinese: "请把门打开。", ttsText: "Tolong buka pintunya.", conceptIds: ["pintu"] },
    ],
  },
  {
    id: "real-use-be-v1-g072",
    type: "sentence",
    titleZh: "家里找东西和开灯",
    status: 'active',
    items: [
      { indonesian: "Kuncinya di mana?", chinese: "钥匙在哪里？", ttsText: "Kuncinya di mana?", conceptIds: ["kunci"] },
      { indonesian: "Nyalakan lampunya.", chinese: "把灯打开。", ttsText: "Nyalakan lampunya.", conceptIds: ["lampu"] },
      { indonesian: "Taruh di meja.", chinese: "放桌上。", ttsText: "Taruh di meja.", conceptIds: ["meja"] },
    ],
  },
  {
    id: "real-use-be-v1-g073",
    type: "sentence",
    titleZh: "空调和风扇",
    status: 'active',
    items: [
      { indonesian: "AC-nya terlalu dingin.", chinese: "空调太冷了。", ttsText: "AC-nya terlalu dingin.", conceptIds: ["ac"] },
      { indonesian: "Nyalakan kipas angin.", chinese: "打开风扇。", ttsText: "Nyalakan kipas angin.", conceptIds: ["kipas-angin"] },
      { indonesian: "Matikan AC dulu.", chinese: "先把空调关了。", ttsText: "Matikan AC dulu.", conceptIds: ["ac"] },
    ],
  },
  {
    id: "real-use-be-v1-g074",
    type: "phrase",
    titleZh: "餐具和厨房小件",
    status: 'active',
    items: [
      { indonesian: "dua piring", chinese: "两个盘子", ttsText: "dua piring", conceptIds: ["piring"] },
      { indonesian: "sendok dan garpu", chinese: "勺子和叉子", ttsText: "sendok dan garpu", conceptIds: ["sendok","garpu"] },
      { indonesian: "sumpit di mana?", chinese: "筷子在哪里？", ttsText: "sumpit di mana?", conceptIds: ["sumpit"] },
    ],
  },
  {
    id: "real-use-be-v1-g075",
    type: "micro_scene",
    titleZh: "做饭前找厨房工具",
    contextZh: "锅、锅铲、炉子可以自然组成做饭前准备的小任务。",
    status: 'active',
    items: [
      { indonesian: "Pancinya di mana?", chinese: "锅在哪里？", ttsText: "Pancinya di mana?", conceptIds: ["panci"] },
      { indonesian: "Ambil wajan yang besar.", chinese: "拿大一点的炒锅。", ttsText: "Ambil wajan yang besar.", conceptIds: ["wajan"] },
      { indonesian: "Pakai spatula ini.", chinese: "用这个锅铲。", ttsText: "Pakai spatula ini.", conceptIds: ["spatula"] },
    ],
  },
  {
    id: "real-use-be-v1-g076",
    type: "sentence",
    titleZh: "厨房电器和煤气",
    status: 'active',
    items: [
      { indonesian: "Gas habis.", chinese: "煤气没了。", ttsText: "Gas habis.", conceptIds: ["gas"] },
      { indonesian: "Tabung gasnya kosong.", chinese: "煤气罐空了。", ttsText: "Tabung gasnya kosong.", conceptIds: ["tabung-gas"] },
      { indonesian: "Botolnya di kulkas.", chinese: "瓶子在冰箱里。", ttsText: "Botolnya di kulkas.", conceptIds: ["botol","kulkas"] },
    ],
  },
  {
    id: "real-use-be-v1-g077",
    type: "sentence",
    titleZh: "煤气管和阀门",
    status: 'active',
    items: [
      { indonesian: "Cek regulatornya.", chinese: "检查一下减压阀。", ttsText: "Cek regulatornya.", conceptIds: ["regulator"] },
      { indonesian: "Selang gasnya bocor?", chinese: "煤气管漏了吗？", ttsText: "Selang gasnya bocor?", conceptIds: ["selang-gas"] },
      { indonesian: "Regulatornya bermasalah, jangan nyalakan kompor dulu.", chinese: "减压阀有问题，先别开火。", ttsText: "Regulatornya bermasalah, jangan nyalakan kompor dulu.", conceptIds: ["regulator"] },
    ],
  },
  {
    id: "real-use-be-v1-g078",
    type: "phrase",
    titleZh: "洗漱用品",
    status: 'active',
    items: [
      { indonesian: "sikat gigi", chinese: "牙刷", ttsText: "sikat gigi", conceptIds: ["sikat-gigi"] },
      { indonesian: "pasta gigi", chinese: "牙膏", ttsText: "pasta gigi", conceptIds: ["pasta-gigi"] },
      { indonesian: "sampo habis", chinese: "洗发水没了", ttsText: "sampo habis", conceptIds: ["sampo"] },
    ],
  },
  {
    id: "real-use-be-v1-g079",
    type: "sentence",
    titleZh: "纸巾毛巾用完了",
    status: 'active',
    items: [
      { indonesian: "Tisunya habis.", chinese: "纸巾没了。", ttsText: "Tisunya habis.", conceptIds: ["tisu"] },
      { indonesian: "Handuknya di mana?", chinese: "毛巾在哪里？", ttsText: "Handuknya di mana?", conceptIds: ["handuk"] },
      { indonesian: "Saya cari tisu toilet.", chinese: "我找厕纸。", ttsText: "Saya cari tisu toilet.", conceptIds: ["tisu-toilet"] },
    ],
  },
  {
    id: "real-use-be-v1-g080",
    type: "phrase",
    titleZh: "洗衣和清洁用品",
    status: 'active',
    items: [
      { indonesian: "deterjen cair", chinese: "洗衣液", ttsText: "deterjen cair", conceptIds: ["deterjen-cair"] },
      { indonesian: "sabun cuci piring", chinese: "洗洁精", ttsText: "sabun cuci piring", conceptIds: ["sabun-cuci-piring"] },
      { indonesian: "spons baru", chinese: "新海绵", ttsText: "spons baru", conceptIds: ["spons"] },
    ],
  },
  {
    id: "real-use-be-v1-g081",
    type: "micro_scene",
    titleZh: "打扫和洗衣的小任务",
    contextZh: "拖地、擦、垃圾、洗衣机可以自然组成家务指令。",
    status: 'active',
    items: [
      { indonesian: "Tolong pel lantainya.", chinese: "请拖一下地。", ttsText: "Tolong pel lantainya.", conceptIds: ["pel"] },
      { indonesian: "Sampahnya buang dulu.", chinese: "先把垃圾倒了。", ttsText: "Sampahnya buang dulu.", conceptIds: ["sampah"] },
      { indonesian: "Pakai mesin cuci ya.", chinese: "用洗衣机洗。", ttsText: "Pakai mesin cuci ya.", conceptIds: ["mesin-cuci"] },
    ],
  },
  {
    id: "real-use-be-v1-g082",
    type: "sentence",
    titleZh: "手机和网络",
    status: 'active',
    items: [
      { indonesian: "HP-ku lowbat.", chinese: "我手机快没电了。", ttsText: "HP-ku lowbat.", conceptIds: ["hp"] },
      { indonesian: "Charger-nya di mana?", chinese: "充电器在哪里？", ttsText: "Charger-nya di mana?", conceptIds: ["charger"] },
      { indonesian: "Wi-Fi-nya nggak bisa.", chinese: "Wi-Fi 不能用。", ttsText: "Wi-Fi-nya nggak bisa.", conceptIds: ["wi-fi"] },
    ],
  },
  {
    id: "real-use-be-v1-g083",
    type: "sentence",
    titleZh: "插座、遥控器和钱包",
    status: 'active',
    items: [
      { indonesian: "Colokannya di mana?", chinese: "插座在哪里？", ttsText: "Colokannya di mana?", conceptIds: ["colokan"] },
      { indonesian: "Remote-nya hilang.", chinese: "遥控器不见了。", ttsText: "Remote-nya hilang.", conceptIds: ["remote"] },
      { indonesian: "Lampunya mati.", chinese: "灯没亮 / 灯灭了。", ttsText: "Lampunya mati.", conceptIds: ["mati"] },
    ],
  },
  {
    id: "real-use-be-v1-g084",
    type: "sentence",
    titleZh: "用完了和没电了",
    status: 'active',
    items: [
      { indonesian: "Baterainya habis.", chinese: "电池没电了。", ttsText: "Baterainya habis.", conceptIds: ["habis"] },
      { indonesian: "HP-ku lowbat.", chinese: "我手机快没电了。", ttsText: "HP-ku lowbat.", conceptIds: ["lowbat"] },
      { indonesian: "Power bank-nya habis juga.", chinese: "充电宝也没电了。", ttsText: "Power bank-nya habis juga.", conceptIds: ["habis"] },
    ],
  },
  {
    id: "real-use-be-v1-g085",
    type: "micro_scene",
    titleZh: "让司机来接",
    contextZh: "接送、位置、目的地天然组成一个小出行任务。",
    status: 'active',
    items: [
      { indonesian: "Tolong jemput saya di lokasi ini.", chinese: "请到这个位置接我。", ttsText: "Tolong jemput saya di lokasi ini.", conceptIds: ["jemput","lokasi"] },
      { indonesian: "Tujuannya ke kantor.", chinese: "目的地是办公室。", ttsText: "Tujuannya ke kantor.", conceptIds: ["tujuan"] },
      { indonesian: "Sopirnya sudah sampai?", chinese: "司机到了吗？", ttsText: "Sopirnya sudah sampai?", conceptIds: ["sopir"] },
    ],
  },
  {
    id: "real-use-be-v1-g086",
    type: "sentence",
    titleZh: "地址、出发和到达",
    status: 'active',
    items: [
      { indonesian: "Alamatnya sudah benar?", chinese: "地址对了吗？", ttsText: "Alamatnya sudah benar?", conceptIds: ["alamat"] },
      { indonesian: "Kita berangkat sekarang.", chinese: "我们现在出发。", ttsText: "Kita berangkat sekarang.", conceptIds: ["berangkat"] },
      { indonesian: "Sudah tiba?", chinese: "已经到了吗？", ttsText: "Sudah tiba?", conceptIds: ["tiba"] },
    ],
  },
  {
    id: "real-use-be-v1-g087",
    type: "sentence",
    titleZh: "摩托和头盔",
    status: 'active',
    items: [
      { indonesian: "Saya naik motor.", chinese: "我坐摩托。", ttsText: "Saya naik motor.", conceptIds: ["naik-motor"] },
      { indonesian: "Helmnya ada?", chinese: "有头盔吗？", ttsText: "Helmnya ada?", conceptIds: ["helm"] },
      { indonesian: "Parkir motor di sini.", chinese: "摩托停这里。", ttsText: "Parkir motor di sini.", conceptIds: ["parkir-motor"] },
    ],
  },
  {
    id: "real-use-be-v1-g088",
    type: "micro_scene",
    titleZh: "路上给司机简单指令",
    contextZh: "堵车、直走、转弯、停车可以自然组成出行小任务。",
    status: 'active',
    items: [
      { indonesian: "Macet ya?", chinese: "堵车了是吗？", ttsText: "Macet ya?", conceptIds: ["macet"] },
      { indonesian: "Lurus saja dulu.", chinese: "先一直往前。", ttsText: "Lurus saja dulu.", conceptIds: ["lurus"] },
      { indonesian: "Parkir di sini aja.", chinese: "就停这里吧。", ttsText: "Parkir di sini aja.", conceptIds: ["parkir"] },
    ],
  },
  {
    id: "real-use-be-v1-g089",
    type: "sentence",
    titleZh: "入口、出口和高速卡余额",
    status: 'active',
    items: [
      { indonesian: "Pintu masuk di mana?", chinese: "入口在哪里？", ttsText: "Pintu masuk di mana?", conceptIds: ["pintu-masuk"] },
      { indonesian: "Pintu keluar sebelah kanan.", chinese: "出口在右边。", ttsText: "Pintu keluar sebelah kanan.", conceptIds: ["pintu-keluar"] },
      { indonesian: "Saldo e-toll cukup?", chinese: "e-toll 余额够吗？", ttsText: "Saldo e-toll cukup?", conceptIds: ["saldo","e-toll"] },
    ],
  },
  {
    id: "real-use-be-v1-g090",
    type: "sentence",
    titleZh: "加油站怎么说",
    status: 'active',
    items: [
      { indonesian: "Isi bensin dulu.", chinese: "先加油。", ttsText: "Isi bensin dulu.", conceptIds: ["isi-bensin"] },
      { indonesian: "Isi penuh ya.", chinese: "加满。", ttsText: "Isi penuh ya.", conceptIds: ["isi-penuh"] },
      { indonesian: "SPBU dekat sini?", chinese: "这附近有加油站吗？", ttsText: "SPBU dekat sini?", conceptIds: ["spbu"] },
    ],
  },
  {
    id: "real-use-be-v1-g091",
    type: "sentence",
    titleZh: "电动车充电",
    status: 'active',
    items: [
      { indonesian: "Baterainya tinggal 20 persen.", chinese: "只剩 20% 的电了。", ttsText: "Baterainya tinggal 20 persen.", conceptIds: ["persen"] },
      { indonesian: "Mau cas dulu.", chinese: "想先充电。", ttsText: "Mau cas dulu.", conceptIds: ["cas"] },
      { indonesian: "Ada SPKLU dekat sini?", chinese: "这附近有充电站吗？", ttsText: "Ada SPKLU dekat sini?", conceptIds: ["spklu"] },
    ],
  },
  {
    id: "real-use-be-v1-g092",
    type: "sentence",
    titleZh: "到机场和登机前",
    status: 'active',
    items: [
      { indonesian: "Saya sudah sampai bandara.", chinese: "我已经到机场了。", ttsText: "Saya sudah sampai bandara.", conceptIds: ["bandara"] },
      { indonesian: "Check-in di mana?", chinese: "在哪里办理值机？", ttsText: "Check-in di mana?", conceptIds: ["check-in"] },
      { indonesian: "Paspor saya di tas.", chinese: "我的护照在包里。", ttsText: "Paspor saya di tas.", conceptIds: ["paspor"] },
    ],
  },
  {
    id: "real-use-be-v1-g093",
    type: "sentence",
    titleZh: "登机口和延误",
    status: 'active',
    items: [
      { indonesian: "Gate-nya di mana?", chinese: "登机口在哪里？", ttsText: "Gate-nya di mana?", conceptIds: ["gate"] },
      { indonesian: "Pesawatnya terlambat.", chinese: "飞机延误了。", ttsText: "Pesawatnya terlambat.", conceptIds: ["terlambat"] },
      { indonesian: "Jangan sampai terlambat.", chinese: "别迟到 / 别误机。", ttsText: "Jangan sampai terlambat.", conceptIds: ["terlambat"] },
    ],
  },
];

const realUseById = new Map(basicRealUseUnits.map((unit) => [unit.id, unit]));
const bindingByLearningGroup = new Map(basicRealUseGroupBindings.map((binding) => [binding.learningGroupId, binding.realUseId]));

export function getRealUseForLearningGroup(categoryId: string, subcategoryId: string, group: number) {
  const realUseId = bindingByLearningGroup.get(getLearningGroupId(categoryId, subcategoryId, group));
  return realUseId ? realUseById.get(realUseId) : undefined;
}

export function getBasicLearningGroups(concepts: BasicConcept[], groupSize = 8) {
  return Array.from({ length: Math.ceil(concepts.length / groupSize) }, (_, index) => ({
    group: index + 1,
    concepts: concepts.slice(index * groupSize, index * groupSize + groupSize),
  }));
}
