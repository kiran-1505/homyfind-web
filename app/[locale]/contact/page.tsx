'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Mail, Clock, Search, PlusCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/HomyFind-logo.png" alt="HomyFind" width={32} height={32} className="h-8 w-auto" />
            <span className="font-bold text-gray-900 text-lg">HomyFind</span>
          </Link>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('contact.title')}</h1>
          <p className="text-lg text-gray-600">{t('contact.subtitle')}</p>
        </div>

        {/* Contact cards */}
        <div className="grid sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-primary-500" />
            </div>
            <h2 className="font-bold text-gray-900 mb-2">{t('contact.emailTitle')}</h2>
            <a href="mailto:homyfind@gmail.com" className="text-primary-500 font-medium hover:underline">
              homyfind@gmail.com
            </a>
            <p className="text-sm text-gray-400 mt-2">{t('contact.emailResponse')}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Clock className="w-6 h-6 text-primary-500" />
            </div>
            <h2 className="font-bold text-gray-900 mb-2">{t('contact.hoursTitle')}</h2>
            <p className="text-gray-600 text-sm">{t('contact.hoursDesc')}</p>
          </div>
        </div>

        {/* FAQ / Quick links */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('contact.faqTitle')}</h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Search className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('contact.forTenantsTitle')}</h3>
                <p className="text-sm text-gray-500 mb-2">{t('contact.forTenantsDesc')}</p>
                <Link href="/" className="text-primary-500 text-sm font-medium hover:underline">
                  {t('contact.searchPGs')}
                </Link>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <PlusCircle className="w-5 h-5 text-primary-500" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">{t('contact.forOwnersTitle')}</h3>
                <p className="text-sm text-gray-500 mb-2">{t('contact.forOwnersDesc')}</p>
                <Link href="/add-listing" className="text-primary-500 text-sm font-medium hover:underline">
                  {t('contact.listYourPG')}
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <Link href="/about" className="text-gray-500 hover:text-gray-700">{t('footer.about')}</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700">{t('footer.privacy')}</Link>
              <Link href="/contact" className="text-primary-500 font-medium">{t('footer.contact')}</Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700">{t('footer.terms')}</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} HomyFind. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
