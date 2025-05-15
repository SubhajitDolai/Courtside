'use client';

import {
  MorphingPopover,
  MorphingPopoverTrigger,
  MorphingPopoverContent,
} from '@/components/motion-primitives/morphing-popover';
import { motion } from 'motion/react';
import { useId, useState } from 'react';
import { ArrowLeftIcon } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

export function MorphingPopoverTextarea() {
  const uniqueId = useId();
  const [note, setNote] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setNote('');
    setIsOpen(false);
  };

  return (
    <MorphingPopover
      transition={{
        type: 'spring',
        bounce: 0.05,
        duration: 0.3,
      }}
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <MorphingPopoverTrigger className='flex h-9 items-center rounded-lg border border-neutral-950/10 bg-white px-3 text-neutral-950 dark:border-neutral-50/10 dark:bg-neutral-700 dark:text-neutral-50'>
        <motion.span layoutId={`popover-label-${uniqueId}`} className='text-sm'>
          Give Feedback
        </motion.span>
      </MorphingPopoverTrigger>
      <MorphingPopoverContent className='rounded-xl border border-neutral-950/10 bg-white p-0 shadow-[0_9px_9px_0px_rgba(0,0,0,0.01),_0_2px_5px_0px_rgba(0,0,0,0.06)] dark:bg-neutral-700'>
        <div className='h-[200px] w-[364px]'>
          <form
            className='flex h-full flex-col'
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <motion.span
              layoutId={`popover-label-${uniqueId}`}
              aria-hidden='true'
              style={{
                opacity: note ? 0 : 1,
              }}
              className='absolute top-3 left-4 text-sm text-neutral-500 select-none dark:text-neutral-400'
            >
              Add Note
            </motion.span>
            <textarea
              className='h-full w-full resize-none rounded-md bg-transparent px-4 py-3 text-sm outline-hidden'
              autoFocus
              onChange={(e) => setNote(e.target.value)}
            />
            <div key='close' className='flex justify-between py-3 pr-4 pl-2'>
              <button
                type='button'
                className='flex items-center rounded-lg bg-white px-2 py-1 text-sm text-neutral-950 hover:bg-neutral-100 dark:bg-neutral-700 dark:text-neutral-50 dark:hover:bg-neutral-600'
                onClick={closeMenu}
                aria-label='Close popover'
              >
                <ArrowLeftIcon
                  size={16}
                  className='text-neutral-900 dark:text-neutral-100'
                />
              </button>
              <button
                className='relative ml-1 flex h-8 shrink-0 scale-100 appearance-none items-center justify-center rounded-lg border border-neutral-950/10 bg-transparent px-2 text-sm text-neutral-500 transition-colors select-none hover:bg-neutral-100 hover:text-neutral-800 focus-visible:ring-2 active:scale-[0.98] dark:border-neutral-50/10 dark:text-neutral-50 dark:hover:bg-neutral-800'
                type='submit'
                aria-label='Submit note'
                onClick={async () => {
                  const supabase = createClient();
                  const { data: { user }, error: userError } = await supabase.auth.getUser();
                  if (userError || !user) {
                    toast.error('You must be logged in to submit feedback.');
                    return;
                  }

                  if (!note.trim()) {
                    toast.error('Note cannot be empty.');
                    return;
                  }

                  // Fetch user email from profiles
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('email')
                    .eq('id', user.id)
                    .single();

                  if (profileError || !profile) {
                    toast.error('Could not fetch user email');
                    return;
                  }

                  // Insert feedback with email
                  const { error } = await supabase.from('user_feedback').insert({
                    user_id: user.id,
                    note: note.trim(),
                    email: profile.email,
                  });

                  if (error) {
                    toast.error(`Error submitting feedback: ${error.message}`);
                  } else {
                    toast.success('Feedback submitted successfully!');
                    closeMenu();
                  }
                }}
              >
                Submit
              </button>
            </div>
          </form>
        </div>
      </MorphingPopoverContent>
    </MorphingPopover>
  );
}
