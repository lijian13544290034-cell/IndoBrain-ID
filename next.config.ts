import type { NextConfig } from 'next';

const projectRoot = process.cwd();

const nextConfig: NextConfig = {
  outputFileTracingRoot: projectRoot,
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
    staticGenerationMinPagesPerWorker: 200,
  },
  turbopack: {
    root: projectRoot,
  },
};

export default nextConfig;
