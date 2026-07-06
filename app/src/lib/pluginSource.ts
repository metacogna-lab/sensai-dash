import { readdir, readFile } from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';

export interface PluginEntry {
  name: string;
  type: 'skill' | 'agent';
  description: string;
  invocation: string;
  phase?: string;
}

async function extractDescription(content: string): Promise<string> {
  const { data, content: body } = matter(content);

  if (data.description && typeof data.description === 'string') {
    return data.description;
  }

  const paragraphs = body
    .split('\n')
    .filter(line => line.trim().length > 0 && !line.startsWith('#'))
    .join(' ');

  return paragraphs.slice(0, 160) || 'No description available';
}

export async function getPlugins(): Promise<{
  skills: PluginEntry[];
  agents: PluginEntry[];
}> {
  const baseDir = path.resolve(process.cwd(), '..', '.claude');

  const skills: PluginEntry[] = [];
  const agents: PluginEntry[] = [];

  try {
    // Read skills
    const skillsDir = path.join(baseDir, 'skills');
    const skillDirs = await readdir(skillsDir, { withFileTypes: true });

    for (const dir of skillDirs) {
      if (!dir.isDirectory()) continue;

      const skillMdPath = path.join(skillsDir, dir.name, 'SKILL.md');
      try {
        const content = await readFile(skillMdPath, 'utf-8');
        const description = await extractDescription(content);

        skills.push({
          name: dir.name,
          type: 'skill',
          description,
          invocation: `/${dir.name}`,
          phase: undefined,
        });
      } catch {
        // Skip skills without SKILL.md
      }
    }

    // Read agents
    const agentsDir = path.join(baseDir, 'agents');
    const agentFiles = await readdir(agentsDir, { withFileTypes: true });

    for (const file of agentFiles) {
      if (!file.isFile() || !file.name.endsWith('.md')) continue;

      const agentPath = path.join(agentsDir, file.name);
      try {
        const content = await readFile(agentPath, 'utf-8');
        const { data } = matter(content);
        const description = await extractDescription(content);
        const agentName = file.name.replace(/\.md$/, '');

        agents.push({
          name: agentName,
          type: 'agent',
          description,
          invocation: 'auto-invoked',
          phase: data.phase as string | undefined,
        });
      } catch {
        // Skip agents with read errors
      }
    }

    return { skills, agents };
  } catch (error) {
    console.warn('Failed to read plugins directory:', error);
    return { skills: [], agents: [] };
  }
}
