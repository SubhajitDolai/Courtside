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
            icon: 'calendar',
            question: 'When do bookings open?',
            answer: 'Bookings open every day at 12:00 AM. Make sure to reserve your spot early to secure availability.',
        },
        {
            id: 'item-2',
            icon: 'x-circle',
            question: 'What is the cancellation policy?',
            answer: 'Bookings can be canceled up to 30 minutes before the scheduled time. Cancellations after this period are not allowed.',
        },
        {
            id: 'item-3',
            icon: 'shield-check',
            question: 'Are there safety measures in place?',
            answer: 'Yes, all facilities are regularly sanitized, and safety protocols are strictly followed. Users are encouraged to adhere to the guidelines.',
        },
        {
            id: 'item-4',
            icon: 'id-card',
            question: 'Do I need to bring my ID card?',
            answer: 'Yes, a valid MIT-WPU ID card is required to access the sports facilities. Please ensure you carry it during your visit.',
        },
        {
            id: 'item-5',
            icon: 'briefcase',
            question: 'Is equipment provided, or should I bring my own?',
            answer: 'For most activities, users are required to bring their own equipment. However, some indoor games may have equipment available on-site.',
        },
        {
            id: 'item-6',
            icon: 'info',
            question: 'Where can I find more information?',
            answer: 'Visit our support page or contact our team for detailed information about bookings, facilities, and policies.',
        },
    ]

    return (
        <section id='faq' className="dark:bg-background py-20">
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
