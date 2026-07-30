import type { ReactNode } from 'react';

type City = {
  chinese: string;
  indonesian: string;
  english: string;
  location: string;
  introduction: string;
  history: string;
  today: string;
  relevance: string;
};

const cities: City[] = [
  { chinese: '雅加达', indonesian: 'Jakarta', english: 'Jakarta', location: '爪哇岛 · 雅加达首都特区', introduction: '雅加达是印尼的行政、金融与商业中心，也是多数中国人初到印尼最先接触的城市。这里节奏快、交通繁忙，国际公司、政府机构、购物中心和服务业高度集中。生活与工作中常需安排见面、处理文件、沟通交通和商务行程。', history: '它长期是群岛贸易网络的重要港口，殖民时期曾名为巴达维亚。', today: '适合了解商务礼仪、城市交通和跨行业人际网络。', relevance: '在这里生活或工作，能最快接触印尼办公室文化、客户沟通与全国性商业资源。' },
  { chinese: '泗水', indonesian: 'Surabaya', english: 'Surabaya', location: '爪哇岛 · 东爪哇省', introduction: '泗水是东爪哇的重要商业和工业城市，与港口、制造业、贸易和物流联系紧密。城市生活比雅加达更直接务实，周边工厂和供应链资源丰富。对在印尼从事生产、采购、仓储或运输的人来说，这里非常有代表性。', history: '泗水以独立运动中的英雄城市形象广为人知。', today: '工业园区、港口运输和东部地区的商业连接是城市的鲜明特点。', relevance: '了解泗水有助于理解工厂沟通、货运安排和东爪哇客户的工作节奏。' },
  { chinese: '万隆', indonesian: 'Bandung', english: 'Bandung', location: '爪哇岛 · 西爪哇省', introduction: '万隆气候相对凉爽，以创意产业、教育资源、服装与纺织业闻名。周末常有人从雅加达前来休闲、购物或吃饭。对中国学习者而言，万隆能同时看到印尼年轻人的日常社交、校园氛围和传统制造业之间的连接。', history: '荷兰时期这里因气候宜人而发展为重要城市，并保留了不少历史建筑。', today: '咖啡馆、创意品牌、大学与纺织服装产业共同塑造了城市气质。', relevance: '这里有助于理解年轻同事的口语、周末活动与轻工业沟通场景。' },
  { chinese: '棉兰', indonesian: 'Medan', english: 'Medan', location: '苏门答腊岛 · 北苏门答腊省', introduction: '棉兰是苏门答腊北部的重要城市，商业氛围浓厚，族群与饮食文化多元。它连接种植园产区、区域贸易和港口网络，日常交流往往更爽快直接。对在苏门答腊做采购、销售或物流的人，认识棉兰十分实用。', history: '城市发展与苏门答腊东部的种植园经济和多元移民社群密切相关。', today: '区域贸易、食品文化和多民族社区是最容易感受到的特色。', relevance: '可以帮助你适应区域商业沟通，并理解印尼不同城市的语言与性格差异。' },
  { chinese: '三宝垄', indonesian: 'Semarang', english: 'Semarang', location: '爪哇岛 · 中爪哇省', introduction: '三宝垄是中爪哇重要的港口和贸易城市，也保留了鲜明的华人历史印记。它位于连接爪哇多地的交通线上，城市节奏相对平稳。对从事物流、分销、食品、家具或区域业务的人，三宝垄是理解中爪哇市场的好入口。', history: '郑和相关传说和老城建筑，是当地最具记忆点的文化线索之一。', today: '港口、区域物流与多元文化街区共同构成城市日常。', relevance: '能帮助中国居民理解华人文化联系，以及中爪哇的商业与生活环境。' },
  { chinese: '巴淡岛', indonesian: 'Batam', english: 'Batam', location: '廖内群岛省 · 巴淡岛', introduction: '巴淡靠近新加坡，是制造、电子、船舶维修和跨境物流的重要节点。许多企业在这里设厂或安排区域供应链，日常工作常涉及港口、仓储、外籍员工和出入境行程。城市规模紧凑，但国际商务联系很强。', history: '巴淡在近几十年随着工业园区和跨境合作迅速发展。', today: '工业园、港口、渡轮与面向新加坡的商业往来十分突出。', relevance: '在这里工作可直接接触出口制造、跨境物流和国际团队协作。' },
  { chinese: '巴厘岛', indonesian: 'Bali', english: 'Bali', location: '巴厘岛 · 巴厘省', introduction: '巴厘岛以旅游、酒店、餐饮和独特的印度教文化闻名，也是许多中国人休闲、接待客户或参与国际活动的地方。除旅游外，当地生活对礼貌、节庆和社区习惯更敏感，沟通时需要尊重时间、场合与文化边界。', history: '岛上长期形成了独特的巴厘印度教文化和艺术传统。', today: '旅游服务、创意产业和国际社群让它具有鲜明的开放性。', relevance: '了解巴厘能帮助你在接待、旅行、客户关系和文化互动中更自然得体。' },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <p className="mt-3 text-sm leading-6 text-stone-600"><span className="font-medium text-stone-800">{label}</span>{children}</p>;
}

export default function IndonesiaCitiesReference() {
  return <section className="mt-7" aria-label="Mengenal Indonesia cities">
    <p className="mb-4 text-sm leading-6 text-stone-500">从常见的生活、工作、商业与文化场景开始认识印尼。城市图片将在后续内容中补充；当前使用稳定占位，不影响阅读。</p>
    <div className="grid gap-4 sm:grid-cols-2">{cities.map((city) => <article key={city.indonesian} className="flex min-h-72 flex-col rounded-xl border border-stone-200 bg-white px-5 py-5 shadow-sm transition duration-200 hover:bg-stone-50 hover:shadow-md">
      <div className="flex h-24 items-center justify-center rounded-lg bg-stone-100 text-xs font-medium text-stone-400" role="img" aria-label={`${city.indonesian} city image placeholder`}>Gambar kota · 城市图片</div>
      <p className="mt-4 text-xs text-stone-400">{city.location}</p>
      <h2 className="mt-1 text-lg font-semibold text-stone-900">{city.indonesian} <span className="text-sm font-normal text-stone-500">（{city.chinese}）</span></h2>
      <p className="mt-1 text-xs text-stone-500">{city.english}</p>
      <p className="mt-3 text-sm leading-6 text-stone-700">{city.introduction}</p>
      <Field label="历史背景：">{city.history}</Field>
      <Field label="当前特点：">{city.today}</Field>
      <Field label="为什么值得了解：">{city.relevance}</Field>
    </article>)}</div>
  </section>;
}
