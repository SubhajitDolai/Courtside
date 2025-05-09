// Do a quality photoshoot upload the images on plexel and place the link here

const members = [
    {
        name: 'Subhajit Dolai',
        role: 'Creator',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'UI UX',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Frontend Dev',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Backend Dev',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
]

const leaders = [
    {
        name: 'Subhajit Dolai',
        role: 'System Design',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Devops',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Cyber security',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Full Stack developer',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
]

const workers = [
    {
        name: 'Subhajit Dolai',
        role: 'Creator',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Frontend Dev',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Frontend Dev',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
    {
        name: 'Subhajit Dolai',
        role: 'Backend Dev',
        avatar: 'https://media.licdn.com/dms/image/v2/D4D03AQEtFjh7U8JtWg/profile-displayphoto-shrink_800_800/B4DZTRnWotHAAc-/0/1738683543453?e=1752105600&v=beta&t=U72k5Te_vxEaffn2suTLBU8gdA_n1kE4pdfmqjDKkFo',
    },
]

export default function TeamSection() {
    return (
        <section className="py-12 md:py-32">
            <div className="mx-auto max-w-3xl px-8 lg:px-0">
                <h2 className="mb-8 text-4xl font-bold md:mb-16 lg:text-5xl">Our team</h2>

                <div>
                    <h3 className="mb-6 text-lg font-medium">Leadership</h3>
                    <div className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
                        {members.map((member, index) => (
                            <div key={index}>
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                    <img className="aspect-square rounded-full object-cover" src={member.avatar} alt={member.name} height="460" width="460" loading="lazy" />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-6">
                    <h3 className="mb-6 text-lg font-medium">Engineering</h3>
                    <div data-rounded="full" className="grid grid-cols-2 gap-4 border-t py-6 md:grid-cols-4">
                        {leaders.map((member, index) => (
                            <div key={index}>
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                    <img className="aspect-square rounded-full object-cover" src={member.avatar} alt={member.name} height="460" width="460" loading="lazy" />
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
                                <div className="bg-background size-20 rounded-full border p-0.5 shadow shadow-zinc-950/5">
                                    <img className="aspect-square rounded-full object-cover" src={member.avatar} alt={member.name} height="460" width="460" loading="lazy" />
                                </div>
                                <span className="mt-2 block text-sm">{member.name}</span>
                                <span className="text-muted-foreground block text-xs">{member.role}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}
