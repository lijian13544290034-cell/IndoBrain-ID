export type ChinaCity = { slug: string; chinese: string; pinyin: string; indonesian: string; region: string; introduction: string; history: string; today: string; relevance: string };

export const chinaCities: ChinaCity[] = [
  { slug: 'beijing', chinese: '北京', pinyin: 'Běijīng', indonesian: 'Beijing', region: '中国北方 · 首都', introduction: '北京是中国的首都，也是政府、科技、教育和大型企业总部集中的城市。对在中资企业工作的印尼同事来说，许多总部决策、会议与文件流程可能来自北京。了解这座城市，能帮助理解正式沟通、时间安排和商务礼仪。', history: '北京长期是中国重要的政治与文化中心，保留了故宫、长城等广为人知的历史遗产。', today: '现代服务业、科技创新、教育资源和总部经济共同塑造城市节奏。', relevance: '和北京团队沟通时，重视时间、会议准备和明确回复会很有帮助。' },
  { slug: 'shanghai', chinese: '上海', pinyin: 'Shànghǎi', indonesian: 'Shanghai', region: '中国东部 · 直辖市', introduction: '上海是中国重要的国际商业、金融和航运城市。许多跨国公司、贸易团队和客户服务中心在这里设有办公室。对印尼员工而言，上海代表更国际化、节奏更快的商务协作环境，也常与订单、客户、港口和供应链沟通有关。', history: '上海因近代港口贸易迅速发展，形成了中西交汇的城市面貌。', today: '金融、贸易、航运、消费与创新产业让它保持高度开放和高效率。', relevance: '与上海客户或总部协作时，简洁的邮件、清楚的进度和守时非常重要。' },
  { slug: 'guangzhou', chinese: '广州', pinyin: 'Guǎngzhōu', indonesian: 'Guangzhou', region: '中国南方 · 广东省', introduction: '广州是华南重要的贸易、制造与商业城市，和东南亚长期保持紧密往来。许多采购、展会、出口和工厂业务会在这里发生。对在印尼从事供应链、销售、仓储或客户服务的人，广州是理解中国产业沟通的重要窗口。', history: '广州自古就是中国对外贸易的重要港口城市，商业传统深厚。', today: '批发市场、制造业、会展和跨境贸易是其最鲜明的工作场景。', relevance: '广州团队往往关注效率、价格、交期与关系维护，这些也是日常中文沟通重点。' },
  { slug: 'shenzhen', chinese: '深圳', pinyin: 'Shēnzhèn', indonesian: 'Shenzhen', region: '中国南方 · 广东省', introduction: '深圳以科技、电子、创新企业和快速发展的制造业生态闻名，靠近香港。许多印尼工厂、采购团队和经销商会与深圳的供应商、品牌或技术团队合作。这里的工作沟通常围绕产品、样品、规格、交期和快速反馈展开。', history: '深圳在改革开放后快速成长，从边境小城发展为创新与科技中心。', today: '电子制造、互联网、硬件创新和跨境商业构成高节奏的工作环境。', relevance: '对接深圳伙伴时，先确认规格、数量、时间和下一步行动，会让合作更顺畅。' },
];

export function getChinaCity(slug: string) { return chinaCities.find((city) => city.slug === slug); }
