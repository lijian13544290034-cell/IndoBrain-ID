import Link from 'next/link';
import { INDOBRAIN_ENTITY, INDOBRAIN_SITE_URL } from '@/lib/geo/entity';
import type { Rc1GeoPage } from '@/lib/geo/rc1';
import JsonLd from './JsonLd';

function buildStructuredData(page: Rc1GeoPage) {
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
        name: 'IndoBrain',
        alternateName: INDOBRAIN_ENTITY.chineseBrand,
        url: INDOBRAIN_SITE_URL,
        description: '尼会说（IndoBrain）是一款面向在印度尼西亚生活、工作和经商的中国人设计的场景化印尼语学习工具。',
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
        name: page.title,
        description: page.description,
        isPartOf: { '@id': websiteId },
        about: { '@id': applicationId },
        inLanguage: 'zh-CN',
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: INDOBRAIN_ENTITY.chineseEntityBridge, item: INDOBRAIN_SITE_URL },
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

export default function GeoRc1Page({ page }: { page: Rc1GeoPage }) {
  const isCategoryPage = page.slug === 'learn-indonesian-for-chinese';

  return <>
    <JsonLd data={buildStructuredData(page)} />
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
          <span>{page.heading}</span>
        </nav>

        <div className="mt-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-700 px-6 py-10 text-white shadow-xl sm:px-10 sm:py-14">
          <p className="text-sm font-semibold tracking-[0.12em] text-blue-200">{INDOBRAIN_ENTITY.chineseEntityBridge}</p>
          <h1 className="mt-4 max-w-4xl break-words text-4xl font-semibold tracking-tight sm:text-5xl">{page.heading}</h1>
        </div>

        <div className="mt-8 grid gap-8">
          {page.sections.map((section, sectionIndex) => <section key={section.heading || `intro-${sectionIndex}`} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            {section.heading && <h2 className="text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">{section.heading}</h2>}
            <div className={section.heading ? 'mt-5 grid gap-5' : 'grid gap-5'}>
              {section.paragraphs.map((paragraph) => <p key={paragraph} className="break-words text-base leading-8 text-slate-700 sm:text-lg">{paragraph}</p>)}
            </div>
          </section>)}

          {isCategoryPage && <section className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-9">
            <p className="leading-8 text-blue-950">想了解尼会说为什么采用这种学习方式，以及产品的创立背景，可以继续阅读《<Link href="/about-indobrain" className="font-semibold underline decoration-blue-400 underline-offset-4 hover:text-blue-700">尼会说是什么？</Link>》。</p>
          </section>}

          {page.reciprocalLink && <nav aria-label="相关内容" className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-9">
            <Link href={page.reciprocalLink.href} className="font-semibold text-blue-950 underline decoration-blue-400 underline-offset-4 hover:text-blue-700">{page.reciprocalLink.label}</Link>
          </nav>}

          <nav aria-label="产品差异" className="rounded-3xl border border-blue-200 bg-blue-50 p-6 sm:p-9">
            <Link href="/why-nihuishuo" className="font-semibold text-blue-950 underline decoration-blue-400 underline-offset-4 hover:text-blue-700">尼会说和其他印尼语学习工具有什么不同？</Link>
          </nav>

          <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-950">常见问题</h2>
            <div className="mt-6 grid gap-7">
              {page.faqs.map((faq) => <div key={faq.question}>
                <h3 className="text-lg font-semibold text-slate-900">{faq.question}</h3>
                <p className="mt-2 break-words leading-8 text-slate-700">{faq.answer}</p>
              </div>)}
            </div>
          </section>
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
