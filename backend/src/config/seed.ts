import { User } from '../models/User';
import { Link } from '../models/Link';
import { env } from './env';

/** Seed the admin user and sample links on first startup */
export async function seedDatabase(): Promise<void> {
  const existingAdmin = await User.findOne({ email: env.ADMIN_EMAIL });
  if (!existingAdmin) {
    await User.create({ email: env.ADMIN_EMAIL, password: env.ADMIN_PASSWORD });
    console.log(`Admin user seeded: ${env.ADMIN_EMAIL}`);
  }

  const linkCount = await Link.countDocuments();
  if (linkCount === 0) {
    await Link.insertMany([
      {
        title: 'GitHub',
        url: 'https://github.com',
        description: 'Where the world builds software',
        icon: '🐙',
        category: 'Development',
        sortOrder: 0,
      },
      {
        title: 'Stack Overflow',
        url: 'https://stackoverflow.com',
        description: 'Where developers learn, share, and build careers',
        icon: '📚',
        category: 'Development',
        sortOrder: 1,
      },
      {
        title: 'MDN Web Docs',
        url: 'https://developer.mozilla.org',
        description: 'Resources for developers, by developers',
        icon: '📖',
        category: 'Documentation',
        sortOrder: 0,
      },
      {
        title: 'TypeScript Docs',
        url: 'https://www.typescriptlang.org/docs/',
        description: 'Official TypeScript documentation and handbook',
        icon: '🔷',
        category: 'Documentation',
        sortOrder: 1,
      },
      {
        title: 'Vercel',
        url: 'https://vercel.com',
        description: 'Develop, preview, and ship',
        icon: '▲',
        category: 'Deployment',
        sortOrder: 0,
      },
      {
        title: 'Docker Hub',
        url: 'https://hub.docker.com',
        description: 'Build, share, and run container images',
        icon: '🐳',
        category: 'Deployment',
        sortOrder: 1,
      },
    ]);
    console.log('Sample links seeded');
  }
}
