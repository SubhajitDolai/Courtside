# Courtside

<div align="center">

![Courtside Logo](/public/logo-light.webp)

**A modern sports facility booking platform for educational institutions**

[![Personal Project](https://img.shields.io/badge/Personal-Project-purple.svg)](https://github.com/SubhajitDolai)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-darkgreen)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)](https://www.typescriptlang.org/)

[Demo](https://courtside-xi.vercel.app) • [Report Bug](https://github.com/SubhajitDolai/Courtside/issues) • [Request Feature](https://github.com/SubhajitDolai/Courtside/issues)

</div>

## 🎯 Demo Credentials

Try out the live demo with these test accounts:

### Admin Access
```
Email: subhajitdolai999@gmail.com
Password: admin1234
```
*Full admin dashboard access with booking management, analytics, QR scanner, and user management features*

### User Access
*You can create your own user account or use the admin credentials to explore all features*

**Note**: This is a live demo environment. Please be respectful when testing features.

## 📋 Overview

Courtside is a comprehensive full-stack web application designed to streamline the booking of sports facilities such as badminton courts, swimming pools, and other sports venues. Built specifically for educational institutions and communities with shared sports infrastructure, Courtside emphasizes:

- **User-friendly experience** with intuitive booking flows
- **Real-time availability** updates using Supabase Realtime
- **Role-based access control** for users and administrators
- **Smart spot selection** with gender and user-type filtering
- **Comprehensive admin dashboard** for facility management
- **Automated scheduling** with GitHub Actions for institutional calendar management
- **Advanced AI assistance** for intelligent booking recommendations
- **Professional QR scanning** for attendance tracking
- **Optimized for scale** to handle 25,000+ concurrent users

## ✨ Features

### For Users
- 🔐 **Secure Authentication** - Sign up & login with Supabase Auth
- 👤 **Profile Management** - First-time user onboarding flow
- 🎟️ **Intuitive Booking** - Book sports slots with spot selection
- ⚡ **Live Updates** - Instant availability updates using Supabase Realtime
- 🔍 **Smart Filtering** - Bookings filtered by gender and user type restrictions
- 📋 **Booking History** - View past and current bookings with detailed status
- ❌ **Easy Cancellation** - Cancel bookings with time-based restrictions
- 📱 **Modern UI/UX** - Responsive design with dark/light mode support
- 🧠 **AI Assistant** - Chat with Courtside AI for smart recommendations and instant help
- 🔔 **Live Notifications** - Real-time system announcements and booking confirmations
- 🎯 **Visual Spot Selection** - Interactive seat selection with live availability
- 📊 **Personal Dashboard** - Comprehensive analytics and booking insights
- 🚫 **Access Control** - Automatic handling of restricted accounts
- 📢 **System Announcements** - Instant access to important notifications and updates
- 🎫 **QR Code Generation** - Download booking confirmations as QR codes

### For Administrators
- 🔑 **Role-based Access** - Admin panel access via profile role setting
- 📊 **Booking Management** - View all bookings with comprehensive details
- ✅ **Attendance Tracking** - Check-in/check-out functionality with QR scanner
- 🗄️ **Historical Data** - Access to booking history with archived data
- ⚙️ **Facility Management** - Control sports and slot configurations
- 📄 **Pagination** - Efficiently navigate through booking records
- 🔄 **Automated Reset** - Daily clearing of expired bookings at 10:30 PM IST
- 📈 **Analytics Dashboard** - Comprehensive system-wide analytics and insights
- 📊 **Interactive Charts** - Advanced visualizations with Recharts integration
- 👥 **User Analytics** - Demographics, growth trends, and user type distribution
- 🏆 **Sports Analytics** - Booking distribution and facility utilization metrics
- ⏰ **Usage Insights** - Slot utilization patterns and peak usage analysis
- 🎨 **Modern UI** - Enhanced dashboard with gradient designs and responsive layouts
- 📱 **Professional QR Scanner** - Dual-mode scanning with camera and automated options
- 🔍 **IoT Integration** - Automated laser scanner support with manual booking ID entry
- 🎵 **Audio Feedback** - Professional scanner beep sounds with success/error differentiation
- 💬 **Feedback Management** - Collect and manage user feedback with admin panel
- 🚫 **User Access Control** - Ban/restrict user accounts with automatic logout
- 🕒 **Schedule Automation** - Institutional calendar management via GitHub Actions
- 📱 **Mobile-Optimized** - Full responsive design for all administrative tasks
- 📢 **Notifications Management** - Create, manage, and broadcast system-wide announcements
- 🔔 **Real-time Alerts** - Instant notification delivery with live status updates
- 🛡️ **Super Admin System** - Advanced profile management with dedicated super admin controls

### 🤖 Automated Systems
- ⏰ **Institutional Calendar Integration** - Sunday sports deactivation with Monday reactivation
- 🔄 **Daily Data Management** - Automated booking archival and cleanup at 10:30 PM IST
- 📅 **Schedule Automation** - GitHub Actions with retry logic and IST timezone support
- 🔧 **Self-Healing Systems** - Error handling and reliability mechanisms

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Frontend** | Next.js 15.3.5 (App Router) with React 19.1.0 |
| **Language** | TypeScript 5.x with strict type checking |
| **Backend** | Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Styling** | Tailwind CSS 4 + Shadcn/ui + tw-animate-css |
| **State Management** | React Hooks + Context API + Custom hooks |
| **Icons** | Lucide React (consistent icon system) |
| **Authentication** | Supabase Auth with SSR support |
| **Database** | Supabase PostgreSQL (optimized with strategic indexes) |
| **Real-time Updates** | Supabase Realtime with custom subscription hooks |
| **Toast Notifications** | Sonner for user feedback |
| **Analytics** | Vercel Analytics + Speed Insights |
| **Animations** | Motion 12.15.0 + tw-animate-css for smooth interactions |
| **Theme** | next-themes (dark/light mode with system detection) |
| **Charts & Visualization** | Recharts 2.15.3 (React + D3.js) with responsive design |
| **Data Processing** | React useMemo for optimized calculations |
| **Error Handling** | React Error Boundary for robust rendering |
| **QR Code Scanning** | qr-scanner 1.4.2 + Professional Web Audio API feedback |
| **QR Code Generation** | qrcode 1.5.4 + react-qr-code 2.0.15 libraries |
| **Date Management** | date-fns 3.6.0 for timezone handling (IST support) |
| **Deployment** | Vercel (Edge Functions) with ISR |
| **AI Integration** | Vercel AI SDK 4.3.16 + Google Gemini 2.0 Flash (@ai-sdk/google 1.2.18) |
| **Automation** | GitHub Actions with cron scheduling (IST timezone) |
| **Form Handling** | Zod 3.25.48 validation with type-safe schemas |
| **Professional UI** | Radix UI primitives with accessibility-first design |

## 🎨 Advanced Design System

### Modern CSS Architecture
- **Tailwind CSS 4**: Latest version with custom CSS properties integration (`@import "tailwindcss"`)
- **Custom Variant System**: Advanced dark mode support with `@custom-variant dark (&:is(.dark *))`
- **Professional Color Palette**: OKLCH color space for consistent perception across devices
- **Dynamic Theme Variables**: 50+ CSS custom properties for seamless light/dark transitions
- **Geist Font Integration**: Modern typography with `--font-geist-sans` and `--font-geist-mono`

### Animation & Interaction System
- **tw-animate-css Integration**: Enhanced animation library with custom keyframes
- **Professional Transitions**: 
  - `fade-in` and `fade-in-soft` animations for component mounting
  - `shrink` animations for QR scanner popup progress indicators
  - `shimmer` effects for premium UI components
- **Performance-Optimized**: GPU-accelerated transforms with smooth 60fps animations
- **Accessibility-First**: Respects user's motion preferences and provides alternatives

### Component Styling Standards
- **Emerald Accent System**: Consistent emerald color scheme for QR scanner and accent elements
- **Gradient Backgrounds**: Professional gradient combinations for modern appearance
- **Shadow & Depth**: Strategic use of shadows and borders for visual hierarchy
- **Mobile-First Responsive**: Breakpoint system optimized for all device sizes
- **Dark Mode Excellence**: Full feature parity with automatic theme detection

## 🚀 Performance Optimizations

- **Database Indexing**: Strategic indexes optimized for 25,000+ concurrent users
- **Supabase Realtime**: Efficient websocket connections replacing polling
- **Connection Pooling**: Automatic connection management for scalability
- **Enhanced Time Validation**: Bulletproof server-side booking validation
- **Chart Performance**: Memoized data processing with lazy loading
- **Component Optimization**: Error boundaries, Suspense, and code splitting
- **Automation Reliability**: GitHub Actions with retry logic and timeout management
- **Image Optimization**: WebP format with responsive loading and ISR

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
    /error                # Authentication error handling
  /(main)              # User-facing pages
    /sports/[id]          # Sports details and slot booking
      /slots              # Available time slots
      /[slotId]/seats     # Seat selection with real-time updates
    /my-bookings          # Booking history and current bookings
    /profile              # User profile management
    /dashboard            # Analytics dashboard with comprehensive insights
    /notifications        # Real-time system announcements and important updates
    /rules                # Sports facility rules
    /terms                # Terms and conditions
  /admin               # Admin dashboard
    /bookings             # Manage current bookings
    /bookings-history     # Historical booking data and archives
    /slots                # Manage sports slots
    /sports               # Manage sports facilities
    /feedback             # User feedback management system
    /notifications        # System-wide announcements and notifications management
    /profiles             # Super admin profile management with role controls
    /qr-scanner           # Professional QR code scanning system
      /camera             # Camera-based QR scanning with modern UI
      /iot                # Automated scanner with emerald-themed interface
  /assistant           # AI assistant for intelligent recommendations
  /banned              # Restricted access page for suspended users
  /api                 # API routes
    /chat               # AI assistant chat functionality with Google Gemini
    /check-profile      # Profile validation endpoints
    /check-user-exists  # User existence validation
    /reset-bookings     # Daily booking reset functionality (GitHub Actions)
    /sports             # Sports management APIs
      /activate         # Automated sports activation (Monday 12:00 AM IST)
      /deactivate       # Automated sports deactivation (Sunday 12:00 AM IST)
    /super-admin        # Super admin management endpoints
/.github
  /workflows           # GitHub Actions for automation
    /reset-bookings.yml   # Daily booking cleanup at 10:30 PM IST
    /activate-sports.yml  # Monday sports activation
    /deactivate-sports.yml # Sunday sports deactivation
/components            # Reusable UI components
  /ui                   # Shadcn UI components
  /providers            # Context providers (LoadingBar, Notifications)
  /motion-primitives    # Animation components
/database              # Database schemas and helpers
  /schema.sql           # Main database schema
  /super_admin_helpers.sql # Super admin management functions
  /super_admin_rls.sql  # Row-level security policies
  /indexes.sql          # Performance optimization indexes
  /userExistCheck.sql   # User validation queries
/hooks                 # Custom React hooks
  /useCurrentUser.tsx   # User state management
  /useRealtimeSubscription.tsx # Supabase realtime integration
  /useSuperAdmin.tsx    # Super admin permission checking
/lib                   # General utility functions
  /auth.ts              # Authentication utilities
  /getUserWithProfile.ts # User data fetching
  /check-profile.ts     # Profile validation
  /date.ts              # Date/timezone utilities (IST support)
  /utils.ts             # General utilities and class name merging
/utils/supabase        # Supabase client and utilities
  /client.ts            # Browser client configuration
  /server.ts            # Server client with SSR support
  /middleware.ts        # SSR session management
/public                # Static assets
  /logo-dark.webp       # Dark theme logo
  /logo-light.webp      # Light theme logo
  /mit.webp             # Institution logo
  /sports_img/          # Sport images (WebP format)
  /sports_png/          # Fallback sport images
  /team/                # Team member photos
```

## 🤖 Automated Scheduling System

### GitHub Actions Integration
Courtside features a sophisticated automation system that respects institutional schedules with precision timing:

#### **Sunday OFF Automation** (`activate-sports.yml` & `deactivate-sports.yml`)
- **Deactivation**: Saturday 6:30 PM UTC (Sunday 12:00 AM IST) - All sports facilities automatically deactivated
- **Activation**: Sunday 6:30 PM UTC (Monday 12:00 AM IST) - All sports facilities automatically reactivated
- **Perfect IST Timing**: Designed specifically for Indian educational institutions with precise timezone conversion
- **Retry Logic**: 3 attempts with 10-second delays and comprehensive error handling for reliability
- **Manual Override**: Emergency manual triggers available via `workflow_dispatch` for administrators
- **Timeout Protection**: 10-minute job timeouts to prevent hanging workflows

#### **Daily Data Management** (`reset-bookings.yml`)
- **Booking Archival**: Automatic archival of completed bookings to `bookings_history` table
- **Data Cleanup**: Daily reset at 10:30 PM IST (17:00 UTC) to maintain optimal performance
- **Audit Trail**: Complete historical data preservation for reporting and analytics
- **IST Timezone Support**: `cron: '0 17 * * *'` for precise 10:30 PM IST execution

#### **Technical Implementation Details**
- **GitHub Actions**: Cron-based scheduling with UTC to IST conversion (`cron: '30 18 * * 0'` for Sunday operations)
- **API Security**: Secret-based authentication (`BACKUP_CRON_SECRET`) for automated endpoints
- **Error Handling**: Comprehensive logging with HTTP response code validation and failure notifications
- **Scalability**: Designed to handle institutional-scale automation with retry mechanisms
- **Environment Variables**: Secure configuration via GitHub Secrets for API URLs and authentication
- **Daily Reset**: `cron: '0 17 * * *'` executes at 10:30 PM IST for booking cleanup

### Benefits
- **Zero Manual Work**: Complete hands-off institutional schedule management
- **Reliability**: Multiple retry attempts and timeout protection
- **Transparency**: Detailed logging for audit and debugging
- **Flexibility**: Easy schedule modification for holidays or special events

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

## 📱 Professional QR Scanner System

### Camera Scanner (`/admin/qr-scanner/camera`)
- **Advanced QR Engine**: QrScanner library with enhanced detection algorithms and reliability
- **Intelligent Camera Management**: Auto-detection with smart preference for back/environment cameras
- **Multi-Camera Support**: Seamless switching between available cameras with device enumeration and validation
- **Professional Audio Feedback**: Dual-tone barcode scanner beeps (1200Hz + 800Hz triangle waves) using Web Audio API
- **Enterprise Error Handling**: Exponential backoff retry logic, camera conflict resolution, and graceful fallbacks
- **Performance Optimization**: Memory leak prevention, automatic periodic restarts (4-hour cycles), and resource cleanup
- **Real-time System Health**: Live monitoring with uptime tracking, scans/hour metrics, memory usage (100MB threshold), and restart counters
- **Long-Session Stability**: Failed operation queuing with offline support, network status monitoring, and auto-recovery
- **Mobile-Optimized UI**: Responsive design with touch-friendly controls, professional gradient backgrounds, and accessibility features
- **Advanced Session Management**:
  - Page leave detection and cleanup (beforeunload, visibilitychange, pagehide, popstate)
  - Camera resource conflict resolution with permission handling
  - Automatic camera switching when resources become unavailable
  - Session timeout handling with exponential backoff on errors

### Automated Scanner (`/admin/qr-scanner/iot`)
- **Clean Professional Interface**: Emerald-themed design with enhanced UX and accessibility
- **Dual Input Methods**: Manual booking ID entry with UUID validation and automated QR scanning support
- **Enhanced Input Design**: Pulsing border effects, professional cursor styling, and accessibility-first approach
- **Audio Feedback System**: Professional scanner beep sounds with distinct success/error tone differentiation
- **System Health Monitoring**: Real-time scanner status with visual indicators, uptime tracking, and diagnostic capabilities
- **Manual Controls**: Start/stop scanner operations with intuitive button interface and status management
- **Offline Queue Management**: Failed operations queuing with automatic retry when connection restored

### Shared Core Features
- **Bulletproof Booking Validation**: Multi-layer validation including UUID format, time slots, user permissions, and business logic
- **Smart Status Management**: Automated check-in/check-out with proper state transitions (booked → checked-in → checked-out)
- **Time Validation Engine**: 
  - Check-in window enforcement (10 minutes before slot start)
  - Slot expiry validation with 12-hour time format display
  - IST timezone support with server-side time validation
- **Enterprise Database Operations**: Retry logic with exponential backoff, transaction safety, and audit trail maintenance
- **Professional UX Language**: User-friendly messaging replacing technical "IoT" terminology with "Automated Scanner"
- **Consistent Theme System**: Full dark/light mode support with emerald accent colors throughout
- **Production-Ready Design**: Enterprise-grade appearance suitable for institutional environments
- **Comprehensive Error Recovery**: Network disconnection handling, camera permission issues, and graceful degradation

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

## 📢 Notifications Management System

### Admin Notification Control
- **Create Announcements**: Compose system-wide notifications with rich formatting
- **Notification Types**: Categorize announcements (urgent, maintenance, general, etc.)
- **Status Management**: Activate/deactivate notifications with real-time updates
- **Audience Targeting**: Control visibility and reach of announcements

### User Notification Experience
- **Real-time Delivery**: Instant notification updates using Supabase Realtime
- **Notification Center**: Dedicated page for viewing all system announcements
- **Connection Status**: Live indicators showing notification sync status
- **Type-based Styling**: Visual differentiation for urgent, maintenance, and general notifications
- **Auto-refresh**: Smart refresh capabilities with manual override options

### AI Assistant Integration
- **Contextual Responses**: AI assistant aware of current notifications and announcements
- **Smart Recommendations**: Notification-based guidance and support
- **Real-time Data**: Assistant responses include latest notification status

## 🚫 User Access Control & Security

### Super Admin Management System
- **Profile Management**: Dedicated super admin interface for advanced user management
- **Role Controls**: Grant/revoke admin privileges with comprehensive role management
- **Search & Filter**: Advanced search functionality for user profiles and admin management
- **Permission System**: Granular permission controls with JSONB-based configuration
- **Audit Trail**: Complete tracking of admin privilege changes and system access
- **Row-Level Security**: Database-level security policies for super admin operations

### Banned User Management
- **Account Restrictions**: Temporary or permanent account suspension capabilities
- **Automatic Session Termination**: Immediate logout for banned users across all devices
- **Violation Categories**: Clear guidelines for policy violations and consequences
- **Appeal Process**: Structured contact information for account restoration requests
- **Admin Notifications**: Real-time alerts for restricted access attempts
- **Graceful UX**: User-friendly banned page with clear next steps

### Security Features
- **Real-time Ban Detection**: Automatic session refresh checks for account status
- **Middleware Protection**: Route-level access control and validation
- **Session Management**: Secure cookie-based authentication with automatic cleanup
- **Role-based Permissions**: Granular access control for different user types
- **API Security**: Secret-based authentication for automated endpoints
- **Super Admin Protection**: Enhanced security for super admin operations with dedicated RLS policies

## 🧮 Database Schema

### Core Tables

#### `profiles`
- `id` (UUID, PK, matches auth.uid)
- `first_name`, `last_name` (text, nullable)
- `prn` (text, nullable) - Student PRN or Employee ID
- `email` (text, nullable)
- `course` (text, nullable) - Course/Department
- `gender` (text, nullable) - User gender
- `phone_number` (text, nullable)
- `user_type` (text, default: 'student') - User type classification
- `role` (text, default: 'user') - System role ('user', 'admin')
- `created_at` (timestamptz, default: now())
- Foreign key constraint to `auth.users` with CASCADE delete

#### `sports`
- `id` (UUID, PK, default: gen_random_uuid())
- `name` (text, not null) - Sport name
- `image_url` (text, nullable) - Sport image URL
- `seat_limit` (integer, default: 20) - Maximum bookings per slot
- `is_active` (boolean, default: true) - Sport availability status
- `created_at` (timestamptz, default: now())

#### `slots`
- `id` (UUID, PK, default: gen_random_uuid())
- `sport_id` (UUID, FK to sports) - Associated sport
- `start_time` (time without timezone, not null) - Slot start time
- `end_time` (time without timezone, not null) - Slot end time
- `gender` (text, default: 'any') - Gender restriction ('male', 'female', 'any')
- `allowed_user_type` (text, default: 'student') - User type restriction
- `is_active` (boolean, default: true) - Slot availability
- `created_at` (timestamptz, default: now())
- Foreign key to sports with CASCADE delete

#### `bookings`
- `id` (UUID, PK, default: gen_random_uuid())
- `user_id` (UUID, FK to profiles) - Booking owner
- `sport_id` (UUID, FK to sports) - Booked sport
- `slot_id` (UUID, FK to slots) - Booked time slot
- `booking_date` (date, not null) - Date of booking
- `seat_number` (integer, nullable) - Assigned seat number
- `status` (text, default: 'booked') - Booking status
- `checked_in_at` (timestamptz, nullable) - Check-in timestamp
- `checked_out_at` (timestamptz, nullable) - Check-out timestamp
- `created_at` (timestamptz, default: now())
- **UNIQUE constraint**: `(sport_id, slot_id, booking_date, seat_number)`
- Foreign keys with CASCADE delete to slots, sports, profiles

#### `bookings_history`
- `id` (UUID, PK, default: gen_random_uuid())
- `user_id` (UUID, FK to profiles) - Original booking owner
- `sport_id` (UUID, FK to sports) - Archived sport booking
- `slot_id` (UUID, FK to slots) - Archived slot booking
- `booking_date` (date, not null) - Original booking date
- `seat_number` (integer, nullable) - Original seat assignment
- `status` (text, not null) - Final booking status
- `checked_in_at` (timestamptz, nullable) - Check-in record
- `checked_out_at` (timestamptz, nullable) - Check-out record
- `created_at` (timestamptz, default: now()) - Archive timestamp
- Foreign keys with CASCADE delete to slots, sports, profiles

#### `notifications`
- `id` (UUID, PK, default: gen_random_uuid())
- `title` (text, not null) - Notification title
- `message` (text, not null) - Notification content
- `type` (text, default: 'general') - Type: 'general', 'maintenance', 'urgent'
- `is_active` (boolean, default: true) - Visibility control
- `created_by` (UUID, FK to profiles) - Admin creator (SET NULL on delete)
- `created_at` (timestamptz, default: now())
- **CHECK constraint**: Type must be 'general', 'maintenance', or 'urgent'

#### `user_feedback`
- `id` (UUID, PK, default: gen_random_uuid())
- `note` (text, not null) - Feedback content
- `email` (text, nullable) - User email
- `profile_id` (UUID, FK to profiles) - Associated user profile
- `user_name` (text, nullable) - User display name
- `user_prn` (text, nullable) - User PRN/ID
- `created_at` (timestamptz, default: now())
- Foreign key to profiles (no CASCADE)

#### `super_admins`
- `id` (UUID, PK, default: gen_random_uuid())
- `profile_id` (UUID, FK to profiles, UNIQUE) - Linked user profile
- `first_name` (text, not null) - Cached first name
- `last_name` (text, not null) - Cached last name
- `email` (text, not null) - Cached email
- `prn` (text, not null) - Cached PRN/ID
- `is_active` (boolean, default: true) - Super admin status
- `permissions` (JSONB, default: '{"all_apps": true}') - Permission config
- `created_at` (timestamptz, default: now())
- Foreign key to profiles with CASCADE delete
- **Row Level Security (RLS)** enabled with restrictive policies

### Database Functions

#### Super Admin Management Functions
- **`create_super_admin_by_email(email TEXT)`** - Elevate user to super admin
- **`remove_super_admin_by_email(email TEXT)`** - Remove super admin privileges  
- **`list_super_admins()`** - Return all super admin records
- **`user_exists_by_email(email TEXT)`** - Check if user exists in auth.users

### Database Optimizations

#### Strategic Indexing (50+ Optimized Indexes)
- **Profiles**: Email, PRN, user_type, role, gender, names, composite indexes
- **Sports**: Active status, name, seat_limit combinations
- **Slots**: Sport access control, time ranges, admin queries
- **Bookings**: User patterns, status tracking, seat management, trends analysis
- **Bookings History**: Archive queries, date ranges, sport/user patterns
- **Notifications**: Active status, type filtering, creation order
- **User Feedback**: Profile lookups, email search, full-text search on notes

#### Security Features
- **Row Level Security (RLS)**: Enabled on super_admins table
- **Restrictive Policies**: Read-only access via client, modifications via functions only
- **Foreign Key Constraints**: Maintain referential integrity with CASCADE deletes
- **Unique Constraints**: Prevent duplicate bookings and super admin entries
- **Check Constraints**: Enforce valid notification types

#### Performance Features
- **Composite Indexes**: Multi-column indexes for complex filtering scenarios
- **Full-Text Search**: GIN indexes for feedback content searching
- **Time-based Indexing**: Optimized for booking date ranges and trends
- **Connection Pooling**: Designed for high-concurrency institutional usage

## 📚 Core Logic

### Advanced Booking System
- **Dynamic Availability**: Live spot calculation with Supabase Realtime integration
- **Multi-layer Validation**: Gender + user type + time + availability checks
- **Smart Constraints**: Prevents double bookings, time conflicts, and enforces cancellation rules
- **Automated Expiry**: Server-side time validation with bulletproof checks

### AI Assistant (Courtside AI)
- **Advanced AI SDK Integration**: Vercel AI SDK v4.3.16 with React hooks for seamless streaming responses
- **Google Gemini 2.0 Flash**: Latest `google-2.0-flash` model via @ai-sdk/google v1.2.18 for advanced NLP and intelligent responses
- **Real-time Data Integration**: Live sports and slot availability with bulletproof server-side validation
- **Contextual Understanding**: Maintains conversation context with institutional knowledge and user session awareness
- **Advanced Filtering**: User permission-aware responses (student/faculty, gender restrictions) with "any" bypass logic
- **Security-First Design**: Never exposes raw database structures or sensitive information
- **Ultra-Strict Time Validation**: Bulletproof server-side time validation with IST timezone support that cannot be bypassed
- **Streaming Responses**: Real-time message streaming with professional UI/UX and loading states
- **Intelligent Recommendations**: Smart booking suggestions based on user profile, availability patterns, and slot constraints
- **Multi-topic Support**: Handles sports bookings, general knowledge, academic guidance, and institutional queries
- **Notification Integration**: AI assistant aware of current system announcements and notifications for contextual support

### Professional QR Scanner System
- **Multi-mode Scanning**: Camera-based and IoT device integration with audio feedback
- **Attendance Tracking**: Automatic check-in/check-out with precise timestamp logging
- **Error Recovery**: Robust error boundaries with mobile-optimized interface

### User Management & Security
- **Access Control**: Granular ban/suspend functionality with real-time detection
- **Session Management**: Automatic termination for restricted accounts with appeal process
- **Authentication**: Supabase Auth with SSR, secure cookies, and mandatory profile completion

### Institutional Automation
- **Schedule Management**: GitHub Actions for Sunday OFF with IST timezone support
- **Data Archival**: Automated booking history management and cleanup
- **Analytics Engine**: Live dashboard with interactive charts and performance optimization

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
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
   
   # API Security
   BACKUP_CRON_SECRET=your-custom-secret-for-automation-apis
   
   # AI Integration
   GOOGLE_GENERATIVE_AI_API_KEY=your-google-ai-api-key
   ```

4. **Configure GitHub Secrets** (for automation)
   
   Add these secrets in your GitHub repository → Settings → Secrets:
   ```
   BACKUP_CRON_SECRET=your-custom-secret
   RESET_BOOKINGS_API_URL=https://yourdomain.com/api/reset-bookings
   ACTIVATE_SPORTS_API_URL=https://yourdomain.com/api/sports/activate
   DEACTIVATE_SPORTS_API_URL=https://yourdomain.com/api/sports/deactivate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   # or
   pnpm dev
   # or for Turbo mode
   npm run dev:turbo
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

### 🧪 Testing Automation Features

1. **Test API Endpoints**:
   ```bash
   # Test sports deactivation
   curl -X POST "http://localhost:3000/api/sports/deactivate?secret=YOUR_SECRET"
   
   # Test sports activation
   curl -X POST "http://localhost:3000/api/sports/activate?secret=YOUR_SECRET"

   # Test bookings reset and archival
   curl -X POST "http://localhost:3000/api/reset-bookings?secret=YOUR_SECRET"
   ```

2. **Test GitHub Actions**:
   - Go to Actions tab in your GitHub repository
   - Manually trigger workflows using "Run workflow" button
   - Check logs for success/failure status

### 📱 QR Scanner Setup

The QR scanner requires camera permissions:
- **HTTPS Required**: Camera access only works on HTTPS in production
- **Development**: Works on localhost without HTTPS
- **Mobile Testing**: Use ngrok or similar for mobile device testing

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow the project coding conventions and use meaningful commit messages.

## 💼 Project Status & Features

### 🎯 Current Status
This is a **production-ready** personal project developed by Subhajit Dolai, showcasing enterprise-level features and modern web development practices. The platform is actively used and continuously improved with new features.

### 🚀 Recent Major Updates
- **Automated Scheduling System**: GitHub Actions for institutional calendar management
- **Advanced User Type Validation**: Student/Faculty access control with "any" bypass option
- **Enhanced AI Assistant**: Google Gemini 2.0 Flash integration with real-time data
- **Professional QR Scanner**: Dual-mode scanning with IoT device support
- **Comprehensive Analytics**: Advanced dashboard with Recharts visualizations
- **User Access Control**: Complete ban/restriction system with appeal process
- **Real-time Features**: Enhanced connection management and live updates
- **Notifications Management**: Complete admin notification system with real-time delivery
- **AI Notification Integration**: Assistant awareness of system announcements for contextual support
- **Super Admin System**: Advanced profile management with dedicated super admin controls
- **Enhanced Database**: Super admin table with RLS policies and helper functions
- **Updated Automation**: Daily booking reset now runs at 10:30 PM IST for optimal timing

### 🔮 Future Roadmap
- **Mobile App**: React Native companion app
- **Advanced Analytics**: ML-powered usage predictions
- **Integration APIs**: Third-party calendar and notification systems
- **Multi-institution Support**: Scalable architecture for multiple organizations
- **Advanced Automation**: Holiday detection and special event scheduling
- **Enhanced Super Admin**: Advanced permission granularity and audit logging

## ✨ Acknowledgments

- **Created with ❤️** by [Subhajit Dolai](https://linkedin.com/in/subhajit-dolai) at MIT World Peace University
- **Powered by**: Next.js 15, Supabase, TypeScript, and modern web technologies
- **Special Recognition**: This project demonstrates enterprise-level development skills with production-ready features
- **Institution**: MIT World Peace University - Excellence in education and innovation
- **Tech Community**: Thanks to the amazing open-source community for the tools and inspiration

### 🎖️ Technical Achievements
- **Scalable Architecture**: Designed for 25,000+ concurrent users
- **Real-time Systems**: Advanced websocket integration with Supabase Realtime
- **Automation Excellence**: GitHub Actions for institutional schedule management
- **AI Integration**: Cutting-edge Google Gemini 2.0 Flash implementation
- **Security Best Practices**: Comprehensive access control and data protection
- **Performance Optimization**: Strategic database indexing and query optimization

---

<div align="center">
  <p><strong>Ready to transform your sports facility management?</strong></p>
  <p>🏸 <a href="https://courtside-xi.vercel.app">Experience Courtside Live</a> 🏊 ⚽</p>
  <p><em>The future of institutional sports booking is here!</em></p>
</div>
