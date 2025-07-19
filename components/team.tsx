import Image from 'next/image'
import React, { useState } from 'react'

const members = [
    {
        name: 'Subhajit Dolai',
        role: 'Creator & Developer',
        avatar: '/team/subhajit.webp',
        linkedin: 'https://www.linkedin.com/in/subhajit-dolai/',
    },
    {
        name: 'Om Jawanjal',
        role: 'Support & Coordination',
        avatar: '/team/om.webp',
        linkedin: 'https://www.linkedin.com/in/om-jawanjal-5606162a4/',
    },
    {
        name: 'Dr. Vaibhav Wagh',
        role: 'Director of Sports',
        avatar: '/team/vaibhav.webp',
        linkedin: 'https://www.linkedin.com/in/dr-vaibhav-balasaheb-wagh-phd-a1981a68/',
    },
    {
        name: 'Abhay Kachare',
        role: 'Asst. Director of Sports',
        avatar: '/team/abhay.webp',
        linkedin: 'https://www.linkedin.com/in/abhay-kachare/',
    },
]

// const leaders = [
//     {
//         name: 'Subhajit Dolai',
//         role: 'Full Stack developer',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
//     {
//         name: 'Subhajit Dolai',
//         role: 'System Design',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
//     {
//         name: 'Subhajit Dolai',
//         role: 'Devops',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
//     {
//         name: 'Subhajit Dolai',
//         role: 'Cyber security',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
// ]

// const workers = [
//     {
//         name: 'Subhajit Dolai',
//         role: 'Frontend Dev',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
//     {
//         name: 'Subhajit Dolai',
//         role: 'Backend Dev',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
//     {
//         name: 'Subhajit Dolai',
//         role: 'Frontend Dev',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
//     {
//         name: 'Subhajit Dolai',
//         role: 'Frontend Dev',
//         avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
//     },
// ]

export default function TeamSection() {
    // Track loading state for each image
    const [loadedImages, setLoadedImages] = useState(Array(members.length).fill(false))
    // const [loadedLeaders, setLoadedLeaders] = useState(Array(leaders.length).fill(false))
    // const [loadedWorkers, setLoadedWorkers] = useState(Array(workers.length).fill(false))

    const handleImageLoad = (index: number) => {
        setLoadedImages((prev) => {
            const updated = [...prev]
            updated[index] = true
            return updated
        })
    }
    // const handleLeaderImageLoad = (index: number) => {
    //     setLoadedLeaders((prev) => {
    //         const updated = [...prev]
    //         updated[index] = true
    //         return updated
    //     })
    // }
    // const handleWorkerImageLoad = (index: number) => {
    //     setLoadedWorkers((prev) => {
    //         const updated = [...prev]
    //         updated[index] = true
    //         return updated
    //     })
    // }

    return (
        <section id='team' className="py-12 md:py-32">
            <div className="mx-auto max-w-3xl px-8 lg:px-0">
                <h2 className="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl">Our team</h2>

                <div>
                    <h3 className="mb-6 text-lg font-medium">Core Team</h3>
                    <div className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
                        {members.map((member, index) => (
                            <a
                                key={index}
                                href={member.linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-90 transition-opacity"
                            >
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5 relative">
                                    {/* Skeleton loader */}
                                    {!loadedImages[index] && (
                                        <div className="absolute top-0 left-0 w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full z-10" />
                                    )}
                                    <Image
                                        src={member.avatar}
                                        alt={member.name}
                                        fill
                                        sizes="80px"
                                        className={`aspect-square rounded-full object-cover ${!loadedImages[index] ? 'invisible' : ''}`}
                                        onLoad={() => handleImageLoad(index)}
                                    />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* <div className="mt-6">
                    <h3 className="mb-6 text-lg font-medium">Engineering</h3>
                    <div data-rounded="full" className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
                        {leaders.map((member, index) => (
                            <div key={index}>
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5 relative">

                                    {!loadedLeaders[index] && (
                                        <div className="absolute top-0 left-0 w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full z-10" />
                                    )}
                                    <Image
                                        src={member.avatar}
                                        alt={member.name}
                                        fill
                                        className={`aspect-square rounded-full object-cover ${!loadedLeaders[index] ? 'invisible' : ''}`}
                                        onLoad={() => handleLeaderImageLoad(index)}
                                    />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="mb-6 text-lg font-medium">Marketing</h3>
                    <div data-rounded="full" className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
                        {workers.map((member, index) => (
                            <div key={index}>
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5 relative">

                                    {!loadedWorkers[index] && (
                                        <div className="absolute top-0 left-0 w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-full z-10" />
                                    )}
                                    <Image
                                        src={member.avatar}
                                        alt={member.name}
                                        fill
                                        className={`aspect-square rounded-full object-cover ${!loadedWorkers[index] ? 'invisible' : ''}`}
                                        onLoad={() => handleWorkerImageLoad(index)}
                                    />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div> */}
            </div>
        </section>
    )
}