import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About jerseyvault.com</h1>
        <div className="h-1 w-20 bg-ghana-gold rounded-full" />
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <div className="bg-ghana-green text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-ghana-gold">Our Mission</h2>
          <p className="text-green-100 leading-relaxed text-lg">
            jerseyvault.com exists to make quality football jerseys and fan wear easy to access in Ghana.
            We focus on clubs across Europe&apos;s top leagues so supporters can find gear for the teams they love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-bold text-xl mb-2">Wide Club Selection</h3>
            <p className="text-gray-600">
              Discover jerseys and fan pieces from major teams in England, Spain, Italy, France, Germany and more.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">🧵</div>
            <h3 className="font-bold text-xl mb-2">Quality You Can Trust</h3>
            <p className="text-gray-600">
              We curate products for comfort, fit, and everyday durability on and off matchday.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-bold text-xl mb-2">Nationwide Delivery</h3>
            <p className="text-gray-600">
              Orders are delivered across Ghana, with tracking updates from checkout to doorstep.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-xl mb-2">Responsive Support</h3>
            <p className="text-gray-600">
              Need help with sizing, availability, or payment? Our team is ready to assist.
            </p>
          </div>
        </div>

        <div className="text-center py-8">
          <Link
            href="/shop"
            className="bg-black text-white font-bold px-8 py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors inline-block"
          >
            Browse Our Collection
          </Link>
        </div>
      </div>
    </div>
  );
}
