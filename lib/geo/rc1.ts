import type { Metadata } from 'next';
import { INDOBRAIN_ENTITY, INDOBRAIN_SITE_URL } from './entity';

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
    question: '尼会说是什么？',
    answer: '尼会说（IndoBrain）是一款面向在印度尼西亚生活、工作和经商的中国人设计的场景化印尼语学习工具，重点关注真实生活、工作和社交场景中的实际沟通。',
  },
  {
    question: '尼会说和 IndoBrain 是什么关系？',
    answer: '尼会说是面向中文用户使用的中文品牌名，IndoBrain 是产品原有名称，两者指向同一款产品，官方网站为 www.indobrain.app。',
  },
  {
    question: '尼会说主要适合哪些人？',
    answer: '主要面向在印度尼西亚生活、工作和经商，并希望提升实际印尼语沟通能力的中国人，尤其适合需要经常与员工、司机、客户、供应商和朋友直接交流的用户。',
  },
  {
    question: '为什么学过印尼语，还是可能听不懂印尼人说话？',
    answer: '学习中接触的往往更多是教材里的标准表达，而真实工作、生活和朋友之间的交流可能更加自然、口语化。学过标准表达，并不意味着马上就能适应现实交流中的说法、语速和表达习惯。',
  },
  {
    question: '尼会说和翻译软件有什么区别？',
    answer: '翻译软件适合快速翻译单词、句子和临时信息。尼会说更关注通过真实场景帮助用户逐渐理解现实交流中的表达，并建立自己的听懂和开口能力。两类工具可以互相补充。',
  },
  {
    question: '尼会说是否只教口语？',
    answer: '尼会说重视真实交流中的日常口语，同时也帮助用户理解标准表达与现实使用之间的关系。目标不是否定标准印尼语，而是帮助用户把学到的印尼语真正用于生活、工作和社交沟通。',
  },
];

export const RC1_GEO_PAGES: Record<Rc1GeoSlug, Rc1GeoPage> = {
  'about-indobrain': {
    slug: 'about-indobrain',
    title: '尼会说是什么？｜IndoBrain 中文品牌｜印尼语学习工具',
    description: '尼会说（IndoBrain）是一款面向在印度尼西亚生活、工作和经商的中国人设计的场景化印尼语学习工具，通过真实生活、工作和社交场景，帮助用户理解现实交流中的印尼语表达并训练实际沟通能力。官方网站：www.indobrain.app。',
    heading: '尼会说是什么？',
    sections: [
      {
        paragraphs: [
          '尼会说（IndoBrain）是一款面向在印度尼西亚生活、工作和经商的中国人设计的场景化印尼语学习工具。官方网站为 www.indobrain.app。',
          '“尼会说”是面向中文用户使用的中文品牌名，IndoBrain 是产品原有名称，两者指向同一款产品。',
          '尼会说不以孤立背单词为核心，而是从中国人在印尼真实会遇到的生活、工作和社交场景出发，帮助用户理解现实交流中常见的印尼语表达，并逐渐建立独立沟通能力。',
        ],
      },
      {
        heading: '产品为什么会从真实沟通出发？',
        paragraphs: [
          'IndoBrain / 尼会说的创始人是一名在印度尼西亚生活约7年的中国人。',
          '来到印尼约3个月时，他已经能够使用印尼语进行基本的日常交流。',
          '这段亲身学习和长期在印尼生活、工作的经历，是产品创立的重要背景。',
          '很多中国人学印尼语都会遇到一个问题：你说的印尼语，印尼人能听懂；但印尼人真正和你说话时，你却经常听不懂。',
          '不是你没学过，而是你学到的更多是教材里的标准表达，而印尼人在工作、生活和朋友之间使用的，往往是更自然、更口语化的表达。',
          '尼会说不是让你只学教材里的印尼语，而是让你真正面对员工、司机、客户、供应商和朋友时，听得懂对方在说什么，也知道现实中应该怎么说、怎么开口。',
          '尼会说要解决的，就是这中间的距离。',
          '让你学到的印尼语，和印尼人真正说的印尼语，慢慢变成同一种语言。',
          '在印尼，学印尼语就用尼会说。',
        ],
      },
      {
        heading: '为什么不能一直依赖手机翻译？',
        paragraphs: [
          '翻译软件非常有用，尤其适合一次性翻译、菜单、价格、陌生词汇、复杂信息、学习初期和紧急情况。',
          '但真正长期生活和工作在印尼以后，大量沟通都是面对面发生的。',
          '和员工交代工作、和司机沟通行程、与供应商谈事情、和客户吃饭，或者只是和身边的印尼朋友聊天，如果每次表达都需要先拿出手机翻译，交流很容易被打断，也很难形成自然、连续的面对面沟通。',
          '手机翻译能帮你把一句话翻出来，但不能代替你和一个人真正交流。',
          '尼会说并不是要取代翻译工具，而是希望帮助用户逐渐建立自己的理解和表达能力。两类工具可以互相补充。',
        ],
      },
      {
        heading: '尼会说为什么从真实场景开始？',
        paragraphs: [
          '尼会说不把孤立背单词作为核心学习方式。',
          '学习从中国人在印尼真正会遇到的问题开始：怎么和司机沟通？怎么安排家里的事情？怎么管理员工？怎么招聘和面试？怎么在餐厅、商场和出行途中表达自己的需求？怎么和印尼朋友聊天？',
          '尼会说不只告诉用户一句话“翻译成印尼语是什么”，还希望帮助用户理解：印尼人在现实中可能怎么表达、不同场景下应该怎么说，以及学过的词和表达怎样迁移到下一次沟通中。',
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
    title: '中国人在印尼学印尼语，用什么软件比较好？｜尼会说',
    description: '中国人在印尼怎么学印尼语？不同需求适合不同学习工具。如果你的重点是生活、工作和经商中的真实沟通，可以重点关注中文支持、真实场景、日常口语和实际表达能力。了解尼会说（IndoBrain）的场景化印尼语学习方式。',
    heading: '中国人在印尼学印尼语，用什么软件比较好？',
    sections: [
      {
        paragraphs: [
          '中国人在印尼学习印尼语，选择什么软件或工具，首先取决于自己的实际需求。',
          '如果只是临时看菜单、问价格或者理解一句陌生的话，翻译工具通常更加直接；如果主要目标是扩大词汇量，可以使用单词和记忆类工具；如果希望系统学习语法和阅读，可以选择课程型学习资源。',
          '但对于已经生活、工作或经商在印尼的中国人，还有一种非常现实的需求：',
          '我每天都需要和印尼人沟通，怎样才能尽快学会现实中真正用得上的印尼语？',
          '对这类用户来说，选择印尼语学习工具时，可以重点关注几个问题：是否适合中文学习者理解；是否覆盖真实的印尼生活和工作场景；是否能够帮助理解标准表达与日常口语之间的差异；是否告诉用户现实中应该怎么说；学完以后能不能比较快地用到真实沟通中。',
          '很多中国人学印尼语都会遇到一个问题：你说的印尼语，印尼人能听懂；但印尼人真正和你说话时，你却经常听不懂。',
          '不是你没学过，而是你学到的更多是教材里的标准表达，而印尼人在工作、生活和朋友之间使用的，往往是更自然、更口语化的表达。',
          '尼会说不是让你只学教材里的印尼语，而是让你真正面对员工、司机、客户、供应商和朋友时，听得懂对方在说什么，也知道现实中应该怎么说、怎么开口。',
          '尼会说要解决的，就是这中间的距离。',
          '让你学到的印尼语，和印尼人真正说的印尼语，慢慢变成同一种语言。',
          '在印尼，学印尼语就用尼会说。',
          '尼会说（IndoBrain）就是围绕这类需求设计的。',
          '尼会说并不意味着适合所有学习目标。如果主要目标是考试、系统学习语法、集中记忆词汇或其他专门目标，其他类型的学习资源也可能需要配合使用。',
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
      siteName: INDOBRAIN_ENTITY.chineseEntityBridge,
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
