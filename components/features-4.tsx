import { MousePointer, Smartphone, QrCode, BarChart3, Sparkles, Zap, Bell, Calendar, Users } from 'lucide-react';

export default function Features() {
    return (
        <section id='features' className="py-12 md:py-20">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
                <div className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12">
                    <h2 className="text-balance text-4xl font-medium lg:text-5xl">Simplify Your Sports Bookings</h2>
                    <p>Experience seamless and secure booking for all your favorite sports facilities.</p>
                </div>

                <div className="relative mx-auto grid max-w-4xl divide-x divide-y border *:p-12 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="size-4" />
                            <h3 className="text-sm font-medium">AI Assistant</h3>
                        </div>
                        <p className="text-sm">Your smart assistant that handles everything. Simply ask, and it gets done.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Zap className="size-4" />
                            <h3 className="text-sm font-medium">Real-Time Updates</h3>
                        </div>
                        <p className="text-sm">Everything happens instantly across the entire app, watch slots fill up in real time.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <MousePointer className="size-4" />
                            <h3 className="text-sm font-medium">Visual Spot Selection</h3>
                        </div>
                        <p className="text-sm">Pick your exact seat or spot by clicking on an interactive map to see exactly where you&apos;ll be.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Smartphone className="size-3" />
                            <h3 className="text-sm font-medium">Mobile-First Design</h3>
                        </div>
                        <p className="text-sm">Works perfectly on phone, tablet, or computer with smooth animations & themes.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <QrCode className="size-4" />
                            <h3 className="text-sm font-medium">QR Check-In</h3>
                        </div>
                        <p className="text-sm">Scan QR codes when you arrive and when you leave to track your complete session.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="size-4" />
                            <h3 className="text-sm font-medium">Analytics Dashboard</h3>
                        </div>
                        <p className="text-sm">View facility-wide analytics with usage patterns, peak times, and availability trends.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Bell className="size-4" />
                            <h3 className="text-sm font-medium">Live Notifications</h3>
                        </div>
                        <p className="text-sm">Stay informed with instant system announcements and important updates.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="size-4" />
                            <h3 className="text-sm font-medium">Easy Cancellation</h3>
                        </div>
                        <p className="text-sm">Cancel your bookings easily when plans change with clear cancellation rules.</p>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Users className="size-4" />
                            <h3 className="text-sm font-medium">Role-Based Access</h3>
                        </div>
                        <p className="text-sm">Smart slot filtering based on your user type and gender to show only relevant bookings.</p>
                    </div>
                </div>
            </div>
        </section>
    );
}
