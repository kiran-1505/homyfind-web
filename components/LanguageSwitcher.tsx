'use client';

import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/navigation';
import { routing } from '@/i18n/routing';
import { Globe } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('language');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="hidden sm:inline">{t(locale)}</span>
      </button>

      {open && (
        <div className="absolute right-0 mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
          {routing.locales.map((loc) => (
            <button
              key={loc}
              onClick={() => handleChange(loc)}
              className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                locale === loc
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {t(loc)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
