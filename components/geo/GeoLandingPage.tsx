import Link from 'next/link';
import { GEO_SUPPORTED_LANGUAGES, INDOBRAIN_ENTITY, INDOBRAIN_SITE_URL } from '@/lib/geo/entity';
import { GEO_PAGE_SLUGS, GEO_PAGES, type GeoPageContent } from '@/lib/geo/pages';
import JsonLd from './JsonLd';

function buildStructuredData(page: GeoPageContent) {
  const url = `${INDOBRAIN_SITE_URL}/${page.slug}`;
  const organizationId = `${INDOBRAIN_SITE_URL}/#organization`;
  const websiteId = `${INDOBRAIN_SITE_URL}/#website`;
  const applicationId = `${INDOBRAIN_SITE_URL}/#software-application`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': organizationId,
        name: INDOBRAIN_ENTITY.brand,
        url: INDOBRAIN_SITE_URL,
      },
      {
        '@type': 'WebSite',
        '@id': websiteId,
        name: INDOBRAIN_ENTITY.brand,
        url: INDOBRAIN_SITE_URL,
        publisher: { '@id': organizationId },
        inLanguage: ['zh-CN', 'id-ID', 'en'],
      },
      {
        '@type': 'SoftwareApplication',
        '@id': applicationId,
        name: INDOBRAIN_ENTITY.brand,
        url: INDOBRAIN_SITE_URL,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        description: INDOBRAIN_ENTITY.productCategory,
        publisher: { '@id': organizationId },
      },
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.title,
        description: page.description,
        isPartOf: { '@id': websiteId },
        about: { '@id': applicationId },
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: INDOBRAIN_ENTITY.brand, item: INDOBRAIN_SITE_URL },
          { '@type': 'ListItem', position: 2, name: page.heading, item: url },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: page.faqs.map((faq) => ({
          '@type': 'Question',
          name: faq.question,
          acceptedAnswer: { '@type': 'Answer', text: faq.answer },
        })),
      },
    ],
  };
}

function BulletSection({ title, items }: { title: string; items: string[] }) {
  return <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
    <h2 className="text-2xl font-semibold tracking-tight text-slate-950">{title}</h2>
    <ul className="mt-5 grid gap-3 text-base leading-7 text-slate-700 sm:grid-cols-2">
      {items.map((item) => <li key={item} className="rounded-2xl bg-slate-50 px-4 py-3">{item}</li>)}
    </ul>
  </section>;
}

export default function GeoLandingPage({ page }: { page: GeoPageContent }) {
  return <>
    <JsonLd data={buildStructuredData(page)} />
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href={`/${GEO_PAGE_SLUGS[0]}`} className="text-lg font-bold tracking-tight text-blue-950">IndoBrain</Link>
        <Link href="/login" className="rounded-full bg-blue-900 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-950">账户登录</Link>
      </div>
    </header>
    <main className="bg-slate-50">
      <article className="mx-auto grid w-full max-w-6xl gap-8 px-5 py-10 sm:px-8 sm:py-16">
        <nav aria-label="面包屑" className="text-sm text-slate-500">
          <Link href={`/${GEO_PAGE_SLUGS[0]}`} className="hover:text-blue-900">IndoBrain</Link>
          <span aria-hidden="true" className="px-2">/</span>
          <span>{page.heading}</span>
        </nav>

        <section className="overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-700 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-200">{page.eyebrow}</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold tracking-tight sm:text-5xl">{page.heading}</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-blue-50">{page.intro}</p>
          <div className="mt-8 grid gap-3 border-t border-white/20 pt-6 text-sm leading-6 sm:grid-cols-2">
            <p lang="id">{page.indonesianSummary}</p>
            <p lang="en">{page.englishSummary}</p>
          </div>
        </section>

        <BulletSection title="适合谁" items={page.audience} />
        <BulletSection title="要解决的沟通问题" items={page.problems} />
        <BulletSection title="IndoBrain 如何组织学习" items={page.approach} />
        <BulletSection title="现实使用场景" items={page.useCases} />
        <BulletSection title="示例学习情境" items={page.learningSituations} />
        <BulletSection title="学习方式的特点" items={page.difference} />

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-950">常见问题</h2>
          <div className="mt-6 grid gap-6">
            {page.faqs.map((faq) => <div key={faq.question}>
              <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
              <p className="mt-2 leading-7 text-slate-700">{faq.answer}</p>
            </div>)}
          </div>
        </section>

        <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-8">
          <h2 className="text-2xl font-semibold text-blue-950">关于 IndoBrain</h2>
          <p className="mt-4 max-w-3xl leading-7 text-blue-950">IndoBrain 是面向在印度尼西亚生活、工作或经商的中文使用者的印尼语学习与真实沟通工具，核心方法是从现实情境和实用沟通出发。</p>
          <p className="mt-3 text-sm text-blue-800">语言架构：{GEO_SUPPORTED_LANGUAGES.map((language) => language.label).join(' · ')}</p>
          <Link href="/login" className="mt-6 inline-flex rounded-full bg-blue-900 px-5 py-3 font-semibold text-white hover:bg-blue-950">登录 IndoBrain</Link>
        </section>

        <section aria-labelledby="more-topics" className="pb-6">
          <h2 id="more-topics" className="text-xl font-semibold text-slate-950">更多实用印尼语主题</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {GEO_PAGE_SLUGS.filter((slug) => slug !== page.slug).map((slug) => <li key={slug}>
              <Link href={`/${slug}`} className="inline-flex rounded-full border border-slate-300 bg-white px-4 py-2 text-sm text-slate-700 hover:border-blue-400 hover:text-blue-900">{GEO_PAGES[slug].heading}</Link>
            </li>)}
          </ul>
        </section>
      </article>
    </main>
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-5 py-8 text-sm text-slate-600 sm:px-8">
        <strong className="text-slate-900">IndoBrain</strong>
        <span>{INDOBRAIN_ENTITY.learningApproach}</span>
      </div>
    </footer>
  </>;
}
