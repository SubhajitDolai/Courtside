# Courtside

<div align="center">

![Courtside Logo](/public/logo-light.webp)

**A modern sports facility booking platform for educational institutions**

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-darkgreen)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-blue)](https://tailwindcss.com/)

[Demo](https://courtside-xi.vercel.app) • [Report Bug](https://github.com/SubhajitDolai/Courtside/issues) • [Request Feature](https://github.com/SubhajitDolai/Courtside/issues)

</div>

## 📋 Overview

Courtside is a comprehensive full-stack web application designed to streamline the booking of sports facilities such as badminton courts, swimming pools, and other sports venues. Built specifically for educational institutions and communities with shared sports infrastructure, Courtside emphasizes:

- **User-friendly experience** with intuitive booking flows
- **Real-time availability** updates with automatic refresh
- **Role-based access control** for users and administrators
- **Smart seat selection** with gender and user-type filtering
- **Comprehensive admin dashboard** for facility management

## ✨ Features

### For Users
- 🔐 **Secure Authentication** - Sign up & login with Supabase Auth
- 👤 **Profile Management** - First-time user onboarding flow
- 🎟️ **Intuitive Booking** - Book sports slots with seat selection
- ⏱️ **Real-time Updates** - Slot availability refreshes every 5 seconds
- 🔍 **Smart Filtering** - Bookings filtered by gender and user type
- 📋 **Booking History** - View past and current bookings
- ❌ **Easy Cancellation** - Cancel bookings with appropriate restrictions
- 📱 **Modern UI/UX** - Responsive design with dark/light mode

### For Administrators
- 🔑 **Role-based Access** - Admin panel access via profile role setting
- 📊 **Booking Management** - View all bookings with comprehensive details
- ✅ **Attendance Tracking** - Check-in/check-out functionality with status updates
- 🗄️ **Historical Data** - Access to booking history with archived data
- ⚙️ **Facility Management** - Control sports and slot configurations
- 📄 **Pagination** - Efficiently navigate through booking records

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| Frontend | Next.js 15 (App Router) |
| Backend | Supabase (Database + Auth) |
| Styling | Tailwind CSS + Shadcn/ui |
| Icons | Lucide React |
| Authentication | Supabase Auth |
| Database | Supabase PostgreSQL |
| Real-time Updates | Polling (5-second interval) |

## 🗂️ Project Structure

```
/app
  /(auth)              # Auth pages
    /login                # login logic
    /signup               # signup logic
    /forgot               # forgot-password logic
    /reset                # reset-password logic
  /(main)              # User pages
    /sports/[id]/slots    # Dynamic slot pages
    /my-bookings          # User booking page
    /profile              # User profile page
  /admin               # Admin dashboard
    /bookings             # Bookings page
    /slots                # Slots page
    /sports               # Sports page
/components            # Reusable UI components
/utils/supabase        # Supabase client setup
/components/ui         # Shadcn UI wrappers
```

## 🧮 Database Schema

### Core Tables

#### `profiles`
- `id` (UUID, PK, matches auth.uid)
- `first_name`, `last_name`
- `gender` ('male', 'female', 'other')
- `user_type` ('student', 'faculty', etc.)
- `role` ('user', 'admin', 'ban')

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

## 📚 Core Logic

### Booking System
- Seat availability is calculated dynamically per slot
- Unique seat numbers are assigned during booking
- Slots are filtered based on gender and user type compatibility
- Cancellation is allowed up to 30 minutes before slot start time
- System automatically filters out expired slots

### Authentication
- Implements Supabase Auth (email/password)
- Sessions are persisted via cookies
- First-time users are redirected to complete their profile

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn
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
   yarn install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the project root:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.
<!-- 
## 📸 Screenshots

<div align="center">
  <img src="https://via.placeholder.com/400x200?text=Booking+Interface" alt="Booking Interface" width="45%" />
  <img src="https://via.placeholder.com/400x200?text=Admin+Dashboard" alt="Admin Dashboard" width="45%" />
</div> -->

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please follow the project coding conventions and use meaningful commit messages.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Acknowledgments

- Built with ❤️ by Subhajit at MIT World Peace University
- Special thanks to all mentors

---

<div align="center">
  <p>Ready to book your game? Head over to <a href="https://courtside-xi.vercel.app">Courtside</a> and lock in your spot! 🏸🏊⚽</p>
</div>
