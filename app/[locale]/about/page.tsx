'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Search, Phone, Home, Users, MapPin, Shield, Building2 } from 'lucide-react';

export default function AboutPage() {
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
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('about.title')}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{t('about.subtitle')}</p>
        </div>

        {/* Mission */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('about.missionTitle')}</h2>
          <p className="text-gray-600 leading-relaxed">{t('about.missionDesc')}</p>
        </section>

        {/* How it works */}
        <section className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">{t('about.howItWorksTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.step1Title')}</h3>
              <p className="text-sm text-gray-500">{t('about.step1Desc')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.step2Title')}</h3>
              <p className="text-sm text-gray-500">{t('about.step2Desc')}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
              <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Home className="w-6 h-6 text-primary-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">{t('about.step3Title')}</h3>
              <p className="text-sm text-gray-500">{t('about.step3Desc')}</p>
            </div>
          </div>
        </section>

        {/* What we offer */}
        <section className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">{t('about.whatWeOfferTitle')}</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{t('about.offer1Title')}</h3>
                <p className="text-sm text-gray-500">{t('about.offer1Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{t('about.offer2Title')}</h3>
                <p className="text-sm text-gray-500">{t('about.offer2Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{t('about.offer3Title')}</h3>
                <p className="text-sm text-gray-500">{t('about.offer3Desc')}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Building2 className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">{t('about.offer4Title')}</h3>
                <p className="text-sm text-gray-500">{t('about.offer4Desc')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Cities */}
        <section className="text-center mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">{t('about.citiesTitle')}</h2>
          <p className="text-gray-600 mb-6">{t('about.citiesDesc')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {['Bangalore', 'Mumbai', 'Delhi', 'Pune', 'Hyderabad', 'Chennai'].map((city) => (
              <span key={city} className="bg-white px-4 py-2 rounded-full text-sm font-medium text-gray-700 border border-gray-200">
                {city}
              </span>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-primary-500 rounded-2xl p-8 text-center text-white">
          <h2 className="text-xl font-bold mb-2">{t('about.ctaTitle')}</h2>
          <p className="text-primary-100 mb-4">{t('about.ctaDesc')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/contact" className="bg-white text-primary-600 px-6 py-2.5 rounded-lg font-medium hover:bg-primary-50 transition-colors text-sm">
              {t('about.contactUs')}
            </Link>
            <Link href="/add-listing" className="bg-primary-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-700 transition-colors border border-primary-400 text-sm">
              {t('about.listYourPG')}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 text-sm">
              <Link href="/about" className="text-primary-500 font-medium">{t('footer.about')}</Link>
              <Link href="/privacy" className="text-gray-500 hover:text-gray-700">{t('footer.privacy')}</Link>
              <Link href="/contact" className="text-gray-500 hover:text-gray-700">{t('footer.contact')}</Link>
              <Link href="/terms" className="text-gray-500 hover:text-gray-700">{t('footer.terms')}</Link>
            </div>
            <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} HomyFind. {t('footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
