import "dotenv/config";
import { OpportunityStatus, Role } from '../lib/generated/prisma/client';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';

const indianUsernames = [
  "Rahul Sharma", "Priya Patel", "Amit Kumar", "Neha Gupta",
  "Rajesh Singh", "Anjali Desai", "Suresh Reddy", "Kavita Verma",
  "Vikram Malhotra", "Pooja Joshi", "Arjun Nair", "Sneha Iyer"
];

const categories = ["Technology", "Marketing", "Design", "Finance", "Operations", "Legal", "HR"];
const tags = ["React", "Node.js", "SEO", "Copywriting", "Figma", "Excel", "Data Analysis", "Python", "UI/UX", "Brand Identity"];

const generateBudget = () => {
  const budgets = ["$500", "$1,000", "$2,500", "$5,000", "$10,000", "$15,000"];
  return budgets[Math.floor(Math.random() * budgets.length)];
};

const generateTimeline = () => {
  const timelines = ["1 week", "2 weeks", "1 month", "3 months", "Ongoing"];
  return timelines[Math.floor(Math.random() * timelines.length)];
};

async function main() {
  console.log("Seeding marketing opportunities...");
  
  // 1. Create or get Indian users
  const users = [];
  for (const name of indianUsernames) {
    const email = `${name.toLowerCase().replace(" ", ".")}@example.com`;
    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          email,
          passwordHash: await bcrypt.hash("password123", 10),
          role: Role.USER,
          bio: `Experienced professional specializing in various fields. Ready to take on new challenges.`,
          skills: [tags[Math.floor(Math.random() * tags.length)], tags[Math.floor(Math.random() * tags.length)]]
        }
      });
    }
    users.push(user);
  }

  // 2. Create 50 completed opportunities
  let count = 0;
  for (let i = 1; i <= 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    
    // Choose some tags
    const numTags = Math.floor(Math.random() * 3) + 1; // 1 to 3 tags
    const shuffledTags = [...tags].sort(() => 0.5 - Math.random());
    const selectedTags = shuffledTags.slice(0, numTags);
    selectedTags.push("Completed by " + randomUser.name); // explicitly tag them as requested

    await prisma.opportunity.create({
      data: {
        title: `${randomCategory} Project ${i} - Successfully Delivered`,
        description: `This was a comprehensive project focusing on ${randomCategory.toLowerCase()}. The scope included full end-to-end delivery. The client was highly satisfied with the results.`,
        category: randomCategory,
        budget: generateBudget(),
        timeline: generateTimeline(),
        status: OpportunityStatus.COMPLETED,
        tags: selectedTags,
        posterId: randomUser.id,
      }
    });
    count++;
  }

  console.log(`Successfully seeded ${count} completed marketing opportunities.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
