import BookNowButton from './bookNowBtn';
import { GlowEffectButton } from './glowEffectButton';

export default function CallToAction() {
    return (
        <section className="py-16">
            <div className="mx-auto max-w-5xl rounded-3xl border px-6 py-12 md:py-20 lg:py-32">
                <div className="text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">Ready to Book Your Spot?</h2>
                    <p className="mt-4">Experience seamless bookings and real-time updates for all your favorite sports facilities.</p>

                    <div className="mt-12 flex flex-col items-center gap-4 md:flex-row justify-center">
                        <div className="bg-foreground/10 rounded-[calc(var(--radius-xl)+0.125rem)] border p-0.5">
                            <BookNowButton />
                        </div>
                        <GlowEffectButton />
                    </div>
                </div>
            </div>
        </section>
    );
}
