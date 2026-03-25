import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password for demo users
  const passwordHash = await bcrypt.hash('password123', 12);

  // Create demo users
  const user1 = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      username: 'admin',
      name: 'Admin User',
      passwordHash,
      bio: 'Community admin and founder',
    },
  });

  const user2 = await prisma.user.upsert({
    where: { email: 'moderator@example.com' },
    update: {},
    create: {
      email: 'moderator@example.com',
      username: 'moderator',
      name: 'John Moderator',
      passwordHash,
      bio: 'Community moderator',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'member@example.com' },
    update: {},
    create: {
      email: 'member@example.com',
      username: 'member',
      name: 'Community Member',
      passwordHash,
      bio: 'Just a regular member',
    },
  });

  console.log('✓ Created demo users');

  // Create sample communities
  const community1 = await prisma.community.upsert({
    where: { slug: 'tech-enthusiasts' },
    update: {},
    create: {
      name: 'Tech Enthusiasts',
      slug: 'tech-enthusiasts',
      description: 'A community for tech lovers to discuss the latest gadgets, programming, and innovations.',
      rules: 'Be respectful\nNo spam\nStay on topic\nNoNSFW content',
      ownerId: user1.id,
      isPrivate: false,
    },
  });

  const community2 = await prisma.community.upsert({
    where: { slug: 'book-lovers' },
    update: {},
    create: {
      name: 'Book Lovers',
      slug: 'book-lovers',
      description: 'Share your favorite books, reviews, and reading recommendations.',
      rules: 'No spoilers without warning\nBe civil in discussions\nCredit authors when quoting',
      ownerId: user1.id,
      isPrivate: false,
      icon: '📚',
    },
  });

  const community3 = await prisma.community.upsert({
    where: { slug: 'gaming' },
    update: {},
    create: {
      name: 'Gaming Central',
      slug: 'gaming',
      description: 'All things gaming - from indie gems to AAA blockbusters.',
      rules: 'No platform wars\nRespect differing opinions\nFollow game-specific rules in threads',
      ownerId: user2.id,
      isPrivate: false,
      requiresApproval: false,
    },
  });

  console.log('✓ Created sample communities');

  // Add members to communities
  await prisma.communityMember.upsert({
    where: {
      userId_communityId: {
        userId: user1.id,
        communityId: community1.id,
      },
    },
    update: {},
    create: {
      userId: user1.id,
      communityId: community1.id,
      role: 'OWNER',
    },
  });

  await prisma.communityMember.upsert({
    where: {
      userId_communityId: {
        userId: user2.id,
        communityId: community1.id,
      },
    },
    update: {},
    create: {
      userId: user2.id,
      communityId: community1.id,
      role: 'MODERATOR',
    },
  });

  await prisma.communityMember.upsert({
    where: {
      userId_communityId: {
        userId: user3.id,
        communityId: community1.id,
      },
    },
    update: {},
    create: {
      userId: user3.id,
      communityId: community1.id,
      role: 'MEMBER',
    },
  });

  console.log('✓ Added members');

  // Create sample posts
  const post1 = await prisma.post.create({
    data: {
      title: 'Welcome to Tech Enthusiasts!',
      content: 'This is the first post in our community. Feel free to introduce yourself!',
      type: 'TEXT',
      authorId: user1.id,
      communityId: community1.id,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      title: 'Best programming language to learn in 2025?',
      content: 'What do you guys think? Python, JavaScript, Rust, or something else?',
      type: 'TEXT',
      authorId: user3.id,
      communityId: community1.id,
    },
  });

  console.log('✓ Created sample posts');

  // Create notification for demo
  await prisma.notification.create({
    data: {
      userId: user2.id,
      type: 'SYSTEM',
      data: {
        message: 'Welcome to SafeNiche!',
        icon: '👋',
      },
    },
  });

  console.log('✓ Created sample notifications');

  console.log('✅ Seeding completed!');
  console.log('\nDemo accounts:');
  console.log('  Email: admin@example.com / Password: password123');
  console.log('  Email: moderator@example.com / Password: password123');
  console.log('  Email: member@example.com / Password: password123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
