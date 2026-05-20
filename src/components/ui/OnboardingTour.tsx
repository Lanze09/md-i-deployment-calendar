import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';
import { Button } from './Button';

export interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    title: 'Welcome to the MD&I Deployment Calendar',
    body: 'Navigate months and click any day to see deployments. Use the arrows above the calendar, or press ← / → on your keyboard.',
  },
  {
    title: 'Add a deployment',
    body: 'Click the "New" button in the header — or just press N — to schedule a new deployment to any environment.',
  },
  {
    title: 'Filter what you see',
    body: 'Open the sidebar to filter by team, environment, status, or risk. Filters live in the URL so you can share filtered views.',
  },
  {
    title: 'Make it yours',
    body: 'Toggle dark/light mode any time. Press ? to see all keyboard shortcuts, and Ctrl+P to print the calendar.',
  },
];

export function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  const next = () => {
    if (step + 1 >= STEPS.length) {
      onClose();
    } else {
      setStep((s) => s + 1);
    }
  };

  const skip = () => {
    setStep(0);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[55] flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          role="dialog"
          aria-modal="true"
          aria-label="Onboarding"
        >
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 280, damping: 24 }}
            className="w-full max-w-md rounded-card bg-surface-light-primary p-6 shadow-2xl dark:bg-surface-dark-secondary"
          >
            <div className="mb-3 flex items-center gap-2">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={
                    i === step
                      ? 'h-1.5 w-6 rounded-full bg-accenture-400'
                      : 'h-1.5 w-1.5 rounded-full bg-slate-300 dark:bg-slate-600'
                  }
                />
              ))}
            </div>
            <h3 className="font-display text-lg font-semibold text-slate-900 dark:text-slate-100">
              {current.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{current.body}</p>
            <div className="mt-5 flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={skip}>
                Skip tour
              </Button>
              <Button onClick={next} size="sm">
                {step + 1 === STEPS.length ? 'Get started' : 'Next'}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
