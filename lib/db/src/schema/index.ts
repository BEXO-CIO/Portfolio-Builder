import { pgTable, uuid, text, boolean, integer, timestamp, date } from "drizzle-orm/pg-core";

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").notNull().unique(),
  handle: text("handle").unique(),
  fullName: text("full_name").notNull().default(""),
  headline: text("headline").notNull().default(""),
  bio: text("bio").notNull().default(""),
  avatarUrl: text("avatar_url"),
  location: text("location"),
  website: text("website"),
  linkedinUrl: text("linkedin_url"),
  githubUrl: text("github_url"),
  resumeUrl: text("resume_url"),
  email: text("email"),
  phone: text("phone"),
  isPublished: boolean("is_published").notNull().default(false),
  portfolioTheme: text("portfolio_theme").notNull().default("default"),
  portfolioFont: text("portfolio_font").notNull().default("modern"),
  identityCardPalette: text("identity_card_palette").notNull().default("midnight"),
  identityCardTemplate: text("identity_card_template").notNull().default("standard"),
  identityCardFont: text("identity_card_font"),
  dob: date("dob"),
  websitePreference: text("website_preference"),
  phoneVerified: boolean("phone_verified").notNull().default(false),
  emailVerified: boolean("email_verified").notNull().default(false),
  consentAcceptedAt: timestamp("consent_accepted_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const education = pgTable("education", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  institution: text("institution").notNull(),
  degree: text("degree").notNull(),
  field: text("field").notNull(),
  startYear: integer("start_year").notNull(),
  endYear: integer("end_year"),
  gpa: text("gpa"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const experiences = pgTable("experiences", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  company: text("company").notNull(),
  role: text("role").notNull(),
  startDate: text("start_date").notNull(), // ISO yyyy-mm-01
  endDate: text("end_date"),
  description: text("description").notNull().default(""),
  isCurrent: boolean("is_current").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const projects = pgTable("projects", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  techStack: text("tech_stack").array().notNull().default([]),
  liveUrl: text("live_url"),
  githubUrl: text("github_url"),
  imageUrl: text("image_url"),
  imageUrls: text("image_urls").array().notNull().default([]),
  pdfUrls: text("pdf_urls").array().notNull().default([]),
  linkUrls: text("link_urls").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const research = pgTable("research", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  publication: text("publication"),
  description: text("description").notNull().default(""),
  url: text("url"),
  year: integer("year"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const skills = pgTable("skills", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  category: text("category").notNull().default(""),
  level: text("level").notNull().default("intermediate"), // beginner, intermediate, advanced, expert
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const updates = pgTable("updates", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  type: text("type").notNull(), // project, achievement, role, education
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  companyName: text("company_name"),
  jobTitle: text("job_title"),
  startDate: text("start_date"),
  endDate: text("end_date"),
  isCurrent: boolean("is_current"),
  institutionName: text("institution_name"),
  specialization: text("specialization"),
  percentage: text("percentage"),
  imageUrl: text("image_url"),
  pdfUrl: text("pdf_url"),
  linkUrl: text("link_url"),
  imageUrls: text("image_urls").array().notNull().default([]),
  pdfUrls: text("pdf_urls").array().notNull().default([]),
  linkUrls: text("link_urls").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteBuilds = pgTable("site_builds", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  status: text("status").notNull().default("queued"), // queued, building, done, failed
  portfolioUrl: text("portfolio_url"),
  buildLog: text("build_log"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const siteAnalytics = pgTable("site_analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  profileId: uuid("profile_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  eventType: text("event_type").notNull(), // view, click, share
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});