This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database Setup

This project uses PostgreSQL with Drizzle ORM for database management.

### Prerequisites

1. PostgreSQL database (local or hosted)
2. Database connection URL

### Setup Steps

1. **Environment Variables**
   ```bash
   cp .env.example .env.local
   ```
   Update `DATABASE_URL` in `.env.local` with your PostgreSQL connection string:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/database_name"
   ```

2. **Database Schema**
   Push the database schema to your PostgreSQL database:
   ```bash
   npm run db:push
   ```

3. **Seed Data (Optional)**
   Add sample data to your database:
   ```bash
   npm run db:seed
   ```

4. **Database Studio**
   Open Drizzle Studio to view and manage your database:
   ```bash
   npm run db:studio
   ```

### Available Database Commands

- `npm run db:generate` - Generate migration files
- `npm run db:migrate` - Run migrations
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed database with sample data

### Testing Database Connection

Visit [http://localhost:3000/database](http://localhost:3000/database) to test your database connection and view sample data.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
