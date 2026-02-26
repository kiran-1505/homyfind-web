'use client';

import { CheckCircle, Home, Star } from 'lucide-react';
import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'verified';

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
          plan === 'premium' ? 'bg-amber-50' : 'bg-green-50'
        }`}>
          {plan === 'premium' ? (
            <Star className="w-8 h-8 text-amber-500" />
          ) : (
            <CheckCircle className="w-8 h-8 text-green-600" />
          )}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful!
        </h2>

        <p className="text-gray-500 mb-2">
          Your listing has been upgraded to the{' '}
          <span className={`font-semibold ${plan === 'premium' ? 'text-amber-600' : 'text-green-600'}`}>
            {plan === 'premium' ? 'Premium' : 'Verified'}
          </span>{' '}
          plan.
        </p>

        <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
          <p className="text-sm font-medium text-gray-700 mb-2">What happens now:</p>
          <ul className="text-sm text-gray-500 space-y-1">
            {plan === 'premium' ? (
              <>
                <li>- Gold Premium badge added to your listing</li>
                <li>- Your PG appears at the top of search results</li>
                <li>- Highlighted card with amber border</li>
              </>
            ) : (
              <>
                <li>- Verified badge added to your listing</li>
                <li>- Higher ranking in search results</li>
                <li>- More trust from potential tenants</li>
              </>
            )}
          </ul>
        </div>

        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 bg-primary-500 text-white px-6 py-3 rounded-lg hover:bg-primary-600 font-medium transition-colors"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
