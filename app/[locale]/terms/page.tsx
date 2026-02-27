'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function TermsPage() {
  const t = useTranslations();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const sections = [
    { title: t('terms.acceptanceTitle'), content: t('terms.acceptanceDesc') },
    { title: t('terms.serviceTitle'), content: t('terms.serviceDesc') },
    { title: t('terms.userResponsibilitiesTitle'), content: t('terms.userResponsibilitiesDesc') },
    { title: t('terms.listingGuidelinesTitle'), content: t('terms.listingGuidelinesDesc') },
    { title: t('terms.paymentTitle'), content: t('terms.paymentDesc') },
    { title: t('terms.intellectualPropertyTitle'), content: t('terms.intellectualPropertyDesc') },
    { title: t('terms.limitationTitle'), content: t('terms.limitationDesc') },
    { title: t('terms.terminationTitle'), content: t('terms.terminationDesc') },
    { title: t('terms.changesTitle'), content: t('terms.changesDesc') },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-14 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/find-my-pg-logo.jpg" alt="Find-My-PG" width={32} height={32} className="h-8 w-auto" />
              <span className="font-bold text-gray-900 text-lg">Find-My-PG</span>
            </Link>
            <div className="hidden sm:flex items-center gap-4">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">{t('common.home')}</Link>
              <Link href="/about" className="text-sm text-gray-600 hover:text-gray-900">{t('footer.about')}</Link>
              <LanguageSwitcher />
            </div>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          {mobileMenuOpen && (
            <div className="sm:hidden pb-4 border-t border-gray-100 pt-3 space-y-2">
              <Link href="/" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">{t('common.home')}</Link>
              <Link href="/about" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">{t('footer.about')}</Link>
              <Link href="/contact" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">{t('footer.contact')}</Link>
              <Link href="/privacy" className="block px-4 py-2.5 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50">{t('footer.privacy')}</Link>
              <div className="px-4 py-1">
                <LanguageSwitcher />
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{t('terms.title')}</h1>
        <p className="text-sm text-gray-400 mb-8">{t('terms.lastUpdated')}</p>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 divide-y divide-gray-100">
          {sections.map((section, i) => (
            <div key={i} className="p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-3">{i + 1}. {section.title}</h2>
              <p className="text-gray-600 leading-relaxed text-sm whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold text-gray-900 mb-2">{t('terms.questionsTitle')}</h2>
          <p className="text-gray-600 text-sm">{t('terms.questionsDesc')}</p>
          <a href="mailto:findmypg@gmail.com" className="text-primary-500 font-medium text-sm hover:underline mt-2 inline-block">
            findmypg@gmail.com
          </a>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <Link href="/about" className="text-gray-500 hover:text-gray-700">{t('footer.about')}</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700">{t('footer.privacy')}</Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-700">{t('footer.contact')}</Link>
              <Link href="/terms" className="text-primary-500 font-medium">{t('footer.terms')}</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Find-My-PG. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
