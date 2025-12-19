import { z } from 'zod';

// User Schemas
export const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1),
  role: z.enum(['user', 'pro', 'team', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  password: z.string().min(8),
});

// Project Schemas
export const projectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  ownerId: z.string().uuid(),
  framework: z.string(),
  visibility: z.enum(['public', 'private']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const createProjectSchema = z.object({
  name: z.string().min(1).max(100),
  framework: z.string(),
  visibility: z.enum(['public', 'private']).default('private'),
});

// AI Schemas
export const aiMessageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.date(),
});

export const createAIMessageSchema = z.object({
  content: z.string().min(1),
  mode: z.enum(['agent', 'ask', 'edit', 'composer']),
});

// Deployment Schemas
export const deploymentSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  provider: z.enum(['vercel', 'netlify', 'aws', 'gcp', 'custom']),
  status: z.enum(['pending', 'building', 'deploying', 'success', 'failed']),
  url: z.string().url().nullable(),
  error: z.string().nullable(),
  createdAt: z.date(),
});

export const createDeploymentSchema = z.object({
  projectId: z.string().uuid(),
  provider: z.enum(['vercel', 'netlify', 'aws', 'gcp', 'custom']),
});
