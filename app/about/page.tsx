import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">About Ghana Jersey Store</h1>
        <div className="h-1 w-20 bg-ghana-gold rounded-full" />
      </div>

      <div className="prose prose-lg max-w-none space-y-8">
        <div className="bg-ghana-green text-white rounded-xl p-8">
          <h2 className="text-2xl font-bold mb-4 text-ghana-gold">Our Mission</h2>
          <p className="text-green-100 leading-relaxed text-lg">
            Ghana Jersey Store was founded with one purpose: to make authentic Ghana Black Stars jerseys
            accessible to every fan across Ghana and around the world. We believe wearing the national
            colours is more than fashion — it's a statement of pride, unity, and passion for the beautiful game.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">⭐</div>
            <h3 className="font-bold text-xl mb-2">Authentic Quality</h3>
            <p className="text-gray-600">
              Every jersey in our store is officially licensed and manufactured to the highest standards.
              Wear what the players wear.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">🇬🇭</div>
            <h3 className="font-bold text-xl mb-2">Supporting Ghana Football</h3>
            <p className="text-gray-600">
              A portion of every sale goes back into grassroots football development programs across Ghana.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">🚚</div>
            <h3 className="font-bold text-xl mb-2">Nationwide Delivery</h3>
            <p className="text-gray-600">
              We deliver to all major cities including Accra, Kumasi, Tamale, Cape Coast, and Takoradi.
            </p>
          </div>
          <div className="border border-gray-200 rounded-xl p-6">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-xl mb-2">Dedicated Support</h3>
            <p className="text-gray-600">
              Our team is here to help with sizing, preorders, and any questions about your jersey.
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
