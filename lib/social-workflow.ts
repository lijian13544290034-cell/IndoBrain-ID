export const socialWorkflow = [
  { slug: 'kenalan', indonesian: 'Kenalan', chinese: '初次认识', ids: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
  { slug: 'obrolan-santai', indonesian: 'Obrolan Santai', chinese: '日常聊天', ids: [11, 12, 13, 14, 15, 16, 17, 18, 19, 20] },
  { slug: 'ngopi-makan', indonesian: 'Ngopi & Makan', chinese: '喝咖啡与吃饭', ids: [21, 22, 23, 24, 25, 26, 27, 28, 29, 30] },
] as const;

export type SocialWorkflowSlug = (typeof socialWorkflow)[number]['slug'];

export function isSocialWorkflow(value: string | undefined): value is SocialWorkflowSlug {
  return socialWorkflow.some((workflow) => workflow.slug === value);
}

export function getSocialWorkflow(id: string) {
  const number = Number(id.slice(-3));
  return socialWorkflow.find((workflow) => (workflow.ids as readonly number[]).includes(number));
}
