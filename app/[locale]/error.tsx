'use client';

import { useTranslations } from 'next-intl';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations('error');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('title')}</h2>
        <p className="text-gray-500 text-sm mb-6">
          {t('description')}
        </p>
        <button
          onClick={reset}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium transition-colors"
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  );
}
