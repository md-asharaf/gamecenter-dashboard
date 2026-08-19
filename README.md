# GameCenter Admin Dashboard

A modern, high-performance master admin dashboard built for GameCenter. It provides tools for managing projects, questions, users, and platform health, featuring a dynamic UI and seamless data synchronization.

## 🚀 Features
- **Project & Question Management**: Full CRUD capabilities and bulk question import via AWS S3.
- **Admin & User Management**: Granular control over platform users and role-based access.
- **Real-time Analytics**: Interactive charts powered by Recharts showing system health, project growth, and question distribution.
- **Robust Authentication**: JWT-based auth with Axios interceptors for automatic token refreshing.
- **Optimized Data Fetching**: Utilizes React Query for aggressive caching, deduplication, and instantaneous UI updates.

## 🛠 Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **UI & Styling**: [Tailwind CSS v4](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Framer Motion](https://www.framer.com/motion/)
- **Data Fetching & State**: [TanStack React Query v5](https://tanstack.com/query/latest), [Zustand](https://zustand-demo.pmnd.rs/)
- **Forms & Validation**: [React Hook Form](https://react-hook-form.com/), [Zod](https://zod.dev/)
- **API Communication**: [Axios](https://axios-http.com/)

## 📦 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone git@github.com:md-asharaf/gamecenter-dashboard.git
   cd gamecenter-dashboard
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and configure the necessary variables (e.g., your backend API URL).

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   The dashboard will be available at [http://localhost:3000](http://localhost:3000).

## 🔨 Build for Production
To create an optimized production build:
```bash
npm run build
npm start
```
