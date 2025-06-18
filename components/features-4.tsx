import { Cpu, Fingerprint, Pencil, Settings2, Sparkles, Zap } from 'lucide-react';

export default function Features() {
    return (
        <section className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Simplify Your Sports Bookings</h2>
                    <p>Experience seamless and secure booking for all your favorite sports facilities.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Real-time Updates</h3>
                        </div>
                        <p className="text-sm">Get instant availability updates for sports facilities using Supabase Realtime.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Cpu className="size-4" />
                            <h3 className="text-sm font-medium">Smart Booking</h3>
                        </div>
                        <p className="text-sm">Book sports slots with intelligent filtering and visual spot selection.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Fingerprint className="size-4" />

                            <h3 className="text-sm font-medium">Secure Access</h3>
                        </div>
                        <p className="text-sm">Enjoy secure authentication and role-based access control for all users.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Pencil className="size-4" />

                            <h3 className="text-sm font-medium">Profile Management</h3>
                        </div>
                        <p className="text-sm">Easily manage your profile and view booking history with detailed insights.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Settings2 className="size-4" />

                            <h3 className="text-sm font-medium">Comprehensive Dashboard</h3>
                        </div>
                        <p className="text-sm">Access a personal dashboard with analytics and booking insights.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />

                            <h3 className="text-sm font-medium">AI Assistance</h3>
                        </div>
                        <p className="text-sm">Get smart recommendations and instant help with Courtside AI.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
