import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ContentSection() {
    return (
        <section className="py-16 md:py-32">
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-12">
                <Image
                    src="/mit.webp"
                    alt="team image"
                    width={1489}
                    height={575}
                    className="rounded-[var(--radius)] grayscale hover:grayscale-0 transition-all duration-500 w-full h-auto"
                />

                <div className="grid gap-6 md:grid-cols-2 md:gap-12">
                    <h2 className="text-4xl font-medium">Dronacharya: Where Sports and Community Thrive at MIT-WPU</h2>
                    <div className="space-y-6">
                        <p>Dronacharya is more than a sports complex, it&apos;s a hub for fostering growth, excellence, and camaraderie among students and athletes with world-class facilities and opportunities.</p>

                        <Button asChild variant="secondary" size="sm" className="gap-1 pr-1.5">
                            <Link href="https://mitwpu.edu.in/life-wpu/sports">
                                <span>Learn More</span>
                                <ChevronRight className="size-2" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    )
}
