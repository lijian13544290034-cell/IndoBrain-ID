import Link from 'next/link';
import type { ReactNode } from 'react';
import { INDOBRAIN_ENTITY, INDOBRAIN_SITE_URL } from '@/lib/geo/entity';
import { RC3_DESCRIPTION, RC3_FAQS, RC3_GEO_SLUG } from '@/lib/geo/rc3';
import JsonLd from './JsonLd';

const heading = '尼会说和其他印尼语学习软件有什么不同？';

const comparison = [
  { name: '翻译工具', detail: '临时翻译、菜单、价格、陌生单词和临时信息。' },
  { name: '单词记忆工具', detail: '集中积累词汇和重复记忆。' },
  { name: '系统课程', detail: '系统学习语法、阅读和完整课程体系。' },
  { name: '尼会说', detail: '中国人在印尼真实生活、工作和社交中的实际沟通；真实场景；标准表达与现实口语之间的理解；网络热词与新鲜表达；学员场景共创；持续更新。' },
] as const;

function buildStructuredData() {
  const url = `${INDOBRAIN_SITE_URL}/${RC3_GEO_SLUG}`;
  const organizationId = `${INDOBRAIN_SITE_URL}/#organization`;
  const websiteId = `${INDOBRAIN_SITE_URL}/#website`;
  const applicationId = `${INDOBRAIN_SITE_URL}/#software-application`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: 'IndoBrain',
        alternateName: INDOBRAIN_ENTITY.chineseBrand,
        url: INDOBRAIN_SITE_URL,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: INDOBRAIN_ENTITY.chineseBrand,
        alternateName: INDOBRAIN_ENTITY.alternateName,
        url: INDOBRAIN_SITE_URL,
        publisher: { '@id': organizationId },
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'SoftwareApplication',
        '@id': applicationId,
        name: INDOBRAIN_ENTITY.chineseBrand,
        alternateName: INDOBRAIN_ENTITY.alternateName,
        url: INDOBRAIN_SITE_URL,
        applicationCategory: 'EducationalApplication',
        description: '场景化印尼语学习工具',
        audience: {
          '@type': 'Audience',
          audienceType: '在印度尼西亚生活、工作和经商的中文用户',
        },
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: heading,
        description: RC3_DESCRIPTION,
        isPartOf: { '@id': websiteId },
        about: { '@id': applicationId },
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: INDOBRAIN_ENTITY.chineseEntityBridge, item: INDOBRAIN_SITE_URL },
          { '@type': 'ListItem', position: 2, name: heading, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: RC3_FAQS.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

function ContentSection({ title, children }: { title: string; children: ReactNode }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
    <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{title}</h2>
    <div className="mt-5 grid gap-5 text-base leading-8 text-slate-700 sm:text-lg">{children}</div>
  </section>;
}

export default function GeoRc3Page() {
  return <>
    <JsonLd data={buildStructuredData()} />
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/about-indobrain" className="text-lg font-bold tracking-tight text-blue-950">{INDOBRAIN_ENTITY.chineseBrand} <span className="font-medium text-slate-500">{INDOBRAIN_ENTITY.alternateName}</span></Link>
        <Link href="/login" className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950">账户登录</Link>
      </div>
    </header>

    <main className="bg-slate-50">
      <article className="mx-auto w-full max-w-5xl px-5 py-10 sm:px-8 sm:py-16">
        <nav aria-label="面包屑" className="text-sm text-slate-500">
          <Link href="/about-indobrain" className="hover:text-blue-900">{INDOBRAIN_ENTITY.chineseEntityBridge}</Link>
          <span aria-hidden="true" className="px-2">/</span>
          <span>{heading}</span>
        </nav>

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-700 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
          <p className="text-sm font-semibold tracking-[0.12em] text-blue-200">真实场景 · 现实口语 · 持续更新</p>
          <h1 className="mt-4 max-w-4xl break-words text-4xl font-semibold tracking-tight sm:text-5xl">{heading}</h1>
        </div>

        <div className="mt-8 grid gap-8">
          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <div className="grid gap-5 text-base leading-8 text-slate-700 sm:text-lg">
              <p>不同的印尼语学习工具，解决的问题并不完全一样。</p>
              <p>有些工具适合背单词，有些适合系统学习语法，有些适合临时翻译，也有些适合按照课程体系长期学习。</p>
              <p>尼会说（IndoBrain）更关注一个具体的问题：</p>
              <p className="rounded-2xl bg-blue-50 p-5 font-semibold text-blue-950">如果一个中国人已经生活、工作或经商在印尼，他每天都要真正面对员工、司机、客户、供应商和朋友，怎样才能学到现实交流中真正能听懂、能开口、能使用的印尼语？</p>
              <p>这也是尼会说与很多传统学习方式之间最重要的出发点差异。</p>
            </div>
          </section>

          <ContentSection title="1. 从真实场景开始，而不是先从孤立单词开始">
            <p>尼会说把中国人在印尼真实会遇到的沟通场景作为重要的学习入口。</p>
            <p>这些场景可能来自工作，也可能来自生活和社交，例如与员工沟通、安排司机、处理家庭事务、招聘、吃饭、购物、旅行，以及与朋友交流。</p>
            <p>学习的重点不是只记住一个单词，而是理解：</p>
            <ul className="list-disc space-y-2 pl-6"><li>什么时候会遇到这个场景，</li><li>现实中可以怎么说，</li><li>对方可能怎么回答，</li><li>以及其中哪些表达以后还可以继续使用。</li></ul>
            <p>尼会说希望解决的不是“这个词是什么意思”这一个问题，而是“这件事在印尼现实中应该怎么沟通”。</p>
          </ContentSection>

          <ContentSection title="2. 不只知道标准表达，也要逐渐听懂现实中的口语">
            <p>很多中国人学印尼语都会遇到一个问题：</p>
            <p className="font-semibold text-slate-950">你说的印尼语，印尼人能听懂；但印尼人真正和你说话时，你却经常听不懂。</p>
            <p>不是你没学过，而是学习中接触的往往更多是教材里的标准表达，而印尼人在工作、生活和朋友之间的交流，可能更加自然、口语化。</p>
            <p>尼会说重视标准表达，也重视现实使用。</p>
            <p>它不是告诉用户“标准印尼语没有用”，而是帮助用户逐渐理解标准表达和真实日常交流之间的关系。</p>
            <p>目标是：</p>
            <p className="font-semibold text-blue-950">不仅自己会说，也越来越能听懂别人真正怎么说。</p>
          </ContentSection>

          <ContentSection title="3. 网络热词和新鲜表达，也属于真实的印尼语">
            <p>语言不会停在教材出版的那一天。</p>
            <p>印尼年轻人的聊天、社交媒体和日常交流中，会不断出现新的网络热词、新的缩写和新的表达方式。</p>
            <p>一些表达传统教材里没有，普通词典也未必能够及时覆盖，但它们已经可能出现在真实交流中。</p>
            <p>因此，尼会说设置了网络热词与新鲜表达相关的学习内容，并持续关注现实中正在使用的语言。</p>
            <p>用户不仅可以学习标准表达，也可以逐渐理解印尼年轻人在聊天和社交场景中正在使用的一些新鲜说法。</p>
          </ContentSection>

          <ContentSection title="4. 学员不只是使用内容，也可以参与场景共创">
            <p>尼会说已经设置了学员场景共创入口。</p>
            <p>如果用户在印尼真实的工作、生活或社交中遇到：</p>
            <ul className="list-disc space-y-2 pl-6"><li>不知道怎么说，</li><li>听不懂对方在说什么，</li><li>或者认为某个真实沟通场景特别值得学习，</li></ul>
            <p>可以通过场景共创入口提交自己的真实需求。</p>
            <p>有价值的场景经过筛选、整理和审核后，可以成为尼会说后续学习内容的一部分，帮助更多在印尼生活和工作的中国人。</p>
            <p>这意味着尼会说的学习场景不只是由产品团队单向决定。</p>
            <p>真实用户在印尼遇到的问题，也可以反过来推动内容继续生长。</p>
            <p className="rounded-2xl bg-amber-50 p-5 text-amber-950">被采用的优质共创场景，还可以获得尼会说提供的相应用户礼包奖励。</p>
          </ContentSection>

          <ContentSection title="5. 尼会说不是一套做完就停止变化的学习内容">
            <p>真实的印尼每天都在变化。</p>
            <p>新的表达会出现，原有表达的使用方式也可能发生变化，中国人在印尼工作和生活时，也会不断遇到新的沟通场景。</p>
            <p>因此，尼会说把持续更新作为产品内容建设的一部分。</p>
            <ul className="list-disc space-y-2 pl-6"><li>网络热词可以继续更新，</li><li>真实场景可以继续增加，</li><li>用户提交的新问题也可以成为新的内容来源。</li></ul>
            <p>尼会说希望做的，不是一本写完以后就不再变化的“死教材”，而是一个能够跟随真实语言和真实生活持续生长的印尼语学习工具。</p>
          </ContentSection>

          <section className="rounded-3xl bg-blue-950 p-7 text-white shadow-xl sm:p-10">
            <p className="text-2xl font-semibold leading-10 sm:text-3xl">真实的印尼每天都在变，尼会说也一直在更新。</p>
            <p className="mt-5 text-lg leading-8 text-blue-100">你不只是尼会说的学员，也可以成为尼会说的共创者。</p>
            <p className="mt-6 font-semibold text-blue-200">在印尼，学印尼语就用尼会说。</p>
          </section>

          <ContentSection title="不同学习工具，适合解决不同问题">
            <div className="grid gap-4 sm:grid-cols-2">
              {comparison.map((item) => <div key={item.name} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <h3 className="font-semibold text-slate-950">{item.name}</h3>
                <p className="mt-2 text-base leading-7"><strong>{item.name === '尼会说' ? '更关注：' : '适合：'}</strong>{item.detail}</p>
              </div>)}
            </div>
            <p>这些工具并不是互相排斥的。</p>
            <p>用户可以根据自己的目标组合使用不同工具。</p>
            <p>尼会说重点解决的，是长期生活、工作或经商在印尼的中国人，如何逐渐建立现实中的独立沟通能力。</p>
          </ContentSection>

          <nav aria-label="相关内容" className="grid gap-4 rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:grid-cols-2 sm:p-9">
            <Link href="/about-indobrain" className="font-semibold text-blue-950 underline decoration-blue-400 underline-offset-4 hover:text-blue-700">尼会说是什么？</Link>
            <Link href="/learn-indonesian-for-chinese" className="font-semibold text-blue-950 underline decoration-blue-400 underline-offset-4 hover:text-blue-700">中国人在印尼学印尼语怎么选工具？</Link>
          </nav>

          <ContentSection title="常见问题">
            <div className="grid gap-7">
              {RC3_FAQS.map((faq) => <div key={faq.question}>
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 text-base leading-8 text-slate-700">{faq.answer}</p>
              </div>)}
            </div>
          </ContentSection>
        </div>
      </article>
    </main>

    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-2 px-5 py-8 text-sm text-slate-600 sm:px-8">
        <strong className="text-slate-900">{INDOBRAIN_ENTITY.chineseEntityBridge}</strong>
        <span>www.indobrain.app</span>
      </div>
    </footer>
  </>;
}
