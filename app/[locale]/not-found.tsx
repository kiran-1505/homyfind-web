import { Link } from '@/i18n/navigation';
import { useTranslations } from 'next-intl';

export default function NotFound() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">{t('notFound.title')}</h2>
        <p className="text-gray-500 mb-6">{t('notFound.description')}</p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors inline-block"
        >
          {t('common.backToHome')}
        </Link>
      </div>
    </div>
  );
}
