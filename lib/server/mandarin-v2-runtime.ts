import 'server-only';

import { buildMandarinV2Runtime } from '@/lib/mandarin-v2-runtime';
import { getMandarinLevel2Access } from '@/lib/server/mandarin-work-level2-access';
import { mandarinV2ReviewedPackages } from '@/lib/server/mandarin-v2-reviewed-packages';

export async function getMandarinV2Runtime() {
  const access = await getMandarinLevel2Access();
  return buildMandarinV2Runtime(mandarinV2ReviewedPackages, access.state === 'authorized');
}
