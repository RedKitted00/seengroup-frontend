# Seen Group - We Supply Your Growth

A modern Next.js application for Seen Group, providing comprehensive solutions to supply your business growth with innovative products and services.

**Live Website**: [https://www.seengrp.com/](https://www.seengrp.com/)

## 🚀 Features

- **Modern UI/UX**: Built with Next.js 15.5.0 and React 19.1.0
- **Responsive Design**: Mobile-first approach with custom CSS
- **Admin Panel**: Secure authentication system with dashboard
- **Performance Optimized**: GSAP animations, Swiper carousels, and optimized loading
- **SEO Ready**: Complete metadata and Open Graph support

## 🛠️ Tech Stack

- **Framework**: Next.js 15.5.0 (App Router)
- **Language**: TypeScript & JavaScript
- **Styling**: Custom CSS with CSS Variables
- **Icons**: Lucide React & Font Awesome 6.4.0
- **Animations**: GSAP 3.13.0
- **Carousels**: Swiper 11.2.10
- **Deployment**: Vercel

## 📁 Project Structure

```
src/
├── app/
│   ├── admin/                 # Admin panel
│   │   ├── dashboard/         # Admin dashboard
│   │   ├── page.tsx          # Admin sign-in
│   │   └── admin.css         # Admin styles
│   ├── api/                  # API routes
│   │   └── admin/            # Admin API endpoints
│   ├── components/           # React components
│   │   ├── homepage.jsx      # Main homepage
│   │   ├── header-hopepage.tsx # Header component
│   │   └── ui/               # UI components
│   ├── globals.css           # Global styles
│   └── layout.tsx            # Root layout
├── middleware.ts             # Route protection
└── public/                   # Static assets
    └── imgs/                 # Images including favicon.ico
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd seen-group-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔐 Admin Access

- **URL**: `/admin`
- **Email**: `admin@mail.com`
- **Password**: `admin123`

## 🎨 Customization

### Branding
- Update metadata in `src/app/layout.tsx`
- Modify admin credentials in `src/app/api/admin/auth/route.ts`
- Update favicon in `public/imgs/favicon.ico`

### Styling
- Main styles: `src/app/globals.css`
- Admin styles: `src/app/admin/admin.css`
- Component-specific styles in respective directories

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 480px
- Tablet: 480px - 640px
- Desktop: > 640px

## 🔒 Security Features

- HTTP-only cookies for authentication
- Route protection with middleware
- Input validation and sanitization
- Secure password handling (production ready)

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your repository to Vercel
2. Configure environment variables if needed
3. Deploy automatically on push

### Manual Deployment
```bash
npm run build
npm start
```

## 📄 License

© 2024 Seen Group. All rights reserved.

## 🤝 Support

For support and inquiries, contact Seen Group at [contact@seengroup.com](mailto:contact@seengroup.com)

---

**Seen Group - We Supply Your Growth** 🌱
