import Image from 'next/image';
import Link from 'next/link';
import { href } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';
import { cx } from '@/lib/format';

/**
 * THE OFFICIAL LOGO
 * =================
 * public/brand/logo.png is the red "ÉLECTROMÉNAGERS GH · ACHAT & REVENTE" tag
 * cut from the owner's business card (brand/business-card.png), exterior made
 * transparent, nothing redrawn. 512×279, which serves the 44px-tall nav mark
 * at 3× — crisp on every phone.
 *
 * The owner has said the official logo file is coming as an attachment. When
 * it arrives, drop it in at the same path (or update `src` below); the aspect
 * ratio is read from the file, so a differently proportioned original just
 * works. Nothing else in the codebase references the logo.
 *
 * The mark is white on its own red block, so it needs no light/dark variant —
 * `onDark` is kept for API compatibility with the footer and does nothing.
 */
const LOGO = { src: '/brand/logo.png', width: 512, height: 279 } as const;

export function Logo({
  locale,
  className,
  size = 'nav',
}: {
  locale: Locale;
  className?: string;
  /** `nav` is 44px tall; `footer` is larger for the dark footer band. */
  size?: 'nav' | 'footer';
  /** @deprecated no-op: the mark carries its own background. */
  onDark?: boolean;
}) {
  // Nav: 44px on phones (64px bar), 52px from lg (80px bar). Footer: 64px —
  // all applied as CSS on the link below, never as width/height props.
  return (
    <Link
      href={href(locale, 'home')}
      aria-label="Électroménagers GH — Accueil"
      className={cx(
        'inline-flex shrink-0 items-center',
        // The responsive height lives on the LINK, not the image. next/image
        // warns when CSS changes exactly one of its two dimensions, and it
        // cannot see Tailwind classes — so the image itself gets both
        // dimensions set inline (height fills the link, width follows the
        // aspect ratio) and the link decides how tall that is.
        size === 'nav' ? 'h-11 lg:h-[3.25rem]' : 'h-16',
        className,
      )}
    >
      {/* Intrinsic dimensions, not display ones. next/image warns when exactly
          one rendered dimension differs from its attribute: a rounded display
          width (81 at a 44px height) renders as 80, so width mismatched while
          height did not. Handing over the real file size lets CSS scale both. */}
      <Image
        src={LOGO.src}
        alt="Électroménagers GH — Achat & revente"
        width={LOGO.width}
        height={LOGO.height}
        priority={size === 'nav'}
        className="w-auto"
        style={{ height: '100%', width: 'auto' }}
      />
    </Link>
  );
}
