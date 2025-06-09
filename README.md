# Courtside

<div align="center">

![Courtside Logo](/public/logo-light.webp)

**A modern sports facility booking platform for educational institutions**

[![Personal Project](https://img.shields.io/badge/Personal-Project-purple.svg)](https://github.com/SubhajitDolai)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-darkgreen)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)](https://tailwindcss.com/)

[Demo](https://courtside-xi.vercel.app) • [Report Bug](https://github.com/SubhajitDolai/Courtside/issues) • [Request Feature](https://github.com/SubhajitDolai/Courtside/issues)

</div>

## 📋 Overview

Courtside is a comprehensive full-stack web application designed to streamline the booking of sports facilities such as badminton courts, swimming pools, and other sports venues. Built specifically for educational institutions and communities with shared sports infrastructure, Courtside emphasizes:

- **User-friendly experience** with intuitive booking flows
- **Real-time availability** updates using Supabase Realtime
- **Role-based access control** for users and administrators
- **Smart spot selection** with gender and user-type filtering
- **Comprehensive admin dashboard** for facility management
- **Optimized for scale** to handle 25,000+ concurrent users

## ✨ Features

### For Users
- 🔐 **Secure Authentication** - Sign up & login with Supabase Auth
- 👤 **Profile Management** - First-time user onboarding flow
- 🎟️ **Intuitive Booking** - Book sports slots with spot selection
- ⚡ **Real-time Updates** - Instant availability updates using Supabase Realtime
- 🔍 **Smart Filtering** - Bookings filtered by gender and user type
- 📋 **Booking History** - View past and current bookings
- ❌ **Easy Cancellation** - Cancel bookings with appropriate restrictions
- 📱 **Modern UI/UX** - Responsive design with dark/light mode
- 🧠 **AI Assistant** - Chat with Courtside AI for smart recommendations

### For Administrators
- 🔑 **Role-based Access** - Admin panel access via profile role setting
- 📊 **Booking Management** - View all bookings with comprehensive details
- ✅ **Attendance Tracking** - Check-in/check-out functionality with status updates
- 🗄️ **Historical Data** - Access to booking history with archived data
- ⚙️ **Facility Management** - Control sports and slot configurations
- 📄 **Pagination** - Efficiently navigate through booking records
- 🔄 **Daily Reset** - Automatic clearing of expired bookings at midnight
- 📈 **Analytics Dashboard** - Comprehensive system-wide analytics and insights
- 📊 **Advanced Charts** - Interactive visualizations with Recharts integration
- 👥 **User Analytics** - Demographics, growth trends, and user type distribution
- 🏆 **Sports Analytics** - Booking distribution and facility utilization metrics
- ⏰ **Time-based Insights** - Slot utilization patterns and peak usage analysis
- 🎨 **Modern UI** - Enhanced dashboard with gradient designs and responsive layouts
- 📱 **Enhanced QR Scanner System** - Professional dual-mode scanning interface with camera and automated scanner options
- 🔍 **IoT Integration** - Automated laser scanner support with manual booking ID entry fallback
- 🎵 **Audio Feedback** - Professional scanner beep sounds with success/error tone differentiation
- 💬 **Feedback Management** - Collect and manage user feedback with comprehensive admin panel
- 🚫 **User Access Control** - Ban/restrict user accounts with automatic logout functionality

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 15 (App Router) |
| Language | TypeScript 5.x |
| Backend | Supabase (Database + Auth + Storage + Realtime) |
| Styling | Tailwind CSS 4 + Shadcn/ui |
| State Management | React 19 Hooks + Context API |
| Icons | Lucide React |
| Authentication | Supabase Auth with SSR |
| Database | Supabase PostgreSQL (optimized with indexes) |
| Real-time Updates | Supabase Realtime with custom hooks |
| Toast Notifications | Sonner |
| Analytics | Vercel Analytics + Speed Insights |
| Animations | Motion + tw-animate-css |
| Theme | next-themes (dark/light mode) |
| Charts & Visualization | Recharts (React + D3.js) |
| Data Processing | React useMemo for optimized calculations |
| Error Handling | React Error Boundary for robust chart rendering |
| QR Code Scanning | QR-Scanner library + Professional audio feedback system |
| IoT Integration | Automated scanner devices with emerald-themed UI enhancements |
| Deployment | Vercel (Edge Functions) |
| AI Integration | Vercel AI SDK (Google Gemini) |

## 🚀 Performance Optimizations

- **Database Indexing**: Optimized queries with strategic indexes for 25,000+ users
- **Supabase Realtime**: Replaced polling with efficient websocket connections
- **Connection Pooling**: Automatic connection management for scalability
- **Enhanced Time Validation**: Bulletproof server-side validation for bookings
- **Chart Performance**: Memoized data processing and lazy loading for analytics
- **SVG to Lucide Migration**: Consistent icon system with optimized rendering
- **Component Optimization**: Error boundaries and Suspense for robust UI

## 🗂️ Project Structure

```
/app
  /(auth)              # Authentication pages
    /login                # Login functionality
    /signup               # Signup functionality
    /forgot-password      # Forgot password flow
    /reset-password       # Reset password flow
    /onboarding           # First-time user setup
    /set-password         # Set password for new users
  /(main)              # User-facing pages
    /sports/[id]/slots    # Sports slot booking
    /my-bookings          # Booking history and current bookings
    /profile              # User profile management
    /dashboard            # Analytics dashboard with comprehensive insights
    /rules                # Sports facility rules
    /terms                # Terms and conditions
  /admin               # Admin dashboard
    /bookings             # Manage bookings
    /bookings-history     # Historical booking data and archives
    /slots                # Manage sports slots
    /sports               # Manage sports facilities
    /feedback             # User feedback management system
    /qr-scanner           # Professional QR code scanning system
      /camera             # Camera-based QR scanning with modern UI
      /iot                # Automated scanner with emerald-themed interface
  /assistant           # AI assistant for recommendations
  /banned              # Restricted access page for suspended users
  /api                 # API routes
    /chat               # AI assistant chat functionality
    /check-profile      # Profile validation endpoints
    /reset-bookings     # Daily booking reset functionality
/components            # Reusable UI components
/utils/supabase        # Supabase client and utilities
/components/ui         # Shadcn UI wrappers
/hooks                 # Custom React hooks
/lib                   # General utility functions
```

## 📊 Analytics Dashboard Features

### Overview Tab
- **Key Metrics Cards**: Total users, active sports, available slots, and total bookings
- **Booking Trends**: Weekly activity patterns with interactive charts
- **Sports Distribution**: Visual breakdown of booking distribution across sports
- **Real-time Data**: Live updates with Supabase Realtime integration

### Bookings Tab
- **Comprehensive Analysis**: Detailed booking patterns and trends
- **Slot Utilization**: Time-based usage analytics and peak hour identification
- **Interactive Charts**: Responsive visualizations with theme support

### Users Tab
- **Demographics Visualization**: Gender distribution with animated progress bars
- **User Type Analysis**: Student vs Faculty breakdown with role-based insights
- **Growth Analytics**: 
  - Monthly registration trends with customizable time ranges
  - Cumulative vs monthly view toggles
  - Growth rate calculations and peak month identification
  - Enhanced 500px height chart with improved spacing and controls
  - Advanced statistics cards with gradient designs
  - Responsive layout optimized for all screen sizes

### Technical Features
- **Consistent Icon System**: Migrated from SVG to Lucide React icons
- **Performance Optimized**: Memoized calculations and efficient data processing
- **Error Handling**: Robust error boundaries with fallback components
- **Theme Support**: Full dark/light mode compatibility
- **Responsive Design**: Mobile-first approach with enhanced tablet/desktop layouts

## 📱 QR Scanner System

### Camera Scanner
- **Real-time QR Scanning**: HTML5-QRCode integration for live camera scanning with enhanced accuracy
- **Instant Verification**: Immediate booking validation and check-in/check-out with audio feedback
- **Modern UI**: Gradient-designed interface with responsive controls and emerald accent colors
- **Error Handling**: Robust error boundaries with user-friendly fallback mechanisms
- **Mobile Optimized**: Touch-friendly controls with professional responsive design

### Automated Scanner (IoT)
- **Professional Interface**: Clean emerald-themed design with enhanced user experience
- **Dual Input Methods**: Manual booking ID entry and automated QR code scanning support
- **Enhanced Input Design**: Pulsing border effects with professional cursor styling and accessibility features
- **Audio Feedback System**: Professional scanner beep sounds with success/error tone differentiation
- **System Health Monitoring**: Real-time scanner status with visual indicators and diagnostic capabilities
- **Manual Controls**: Start/stop scanner operations with intuitive button interface

### Shared Features
- **Booking Validation**: Instant verification of booking details and user permissions
- **Status Management**: Real-time check-in/check-out tracking with timestamp logging
- **User-Friendly Language**: Replaced technical "IoT" terminology with accessible "Automated Scanner" branding
- **Theme Consistency**: Full dark/light mode support with emerald color scheme throughout
- **Enterprise-Grade Design**: Professional appearance suitable for institutional environments

### Admin Check-in Features
- **Attendance Tracking**: Real-time check-in/check-out status updates
- **Booking Validation**: Verify booking details before check-in
- **Status Management**: Track user attendance with timestamp logging
- **Quick Stats**: Fast check-in metrics and QR compatibility indicators

## 💬 Feedback Management System

### User Feedback Collection
- **Comprehensive Feedback**: Collect user suggestions and complaints
- **Admin Dashboard**: Centralized feedback management interface
- **Real-time Updates**: Live feedback submission and admin notifications
- **Responsive Design**: Mobile-friendly feedback collection forms

### Admin Feedback Management
- **Feedback Table**: Sortable and filterable feedback entries
- **Status Tracking**: Mark feedback as read, resolved, or pending
- **User Details**: Access to feedback author information
- **Export Capabilities**: Download feedback data for analysis

## 🚫 User Access Control

### Banned User Management
- **Account Restrictions**: Temporary or permanent account suspension
- **Automatic Logout**: Immediate session termination for banned users
- **Violation Categories**: Clear guidelines for policy violations
- **Appeal Process**: Contact information for account restoration
- **Admin Notifications**: Alerts for restricted access attempts

## 🧮 Database Schema

### Core Tables

#### `profiles`
- `id` (UUID, PK, matches auth.uid)
- `first_name`, `last_name`
- `gender` ('male', 'female', 'other')
- `user_type` ('student', 'faculty', etc.)
- `role` ('user', 'admin')

#### `sports`
- `id`, `name`
- `seat_limit`
- `is_active`

#### `slots`
- `id`, `sport_id`
- `start_time`, `end_time`
- `gender` (access restriction)
- `allowed_user_type`
- `total_seats`
- `is_active`

#### `bookings`
- `id` (UUID)
- `user_id`, `slot_id`, `sport_id`
- `booking_date`, `seat_number`
- `status` ('booked', 'checked-in', 'checked-out')
- `created_at`

#### `bookings_history`
- Archived records from bookings
- Admin-only access

#### `user_feedback`
- `id` (UUID, PK)
- `user_id` (references profiles)
- `feedback_text`, `rating`
- `category`, `status`
- `created_at`

## 📚 Core Logic

### Booking System
- Spot availability is calculated dynamically per slot
- Unique spot numbers are assigned during booking
- Slots are filtered based on gender and user type compatibility
- Cancellation is allowed up to 30 minutes before slot start time
- System automatically filters out expired slots

### AI Assistant
- Provides smart recommendations for booking slots
- Validates time and slot availability using server-side checks
- Ensures security by never exposing raw database structures

### QR Scanner System
- **Camera Integration**: HTML5-QRCode library for real-time scanning
- **Manual Fallback**: IoT device compatibility with manual ID entry
- **Booking Validation**: Server-side verification of scanned booking IDs
- **Attendance Tracking**: Automatic check-in/check-out with timestamp logging
- **Error Handling**: Robust error boundaries for scanning failures

### Feedback System
- **User Feedback Collection**: Comprehensive feedback submission forms
- **Admin Management**: Centralized dashboard for feedback review and response
- **Status Tracking**: Mark feedback as pending, reviewed, or resolved
- **Real-time Updates**: Live feedback submission with instant admin notifications

### User Access Control
- **Account Restrictions**: Ban/suspend users with policy violations
- **Automatic Session Management**: Immediate logout for restricted accounts
- **Appeal Process**: Clear guidelines for account restoration requests
- **Admin Oversight**: Comprehensive user management and monitoring tools

### Authentication
- Implements Supabase Auth (email/password)
- Sessions are persisted via cookies
- First-time users are redirected to complete their profile

### Analytics & Visualization
- Real-time dashboard with comprehensive system analytics
- Interactive charts using Recharts with customizable time ranges
- Optimized data processing with React useMemo for large datasets
- Responsive visualizations that adapt to different screen sizes
- Theme-aware charts with dark/light mode support

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or pnpm
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SubhajitDolai/Courtside.git
   cd courtside
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   pnpm install
   ```
   
   **Note**: The QR scanner functionality requires camera permissions. Ensure your deployment environment supports HTTPS for camera access.

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   BACKUP_CRON_SECRET=your-custom-key-for-hitting-custom-api-everyday-at-12am-to-clear-bookings
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow the project coding conventions and use meaningful commit messages.

## 💼 Project Status

This is a personal project developed by Subhajit Dolai for educational purposes and portfolio demonstration.

## ✨ Acknowledgments

- Built with ❤️ by Subhajit at MIT World Peace University
- Special thanks to all mentors

---

<div align="center">
  <p>Ready to book your game? Head over to <a href="https://courtside-xi.vercel.app">Courtside</a> and lock in your spot! 🏸🏊⚽</p>
</div>