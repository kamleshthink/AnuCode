// API Configuration
export const API_VERSION = 'v1';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// AI Configuration
export const AI_MODES = ['agent', 'ask', 'edit', 'composer'] as const;
export const DEFAULT_AI_MODE = 'ask';

// Rate Limits
export const RATE_LIMITS = {
  FREE: {
    AI_REQUESTS_PER_MONTH: 1000,
    DEPLOYMENTS: 1,
  },
  PRO: {
    AI_REQUESTS_PER_MONTH: 10000,
    DEPLOYMENTS: 5,
  },
  TEAM: {
    AI_REQUESTS_PER_MONTH: -1, // Unlimited
    DEPLOYMENTS: 20,
  },
};

// Supported Frameworks
export const SUPPORTED_FRAMEWORKS = [
  'react',
  'next',
  'vue',
  'angular',
  'svelte',
  'node',
  'python',
  'go',
  'rust',
] as const;

// File Extensions
export const CODE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.cpp',
  '.c',
  '.html',
  '.css',
  '.json',
  '.md',
];
