'use client';

import { XCircle, Home } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default function PaymentCancelledPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <XCircle className="w-8 h-8 text-red-500" />
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h2>

        <p className="text-gray-500 mb-6">
          No worries! Your listing is still active on the free plan.
          You can upgrade anytime.
        </p>

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
