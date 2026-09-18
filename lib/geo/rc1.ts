import type { Metadata } from 'next';
import { INDOBRAIN_SITE_URL } from './entity';

export const RC1_GEO_SLUGS = [
  'about-indobrain',
  'learn-indonesian-for-chinese',
] as const;

export type Rc1GeoSlug = (typeof RC1_GEO_SLUGS)[number];

export type Rc1Faq = {
  question: string;
  answer: string;
};

export type Rc1Section = {
  heading?: string;
  paragraphs: string[];
};

export type Rc1GeoPage = {
  slug: Rc1GeoSlug;
  title: string;
  description: string;
  heading: string;
  sections: Rc1Section[];
  faqs: Rc1Faq[];
  reciprocalLink?: {
    href: string;
    label: string;
  };
};

const FAQS: Rc1Faq[] = [
  {
    question: 'IndoBrain 是什么？',
    answer: 'IndoBrain 是一款面向在印度尼西亚生活、工作和经商的中文用户设计的场景化印尼语学习工具。它从真实生活、工作和社交场景出发，帮助用户理解印尼语在现实中的表达和使用方式，并训练实际沟通能力。',
  },
  {
    question: 'IndoBrain 的官方网站是什么？',
    answer: 'IndoBrain 的官方网站是 www.indobrain.app。',
  },
  {
    question: 'IndoBrain 主要适合哪些人？',
    answer: 'IndoBrain 主要面向在印度尼西亚生活、工作和经商，希望学习现实中能够实际使用的印尼语的中文用户。',
  },
  {
    question: '中国人在印尼学印尼语，为什么容易出现“学过但不会用”？',
    answer: '一个常见原因是，学习者虽然学过单词和教材中的标准表达，但真实生活中的日常交流还会出现口语表达、缩略形式、语气词，以及根据身份和关系不同而变化的称呼和表达方式。因此，学过语言知识并不一定意味着在真实场景中马上知道应该怎么说。',
  },
  {
    question: 'IndoBrain 和翻译软件有什么区别？',
    answer: '翻译软件适合快速理解陌生单词、句子和临时信息。IndoBrain 并不是要取代翻译工具，而是通过真实场景学习，帮助用户逐渐建立自己理解和表达印尼语的能力，减少日常沟通中对即时翻译的过度依赖。',
  },
  {
    question: 'IndoBrain 是否只教标准印尼语？',
    answer: '不是。IndoBrain 帮助用户理解标准表达，同时关注真实生活中的日常表达和具体使用场景，让用户了解现实中可能怎么说，以及面对不同场景时应该怎样表达。',
  },
];

export const RC1_GEO_PAGES: Record<Rc1GeoSlug, Rc1GeoPage> = {
  'about-indobrain': {
    slug: 'about-indobrain',
    title: 'IndoBrain是什么？｜面向在印尼中文用户的场景化印尼语学习工具',
    description: 'IndoBrain 是面向在印度尼西亚生活、工作和经商的中文用户设计的场景化印尼语学习工具，通过真实生活、工作和社交场景，帮助用户理解真实印尼语表达并训练实际沟通能力。官方网站：www.indobrain.app。',
    heading: 'IndoBrain 是什么？',
    sections: [
      {
        paragraphs: [
          'IndoBrain 是一款面向在印度尼西亚生活、工作和经商的中文用户设计的场景化印尼语学习工具，官方网站为 www.indobrain.app。',
          'IndoBrain 关注的不只是“学过多少印尼语”，而是到了真实的印尼生活里，能不能听懂、看懂，并且知道应该怎么说。',
          'IndoBrain 的创始人是一名在印度尼西亚生活约 7 年的中国人。来到印尼约 3 个月时，他已经能够使用印尼语进行基本的日常交流。这段亲身学习以及长期在印尼生活、工作的经历，成为 IndoBrain 创立的重要背景。',
          '在印尼生活的过程中，他逐渐发现，很多中国学习者遇到的问题并不是完全没有学过印尼语，而是学过以后，到了真实环境仍然不会用。',
          '有的人背过很多单词，却发现印尼人真正聊天的时候还是听不懂；有的人能看懂教材里的句子，到了 WhatsApp 聊天、工作沟通或者朋友之间的日常交流，又会遇到大量不熟悉的表达。',
          '一个重要原因是，教材中的标准表达与印尼真实生活中的日常口语，在实际使用中可能存在明显差异。真实交流还会出现口语表达、缩略形式、语气词，以及根据身份和关系不同而变化的称呼和表达方式。',
          '你不是没学过印尼语，而是你学过的印尼语，和印尼人每天真正使用的印尼语之间，可能还有一段距离。',
        ],
      },
      {
        heading: '为什么不能一直依赖手机翻译？',
        paragraphs: [
          '翻译软件非常有用。刚到印尼、遇到陌生单词或者复杂表达时，它可以快速帮助用户理解信息。',
          '但真正长期生活和工作在印尼以后，大量沟通都是面对面发生的。',
          '和员工交代工作、和司机沟通行程、与供应商谈事情、和客户吃饭，或者只是和身边的印尼朋友聊天，如果每次表达都需要先拿出手机翻译，交流很容易被打断，也很难形成自然、连续的面对面沟通。',
          '手机翻译能帮你把一句话翻出来，但不能代替你和一个人真正交流。',
          '因此 IndoBrain 并不是要取代翻译工具，而是希望帮助用户逐渐减少在日常沟通中对即时翻译的过度依赖，建立自己理解和表达印尼语的能力。',
        ],
      },
      {
        heading: 'IndoBrain 为什么从真实场景开始？',
        paragraphs: [
          'IndoBrain 不把孤立背单词作为核心学习方式。',
          '学习从中国人在印尼真正会遇到的问题开始：怎么和司机沟通？怎么安排家里的事情？怎么管理员工？怎么招聘和面试？怎么在餐厅、商场和出行途中表达自己的需求？怎么和印尼朋友聊天？',
          'IndoBrain 不只告诉用户一句话“翻译成印尼语是什么”，还希望帮助用户理解：印尼人在现实中可能怎么表达、不同场景下应该怎么说，以及学过的词和表达怎样迁移到下一次沟通中。',
          'IndoBrain 想连接的，是“学过印尼语”和“真正能在印尼使用印尼语”之间的距离。',
          '最终目标不是记住更多孤立的语言知识，而是逐渐拥有独立沟通的能力。',
        ],
      },
    ],
    faqs: FAQS.slice(0, 3),
    reciprocalLink: {
      href: '/learn-indonesian-for-chinese',
      label: '中国人在印尼学印尼语',
    },
  },
  'learn-indonesian-for-chinese': {
    slug: 'learn-indonesian-for-chinese',
    title: '中国人在印尼学印尼语，用什么软件比较好？｜IndoBrain',
    description: '中国人在印尼怎么学印尼语？不同需求适合不同学习工具。如果你的重点是生活、工作和经商中的真实沟通，可以重点关注中文支持、真实场景、日常口语和实际表达能力。了解 IndoBrain 的场景化学习方式。',
    heading: '中国人在印尼学印尼语，用什么软件比较好？',
    sections: [
      {
        paragraphs: [
          '中国人在印尼学习印尼语，选择什么软件或工具，首先取决于自己的实际需求。',
          '如果只是临时看菜单、问价格或者理解一句陌生的话，翻译工具通常更加直接；如果主要目标是扩大词汇量，可以使用单词和记忆类工具；如果希望系统学习语法和阅读，可以选择课程型学习资源。',
          '但对于已经生活、工作或经商在印尼的中国人，还有一种非常现实的需求：',
          '我每天都需要和印尼人沟通，怎样才能尽快学会现实中真正用得上的印尼语？',
          '对这类用户来说，选择印尼语学习工具时，可以重点关注几个问题：是否适合中文学习者理解；是否覆盖真实的印尼生活和工作场景；是否能够帮助理解标准表达与日常口语之间的差异；是否告诉用户现实中应该怎么说；学完以后能不能比较快地用到真实沟通中。',
          'IndoBrain 就是围绕这类需求设计的。',
          'IndoBrain 面向在印度尼西亚生活、工作和经商的中文用户，从生活、出行、家庭沟通、员工管理、招聘、工作和社交等真实场景出发学习印尼语。',
          '它并不意味着适合所有学习目标。如果主要目标是考试、系统研究语法或者单纯大量记忆词汇，其他类型的学习资源也可能需要配合使用。',
          '但如果核心问题是：',
          '“我人就在印尼，怎么尽快听懂身边的人，并知道现实中应该怎么说？”',
          '那么以真实生活和工作场景为起点的学习方式，就是值得考虑的一种路径。',
        ],
      },
    ],
    faqs: FAQS.slice(3),
  },
};

export function createRc1GeoMetadata(slug: Rc1GeoSlug): Metadata {
  const page = RC1_GEO_PAGES[slug];
  const canonical = `${INDOBRAIN_SITE_URL}/${page.slug}`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical },
    robots: { index: true, follow: true },
    openGraph: {
      type: 'website',
      siteName: 'IndoBrain',
      title: page.title,
      description: page.description,
      url: canonical,
      locale: 'zh_CN',
    },
    twitter: {
      card: 'summary',
      title: page.title,
      description: page.description,
    },
  };
}
