import Link from 'next/link'
import Image from 'next/image'

const sports = [
    {
        name: 'Swimming',
        avatar: '/sports_img/swimming.webp',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Badminton',
        avatar: '/sports_img/badminton.webp',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Wrestling',
        avatar: '/sports_img/wrestling.webp',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Table Tennis',
        avatar: '/sports_img/tableTennis.webp',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Foosball',
        avatar: '/sports_img/foosball.webp',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Chess',
        avatar: '/sports_img/chess.webp',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
]

export default function AboutSports() {
    return (
        <section className="bg-gray-50 py-16 md:py-32 dark:bg-transparent">
            <div className="mx-auto max-w-5xl border-t px-6">
                <span className="text-caption -ml-6 -mt-3.5 block w-max bg-gray-50 px-6 dark:bg-gray-950">Browse Sports Facilities</span>
                <div className="mt-12 gap-4 sm:grid sm:grid-cols-2 md:mt-24">
                    <div className="sm:w-2/5">
                        <h2 className="text-3xl font-bold sm:text-4xl">Explore Our Sports Facilities</h2>
                    </div>
                    <div className="mt-6 sm:mt-0">
                        <p>Designed around our students, every space evolves to fit their needs and routines. From seamless access to everyday comfort, each facility is built to enhance their experience and grow with them.</p>
                    </div>
                </div>
                <div className="mt-12 md:mt-24">
                    <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                        {sports.map((sport, index) => (
                            <div key={index} className="group overflow-hidden focus:outline-none" tabIndex={0}>
                                <Image
                                    className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl group-focus:grayscale-0 group-focus:h-[22.5rem] group-focus:rounded-xl"
                                    src={sport.avatar}
                                    alt="team sport"
                                    width={826}
                                    height={1239}
                                />
                                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                                    <div className="flex justify-between">
                                        <h3 className="text-title text-base font-medium transition-all duration-500 group-hover:tracking-wider group-focus:tracking-wider">{sport.name}</h3>
                                        <Link href={sport.link} className="group-hover:text-primary-600 group-focus:text-primary-600 dark:group-hover:text-primary-400 dark:group-focus:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100 group-focus:translate-y-0 group-focus:opacity-100">
                                            {' '}
                                            Learn more
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}