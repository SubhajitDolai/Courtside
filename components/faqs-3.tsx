'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { DynamicIcon, type IconName } from 'lucide-react/dynamic'
import Link from 'next/link'

type FAQItem = {
    id: string
    icon: IconName
    question: string
    answer: string
}

export default function FAQsThree() {
    const faqItems: FAQItem[] = [
        {
            id: 'item-1',
            icon: 'circle-help',
            question: 'How can I book a sports facility at MIT-WPU?',
            answer: "Booking is simple — just log in with your MIT-WPU email, complete your profile, and choose an available slot from the booking page. You'll receive a confirmation instantly.",
        },
        {
            id: 'item-2',
            icon: 'ban',
            question: 'Can I modify or cancel my booking later?',
            answer: 'Yes, bookings can be modified or canceled up to 2 hours before the scheduled time. Visit your dashboard to manage your existing reservations quickly and easily.',
        },
        {
            id: 'item-3',
            icon: 'user-check',
            question: 'Are there any eligibility rules for using the facilities?',
            answer: 'Facilities are open to all MIT-WPU students with a valid ID. Some activities, like swimming and wrestling, require a signed consent form before participation.',
        },
        {
            id: 'item-4',
            icon: 'dumbbell',
            question: 'What equipment is provided, and what should I bring?',
            answer: 'All users are required to bring their own equipment for every activity. Please ensure you have the necessary gear and follow the dress code for each facility.',
        },
        {
            id: 'item-5',
            icon: 'file-user',
            question: 'Do I need to fill out consent forms before using the sports complex?',
            answer: 'Yes, for certain activities, a signed consent form is mandatory. Forms can be downloaded from our portal and submitted during your first visit.',
        },
    ]

    return (
        <section className="bg-muted dark:bg-background py-20">
            <div className="mx-auto max-w-5xl px-4 md:px-6">
                <div className="flex flex-col gap-10 md:flex-row md:gap-16">
                    <div className="md:w-1/3">
                        <div className="sticky top-20">
                            <h2 className="mt-4 text-3xl font-bold">Frequently Asked Questions</h2>
                            <p className="text-muted-foreground mt-4">
                                Can&apos;t find what you&apos;re looking for? Contact our{' '}
                                <Link
                                    href="#"
                                    className="text-primary font-medium hover:underline">
                                    support team
                                </Link>
                            </p>
                        </div>
                    </div>
                    <div className="md:w-2/3">
                        <Accordion
                            type="single"
                            collapsible
                            className="w-full space-y-2">
                            {faqItems.map((item) => (
                                <AccordionItem
                                    key={item.id}
                                    value={item.id}
                                    className="bg-background shadow-xs rounded-lg border px-4 last:border-b">
                                    <AccordionTrigger className="cursor-pointer items-center py-5 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="flex size-6">
                                                <DynamicIcon
                                                    name={item.icon}
                                                    className="m-auto size-4"
                                                />
                                            </div>
                                            <span className="text-base">{item.question}</span>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="pb-5">
                                        <div className="px-9">
                                            <p className="text-base">{item.answer}</p>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </div>
            </div>
        </section>
    )
}
