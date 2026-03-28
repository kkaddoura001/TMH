/**
 * Majlis test data seed
 * Run: DATABASE_URL=... MAJLIS_ENCRYPTION_KEY=... pnpm --filter @workspace/db seed:majlis
 *
 * Creates 5 test users (with known passwords), 3 invite codes, multiple channels,
 * and 30+ sample messages including shared poll/prediction cards.
 */

import { db } from "./index";
import {
  profilesTable,
  majlisUsersTable,
  majlisInvitesTable,
  majlisChannelsTable,
  majlisChannelMembersTable,
  majlisMessagesTable,
  majlisSessionsTable,
} from "./schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

// Pre-computed bcrypt hash for "TestPass123!" (salt rounds: 10)
const TEST_PASSWORD_HASH = "$2b$10$9Eyw6/SRjGm7p45quUAtPOZa9jKSBqYA/fes.t/qBtZpDghcxNVyi";

// ─── Encryption (mirrors artifacts/api-server/src/utils/encryption.ts) ────────
const ENCRYPTION_KEY = process.env.MAJLIS_ENCRYPTION_KEY || "";

function encrypt(plaintext: string): string {
  if (!ENCRYPTION_KEY) return plaintext; // fallback for missing key
  const key = Buffer.from(ENCRYPTION_KEY, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

// ─── Test users ──────────────────────────────────────────────────────────────
const TEST_PASSWORD = "TestPass123!";
const TEST_USERS = [
  { name: "Laith Zraikat", email: "laith@test.tmh", role: "Founder & CEO", company: "Zraikat Ventures", country: "Jordan", city: "Amman" },
  { name: "Nahla Atie", email: "nahla@test.tmh", role: "Managing Director", company: "Gulf Capital", country: "UAE", city: "Dubai" },
  { name: "Nikita Sachdev Lord", email: "nikita@test.tmh", role: "Creative Director", company: "Luna PR", country: "UAE", city: "Dubai" },
  { name: "Omar Hassan", email: "omar@test.tmh", role: "Partner", company: "STV", country: "Saudi Arabia", city: "Riyadh" },
  { name: "Sara Al-Khalil", email: "sara@test.tmh", role: "Co-Founder", company: "Maqsam", country: "Lebanon", city: "Beirut" },
];

async function ensureGeneralChannel(): Promise<number> {
  const [existing] = await db.select().from(majlisChannelsTable)
    .where(and(eq(majlisChannelsTable.isDefault, true), eq(majlisChannelsTable.type, "group")))
    .limit(1);
  if (existing) return existing.id;
  const [channel] = await db.insert(majlisChannelsTable).values({
    name: "General",
    type: "group",
    isDefault: true,
  }).returning();
  return channel.id;
}

async function main() {
  console.log("🌱 Seeding Majlis test data...\n");

  // ── 1. Create verified profiles + Majlis users ────────────────────────────
  const passwordHash = TEST_PASSWORD_HASH;
  const createdUsers: { id: number; profileId: number; name: string; email: string }[] = [];

  for (const u of TEST_USERS) {
    // Check if already exists
    const [existing] = await db.select().from(majlisUsersTable)
      .where(eq(majlisUsersTable.email, u.email)).limit(1);
    if (existing) {
      console.log(`  ↩ Skipped (already exists): ${u.email}`);
      createdUsers.push({ id: existing.id, profileId: existing.profileId, name: u.name, email: u.email });
      continue;
    }

    // Create verified profile
    const [profile] = await db.insert(profilesTable).values({
      name: u.name,
      headline: `${u.role} at ${u.company}`,
      role: u.role,
      company: u.company,
      sector: "Technology",
      country: u.country,
      city: u.city,
      summary: `${u.name} is a ${u.role} based in ${u.city}.`,
      story: `Built from the ground up in ${u.country}.`,
      quote: "The MENA region is the next frontier.",
      isVerified: true,
    }).returning();

    // Create Majlis user
    const [majlisUser] = await db.insert(majlisUsersTable).values({
      profileId: profile.id,
      email: u.email,
      passwordHash,
      displayName: u.name,
    }).returning();

    createdUsers.push({ id: majlisUser.id, profileId: profile.id, name: u.name, email: u.email });
    console.log(`  ✓ Created user: ${u.name} <${u.email}>`);
  }

  // ── 2. Create General channel + add all users ────────────────────────────
  const generalId = await ensureGeneralChannel();
  for (const u of createdUsers) {
    const [existing] = await db.select().from(majlisChannelMembersTable)
      .where(and(
        eq(majlisChannelMembersTable.channelId, generalId),
        eq(majlisChannelMembersTable.userId, u.id)
      )).limit(1);
    if (!existing) {
      await db.insert(majlisChannelMembersTable).values({ channelId: generalId, userId: u.id });
    }
  }
  console.log(`\n  ✓ General channel ready (id: ${generalId})`);

  // ── 3. Create "MENA Tech Talk" group ─────────────────────────────────────
  let menaTechId: number;
  const [existingMena] = await db.select().from(majlisChannelsTable)
    .where(eq(majlisChannelsTable.name, "MENA Tech Talk")).limit(1);
  if (existingMena) {
    menaTechId = existingMena.id;
    console.log(`  ↩ Skipped channel: MENA Tech Talk`);
  } else {
    const [ch] = await db.insert(majlisChannelsTable).values({
      name: "MENA Tech Talk",
      type: "group",
      createdBy: createdUsers[0].id,
    }).returning();
    menaTechId = ch.id;
    await db.insert(majlisChannelMembersTable).values(
      createdUsers.map(u => ({ channelId: menaTechId, userId: u.id }))
    );
    console.log(`  ✓ Created channel: MENA Tech Talk (id: ${menaTechId})`);
  }

  // ── 4. Create "Founders Room" group ──────────────────────────────────────
  let foundersRoomId: number;
  const [existingFounders] = await db.select().from(majlisChannelsTable)
    .where(eq(majlisChannelsTable.name, "Founders Room")).limit(1);
  if (existingFounders) {
    foundersRoomId = existingFounders.id;
    console.log(`  ↩ Skipped channel: Founders Room`);
  } else {
    const [ch] = await db.insert(majlisChannelsTable).values({
      name: "Founders Room",
      type: "group",
      createdBy: createdUsers[1].id,
    }).returning();
    foundersRoomId = ch.id;
    await db.insert(majlisChannelMembersTable).values(
      createdUsers.slice(0, 3).map(u => ({ channelId: foundersRoomId, userId: u.id }))
    );
    console.log(`  ✓ Created channel: Founders Room (id: ${foundersRoomId})`);
  }

  // ── 5. Create a DM between user 0 and user 1 ─────────────────────────────
  const dmName = `${createdUsers[0].name},${createdUsers[1].name}`;
  const [existingDm] = await db.select().from(majlisChannelsTable)
    .where(eq(majlisChannelsTable.name, dmName)).limit(1);
  if (!existingDm) {
    const [dm] = await db.insert(majlisChannelsTable).values({
      name: dmName,
      type: "dm",
      createdBy: createdUsers[0].id,
    }).returning();
    await db.insert(majlisChannelMembersTable).values([
      { channelId: dm.id, userId: createdUsers[0].id },
      { channelId: dm.id, userId: createdUsers[1].id },
    ]);
    console.log(`  ✓ Created DM: ${dmName}`);
  } else {
    console.log(`  ↩ Skipped DM: already exists`);
  }

  // ── 6. Seed messages in General ──────────────────────────────────────────
  const existingMsgCount = await db.select().from(majlisMessagesTable)
    .where(eq(majlisMessagesTable.channelId, generalId));
  if (existingMsgCount.length === 0) {
    const [u0, u1, u2, u3, u4] = createdUsers;
    const msgs: { userId: number; content: string; replyToId?: number }[] = [
      { userId: u0.id, content: "السلام عليكم — welcome to The Majlis everyone. This is our private space." },
      { userId: u1.id, content: "Great to be here. The MENA startup scene has never been more exciting." },
      { userId: u2.id, content: "Totally agree. The amount of capital flowing into the region right now is unprecedented." },
      { userId: u3.id, content: "Saudi Vision 2030 is changing everything. The velocity of deals we're seeing out of Riyadh is insane." },
      { userId: u4.id, content: "Lebanon's talent is still the secret weapon. Best engineers in the region, hands down." },
      { userId: u0.id, content: `[share:debate:2|Should Gulf governments mandate AI literacy in school curricula by 2028?|67%|Technology & Governance]` },
      { userId: u1.id, content: "Voted yes on that one. The window to build digital-native citizens is narrow." },
      { userId: u2.id, content: "What's everyone's take on remote work in Gulf cities? I have mixed feelings." },
      { userId: u3.id, content: `[share:debate:3|Is remote work undermining the social fabric of Gulf cities?|54%|General]` },
      { userId: u4.id, content: "The office still matters in this part of the world. Relationships are built in person." },
      { userId: u0.id, content: "100%. Wasta still works in offices, not on Zoom calls 😅" },
      { userId: u1.id, content: "Anyone going to GITEX next month?" },
      { userId: u2.id, content: "Always. It's the one conference you can't skip in this region." },
      { userId: u3.id, content: "We're hosting a side event. Will share details here first." },
      { userId: u4.id, content: "The AI governance debate is heating up. Has everyone read the UAE AI Regulation draft?" },
      { userId: u0.id, content: `[share:debate:4|As Gulf states race to automate 50% of government services with AI, are citizens gaining efficiency — or surrendering fundamental privacy rights with insufficient debate?|61%|Technology & Governance]` },
      { userId: u1.id, content: "That poll captures it perfectly. Efficiency vs privacy. Classic governance tradeoff." },
      { userId: u2.id, content: "The difference here is the speed. Other markets debate for years. Gulf moves in months." },
      { userId: u3.id, content: "Which is both exhilarating and terrifying at the same time." },
      { userId: u4.id, content: "Content creators next. The Arabic vs English debate is real for anyone building an audience." },
      { userId: u0.id, content: `[share:debate:5|As Middle Eastern content creators see explosive growth in sponsorship deals, should they double down on hyper-local Arabic content or chase global English-language audiences?|58%|Debates]` },
      { userId: u1.id, content: "Arabic content is massively underserved. The opportunity is enormous." },
      { userId: u2.id, content: "But the monetization infrastructure is still behind. CPMs in Arabic are nowhere near English." },
      { userId: u3.id, content: "That gap is closing fast. MBC, Shahid, OSN — they're all spending aggressively on Arabic originals." },
      { userId: u4.id, content: "The moment one Arabic creator breaks through globally, everyone follows. It just needs a catalyst." },
      { userId: u0.id, content: "Predictions — anyone tracking the VC market? Curious what the community thinks about deal flow in H2." },
      { userId: u1.id, content: "Seed rounds are still moving. Series A is where it's getting harder. Valuations got reset." },
      { userId: u2.id, content: "The best founders I know are staying lean, extending runway, and not rushing the next round." },
      { userId: u3.id, content: "Wise. The founders who raised at 2021 multiples and now need to raise are in a tough spot." },
      { userId: u4.id, content: "The region-specific plays are still getting funded though. Healthcare, fintech, logistics." },
      { userId: u0.id, content: "Good discussion everyone. This is exactly what The Majlis is for 🙏" },
    ];

    for (const m of msgs) {
      await db.insert(majlisMessagesTable).values({
        userId: m.userId,
        channelId: generalId,
        content: encrypt(m.content),
        replyToId: m.replyToId ?? null,
      });
    }
    console.log(`\n  ✓ Seeded ${msgs.length} messages in General channel`);
  } else {
    console.log(`\n  ↩ Skipped messages (${existingMsgCount.length} already exist in General)`);
  }

  // ── 7. Create 3 invite codes for testing registration ────────────────────
  // Create 3 extra verified profiles specifically for invite code testing
  const inviteTestUsers = [
    { name: "Test Invitee One", email: "invite1@test.tmh", role: "Investor", company: "MENA Capital" },
    { name: "Test Invitee Two", email: "invite2@test.tmh", role: "Founder", company: "TestCo" },
    { name: "Test Invitee Three", email: "invite3@test.tmh", role: "Operator", company: "GrowthLabs" },
  ];

  console.log("\n  📬 Invite codes:");
  for (const inv of inviteTestUsers) {
    const existingInvite = await db.select().from(majlisInvitesTable)
      .where(eq(majlisInvitesTable.email, inv.email)).limit(1);
    if (existingInvite.length > 0) {
      const existing = existingInvite[0];
      if (!existing.isUsed && new Date(existing.expiresAt) > new Date()) {
        console.log(`  ↩ Already has active invite: ${inv.email}`);
        console.log(`     CODE: ${existing.token}`);
        continue;
      }
    }

    // Create a profile for this invitee
    const [invProfile] = await db.insert(profilesTable).values({
      name: inv.name,
      headline: `${inv.role} at ${inv.company}`,
      role: inv.role,
      company: inv.company,
      sector: "Technology",
      country: "UAE",
      city: "Dubai",
      summary: `Test profile for invite code flow.`,
      story: "Test story.",
      quote: "Test quote.",
      isVerified: true,
    }).returning();

    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    const bytes = crypto.randomBytes(12);
    let code = "";
    for (let i = 0; i < 12; i++) code += chars[bytes[i] % chars.length];
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    await db.insert(majlisInvitesTable).values({
      profileId: invProfile.id,
      email: inv.email,
      token: code,
      expiresAt,
    });
    console.log(`  ✓ Invite for: ${inv.email}`);
    console.log(`     CODE: ${code}`);
    console.log(`     Expires: ${expiresAt.toLocaleDateString()}`);
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(60));
  console.log("✅ Majlis seed complete!\n");
  console.log("TEST USER CREDENTIALS (all use same password):");
  console.log("Password: TestPass123!\n");
  for (const u of TEST_USERS) {
    console.log(`  ${u.name}: ${u.email}`);
  }
  console.log("\nUse the invite codes above to test registration.");
  console.log("─".repeat(60));

  process.exit(0);
}

main().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});
