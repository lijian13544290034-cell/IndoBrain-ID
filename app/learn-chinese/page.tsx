import ChineseLearningExperience from '@/components/ChineseLearningExperience';

type SearchValue = string | string[] | undefined;

export default async function LearnChinesePage({ searchParams }: { searchParams?: Promise<Record<string, SearchValue>> }) {
  const params = await searchParams;
  const groupParam = params?.group;
  const group = Array.isArray(groupParam) ? groupParam[0] : groupParam;
  return <ChineseLearningExperience groupId={group} />;
}
