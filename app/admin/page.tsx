import { getPool, ensureSchema } from '@/lib/db';

export const dynamic = 'force-dynamic';

interface Order {
  id: number;
  customer_name: string;
  phone: string;
  email: string | null;
  location: string;
  notes: string | null;
  items: Array<{ name: string; size: string; quantity: number; price: number }>;
  total_price: number;
  created_at: Date;
}

async function getOrders(): Promise<Order[]> {
  try {
    await ensureSchema();
    const result = await getPool().query('SELECT * FROM orders ORDER BY created_at DESC');
    return result.rows as Order[];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const orders = await getOrders();

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Admin Panel</h1>
          <p className="text-gray-500 text-sm">Simple internal view — {orders.length} total order{orders.length !== 1 ? 's' : ''}</p>
        </div>
        <span className="bg-ghana-gold text-black text-xs font-bold px-3 py-1 rounded-full uppercase">Internal</span>
      </div>

      <div className="mb-6 flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-800 text-sm">
        <span className="text-lg leading-none">⚠️</span>
        <span><strong>Internal use only.</strong> This page is unprotected and should not be shared publicly. Add authentication before deploying to production.</span>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-xl">No orders yet.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Order #', 'Customer', 'Phone', 'Location', 'Items', 'Total', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-semibold text-gray-700">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map(order => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-gray-500">#{order.id}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{order.customer_name}</td>
                  <td className="px-4 py-3 text-gray-600">{order.phone}</td>
                  <td className="px-4 py-3 text-gray-600">{order.location}</td>
                  <td className="px-4 py-3 text-gray-600">
                    <ul className="space-y-0.5">
                      {order.items.map((item, i) => (
                        <li key={i}>
                          {item.name} — {item.size} × {item.quantity}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">${order.total_price.toFixed(2)}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                    {new Date(order.created_at).toISOString().replace('T', ' ').slice(0, 19)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
