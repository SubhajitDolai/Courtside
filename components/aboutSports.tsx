
import Link from 'next/link'
import Image from 'next/image'

const sports = [
    {
        name: 'Swimming',
        // role: 'Founder - CEO',
        avatar: '/sports_img/swimming.jpg',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Badminton',
        // role: 'Co-Founder - CTO',
        avatar: '/sports_img/badminton.jpg',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Wrestling',
        // role: 'Sales Manager',
        avatar: '/sports_img/wrestling.jpeg',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Table Tennis',
        // role: 'UX Engeneer',
        avatar: '/sports_img/tableTennis.jpeg',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Foosball',
        // role: 'Interaction Designer',
        avatar: '/sports_img/foosball.jpeg',
        link: 'https://mitwpu.edu.in/life-wpu/sports',
    },
    {
        name: 'Chess',
        // role: 'Visual Designer',
        avatar: '/sports_img/chess.jpeg',
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
                            <div key={index} className="group overflow-hidden">
                                {/* <img className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl" src={sport.avatar} alt="team sport" width="826" height="1239" /> */}
                                <Image
                                    className="h-96 w-full rounded-md object-cover object-top grayscale transition-all duration-500 hover:grayscale-0 group-hover:h-[22.5rem] group-hover:rounded-xl"
                                    src={sport.avatar}
                                    alt="team sport"
                                    width={826}
                                    height={1239}
                                />
                                <div className="px-2 pt-2 sm:pb-0 sm:pt-4">
                                    <div className="flex justify-between">
                                        <h3 className="text-title text-base font-medium transition-all duration-500 group-hover:tracking-wider">{sport.name}</h3>
                                        {/* <span className="text-xs">_0{index + 1}</span> */}
                                        <Link href={sport.link} className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100">
                                            {' '}
                                            Learn more
                                        </Link>
                                    </div>
                                    {/* <div className="mt-1 flex items-center justify-between">
                                        <span className="text-muted-foreground inline-block translate-y-6 text-sm opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">{sport.role}</span>
                                        <Link href={sport.link} className="group-hover:text-primary-600 dark:group-hover:text-primary-400 inline-block translate-y-8 text-sm tracking-wide opacity-0 transition-all duration-500 hover:underline group-hover:translate-y-0 group-hover:opacity-100">
                                            {' '}
                                            Learn more
                                        </Link>
                                    </div> */}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
