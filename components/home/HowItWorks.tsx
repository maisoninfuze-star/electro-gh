import { SectionHeader } from '@/components/ui/SectionHeader';
import { Reveal } from '@/components/ui/Reveal';
import type { Dictionary } from '@/lib/i18n/dictionaries';

/**
 * HOW IT WORKS
 * ============
 * Three steps, stated in the store's actual process.
 *
 * Step 3 says "we help you organise the next step" and deliberately names NO
 * delivery window. No delivery timeline has been confirmed, and a promised
 * "next-day delivery" that the store cannot always meet is the fastest way to
 * turn a new website into a complaints channel.
 */
export function HowItWorks({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-y border-line bg-surface py-20 sm:py-28">
      <div className="container-page">
        <SectionHeader eyebrow={dict.howItWorks.eyebrow} title={dict.howItWorks.title} />

        <ol className="mt-14 grid gap-10 sm:gap-8 lg:grid-cols-3">
          {dict.howItWorks.steps.map((step, i) => (
            <Reveal key={step.n} delay={i * 100} as="li" className="relative">
              <div className="flex flex-col gap-4 border-t border-ink pt-6">
                <span className="tnum font-display text-4xl font-light leading-none tracking-[-0.03em] text-ink sm:text-5xl">
                  {step.n}
                </span>
                <h3 className="font-display text-lg font-medium uppercase tracking-[0.06em] text-ink">
                  {step.title}
                </h3>
                <p className="max-w-sm text-sm leading-relaxed text-ink-2">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
