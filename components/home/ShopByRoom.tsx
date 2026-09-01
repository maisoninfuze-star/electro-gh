import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '@/components/ui/Reveal';
import { RevealLines } from '@/components/ui/Reveal';
import { categoriesInRoom } from '@/lib/catalog/categories';
import { href, type Locale } from '@/lib/i18n/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';
import type { Room } from '@/lib/catalog/types';

/**
 * SHOP BY ROOM
 * ============
 * Aspirational rather than transactional: two large interior scenes that let a
 * visitor start from "my kitchen" instead of "36-inch french door".
 *
 * Each panel also lists the categories that belong to that room, which turns a
 * mood image into a real navigation surface — the lifestyle photograph earns
 * its screen space by carrying links.
 */
export function ShopByRoom({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="py-20 sm:py-28">
      <div className="container-page">
        <Reveal>
          <p className="mb-10 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-ink-3">
            {dict.rooms.eyebrow}
          </p>
        </Reveal>

        <div className="grid gap-3 lg:grid-cols-2">
          <RoomPanel
            room="kitchen"
            locale={locale}
            image="/media/room-kitchen.webp"
            imageAlt="Cuisine moderne avec cuisinière et lave-vaisselle en acier inoxydable"
            title={dict.rooms.kitchen.title}
            body={dict.rooms.kitchen.body}
            cta={dict.rooms.kitchen.cta}
            ctaHref={href(locale, 'shop')}
          />
          <RoomPanel
            room="laundry"
            locale={locale}
            image="/media/room-laundry.webp"
            imageAlt="Buanderie moderne avec laveuse et sécheuse frontales assorties"
            title={dict.rooms.laundry.title}
            body={dict.rooms.laundry.body}
            cta={dict.rooms.laundry.cta}
            ctaHref={href(locale, 'laundrySets')}
          />
        </div>
      </div>
    </section>
  );
}

function RoomPanel({
  room,
  locale,
  image,
  imageAlt,
  title,
  body,
  cta,
  ctaHref,
}: {
  room: Room;
  locale: Locale;
  image: string;
  imageAlt: string;
  title: string;
  body: string;
  cta: string;
  ctaHref: string;
}) {
  const categories = categoriesInRoom(room);

  return (
    <Reveal className="group relative flex flex-col overflow-hidden bg-surface-2">
      <div className="relative aspect-[4/3] w-full overflow-hidden lg:aspect-[5/4]">
        <Image
          src={image}
          alt={imageAlt}
          fill
          sizes="(max-width: 1023px) 100vw, 46vw"
          className="object-cover transition-transform duration-[1100ms] ease-[var(--ease-out-expo)] group-hover:scale-[1.04]"
        />
      </div>

      <div className="flex flex-1 flex-col bg-canvas p-6 sm:p-9">
        <h3 className="font-display text-display-3 font-medium text-ink">
          <RevealLines lines={[title]} />
        </h3>
        <p className="mt-4 max-w-md text-lead text-ink-2">{body}</p>

        <ul className="mt-7 flex flex-wrap gap-2">
          {categories.map((c) => (
            <li key={c.id}>
              <Link
                href={href(locale, c.route)}
                className="inline-flex min-h-11 items-center rounded-full border border-line px-4 text-[0.8125rem] text-ink-2 transition-colors duration-300 hover:border-ink hover:text-ink"
              >
                {c.label[locale]}
              </Link>
            </li>
          ))}
        </ul>

        <Link
          href={ctaHref}
          className="group/cta mt-8 inline-flex min-h-11 items-center gap-2 self-start text-sm font-medium text-ink transition-colors duration-300 hover:text-accent"
        >
          {cta}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-1"
            strokeWidth={1.75}
          />
        </Link>
      </div>
    </Reveal>
  );
}
