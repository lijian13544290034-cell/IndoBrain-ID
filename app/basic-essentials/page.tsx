import type { Metadata } from 'next';
import BasicEssentialsExperience from '@/components/BasicEssentialsExperience';

export const metadata: Metadata = {
  title: '基础必备 | IndoBrain',
  description: 'IndoBrain Basic Essentials V1：高频基础概念、真实说法和场景入口。',
};

type SearchValue = string | string[] | undefined;

function first(value: SearchValue) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BasicEssentialsPage({ searchParams }: { searchParams?: Promise<Record<string, SearchValue>> }) {
  const params = await searchParams;
  return <BasicEssentialsExperience
    category={first(params?.category)}
    subcategory={first(params?.sub)}
    concept={first(params?.concept)}
    group={first(params?.group)}
    query={first(params?.q)}
  />;
}
