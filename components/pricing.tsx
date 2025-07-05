
import { Check } from 'lucide-react'
import Image from 'next/image'
import BookNowButton from '@/components/bookNowBtn'

export default function Pricing() {
    return (
        <div id="pricing" className="relative py-16 md:py-32">
            <div className="mx-auto max-w-5xl px-6">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-bold md:text-4xl lg:text-5xl">Fair & Affordable Pricing</h2>
                </div>
                <div className="mt-8 md:mt-20">
                    <div className="bg-card relative rounded-3xl border shadow-2xl shadow-zinc-950/5">
                        <div className="grid items-center gap-12 divide-y p-12 md:grid-cols-2 md:divide-x md:divide-y-0">
                            <div className="pb-12 text-center md:pb-0 md:pr-12">
                                <h3 className="text-2xl font-semibold">Per Slot Booking</h3>
                                <p className="mt-2 text-lg">For all sports facilities</p>
                                <span className="mb-6 mt-12 inline-block text-6xl font-bold">
                                    <span className="text-4xl">₹</span>100
                                </span>

                                <div className="flex justify-center">
                                    <BookNowButton />
                                </div>

                                <p className="text-muted-foreground mt-12 text-sm">Includes: Real-time booking, QR check-in, AI assistance, and access to all sports facilities</p>
                            </div>
                            <div className="relative">
                                <ul
                                    role="list"
                                    className="space-y-4">
                                    {['Real-time slot availability', 'Interactive seat selection', 'AI-powered booking assistance', 'Professional QR check-in system'].map((item, index) => (
                                        <li
                                            key={index}
                                            className="flex items-center gap-2">
                                            <Check className="size-3" />
                                            <span>{item}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="text-muted-foreground mt-6 text-sm">Perfect for students and faculty. Book any time slot across all available sports facilities:</p>
                                <div className="mt-12 flex flex-wrap items-center justify-between gap-6">
                                    <Image
                                        className="h-10 w-fit dark:invert"
                                        src="/sports_png/swimming.webp"
                                        alt="Swimming Logo"
                                        height={20}
                                        width={40}
                                    />
                                    <Image
                                        className="h-10 w-fit dark:invert"
                                        src="/sports_png/badminton.webp"
                                        alt="Badminton Logo"
                                        height={20}
                                        width={40}
                                    />
                                    <Image
                                        className="h-10 w-fit dark:invert"
                                        src="/sports_png/table-tennis.webp"
                                        alt="TT Logo"
                                        height={20}
                                        width={40}
                                    />
                                    <Image
                                        className="h-10 w-fit dark:invert"
                                        src="/sports_png/wrestling.webp"
                                        alt="Wrestling Logo"
                                        height={20}
                                        width={40}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
