'use client';

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Contact Us</h1>
        <div className="h-1 w-20 bg-ghana-gold rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
          <ul className="space-y-5">
            <li className="flex items-start gap-4">
              <span className="text-2xl">📍</span>
              <div>
                <p className="font-semibold text-gray-900">Location</p>
                <p className="text-gray-600">Accra, Ghana</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-2xl">📞</span>
              <div>
                <p className="font-semibold text-gray-900">Phone</p>
                <p className="text-gray-600">+233 20 000 0000</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-2xl">✉️</span>
              <div>
                <p className="font-semibold text-gray-900">Email</p>
                <p className="text-gray-600">hello@ghanajerseystore.com</p>
              </div>
            </li>
            <li className="flex items-start gap-4">
              <span className="text-2xl">⏰</span>
              <div>
                <p className="font-semibold text-gray-900">Hours</p>
                <p className="text-gray-600">Mon – Sat: 9am – 6pm GMT</p>
              </div>
            </li>
          </ul>
        </div>

        {/* Contact Form */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
          <form className="space-y-4" onSubmit={e => e.preventDefault()}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your name"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                placeholder="your@email.com"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                rows={5}
                placeholder="How can we help you?"
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ghana-gold resize-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white font-bold py-3 rounded-lg hover:bg-ghana-gold hover:text-black transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
