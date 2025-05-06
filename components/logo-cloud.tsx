import { InfiniteSlider } from '@/components/ui/infinite-slider'
import { ProgressiveBlur } from '@/components/ui/progressive-blur'
import Image from 'next/image'

export default function LogoCloud() {
    return (
        <section className="bg-background overflow-hidden py-16">
            <div className="group relative m-auto max-w-7xl px-6">
                <div className="flex flex-col items-center md:flex-row">
                    <div className="md:max-w-44 md:border-r md:pr-6">
                        <p className="text-end text-sm">Available games</p>
                    </div>
                    <div className="relative py-6 md:w-[calc(100%-11rem)]">
                        <InfiniteSlider
                            speedOnHover={20}
                            speed={40}
                            gap={112}>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/badminton.png"
                                    alt="Badminton Logo"
                                    height="20"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/badminton.png"
                                    alt="Badminton Logo"
                                    height={20}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/swimming.png"
                                    alt="Swimming Logo"
                                    height="16"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/swimming.png"
                                    alt="Swimming Logo"
                                    height={16}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/wrestling.png"
                                    alt="Wrestling Logo"
                                    height="16"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/wrestling.png"
                                    alt="Wrestling Logo"
                                    height={16}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/table-tennis.png"
                                    alt="Table Tennis Logo"
                                    height="20"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/table-tennis.png"
                                    alt="Table Tennis Logo"
                                    height={20}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/football.png"
                                    alt="Football Logo"
                                    height="20"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/football.png"
                                    alt="Football Logo"
                                    height={20}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/cricket.png"
                                    alt="Cricket Logo"
                                    height="16"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/cricket.png"
                                    alt="Cricket Logo"
                                    height={16}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/table-football.png"
                                    alt="Table Football Logo"
                                    height="28"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/table-football.png"
                                    alt="Table Football Logo"
                                    height={28}
                                    width={0}
                                />
                            </div>
                            <div className="flex">
                                {/* <img
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/carrom.png"
                                    alt="Carror Logo"
                                    height="24"
                                    width="auto"
                                /> */}
                                <Image
                                    className="mx-auto h-10 w-fit dark:invert"
                                    src="/sports_png/carrom.png"
                                    alt="Carror Logo"
                                    height={24}
                                    width={0}
                                />
                            </div>
                        </InfiniteSlider>

                        <div className="bg-linear-to-r from-background absolute inset-y-0 left-0 w-20"></div>
                        <div className="bg-linear-to-l from-background absolute inset-y-0 right-0 w-20"></div>
                        <ProgressiveBlur
                            className="pointer-events-none absolute left-0 top-0 h-full w-20"
                            direction="left"
                            blurIntensity={1}
                        />
                        <ProgressiveBlur
                            className="pointer-events-none absolute right-0 top-0 h-full w-20"
                            direction="right"
                            blurIntensity={1}
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}
