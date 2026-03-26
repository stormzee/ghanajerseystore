import { NextResponse } from 'next/server';
import { getPool, ensureSchema } from '@/lib/db';
import { auth } from '@/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await auth();
    const role = (session?.user as { role?: string } | null)?.role;
    if (role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await ensureSchema();
    const db = getPool();

    // ── User metrics ─────────────────────────────────────────────────────────
    const [totalUsersRes, newUsersRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS count FROM users`),
      db.query(
        `SELECT COUNT(*) AS count FROM users
         WHERE created_at >= date_trunc('month', NOW())`
      ),
    ]);

    // ── Order metrics ─────────────────────────────────────────────────────────
    const [totalOrdersRes, statusBreakdownRes, revenueRes, monthRevenueRes, avgOrderRes] =
      await Promise.all([
        db.query(`SELECT COUNT(*) AS count FROM orders`),
        db.query(
          `SELECT delivery_status, COUNT(*) AS count
           FROM orders
           GROUP BY delivery_status
           ORDER BY count DESC`
        ),
        db.query(`SELECT COALESCE(SUM(total_price), 0) AS total FROM orders`),
        db.query(
          `SELECT COALESCE(SUM(total_price), 0) AS total FROM orders
           WHERE created_at >= date_trunc('month', NOW())`
        ),
        db.query(
          `SELECT COALESCE(AVG(total_price), 0) AS avg FROM orders`
        ),
      ]);

    // ── Product metrics ───────────────────────────────────────────────────────
    const [totalProductsRes, categoryBreakdownRes] = await Promise.all([
      db.query(`SELECT COUNT(*) AS count FROM products`),
      db.query(
        `SELECT category, COUNT(*) AS count FROM products GROUP BY category ORDER BY count DESC`
      ),
    ]);

    // ── Top-selling products (by units sold from order items JSONB) ───────────
    const topProductsRes = await db.query(
      `SELECT
         item->>'name'                        AS name,
         SUM((item->>'quantity')::int)        AS units_sold,
         SUM((item->>'quantity')::int * (item->>'price')::numeric) AS revenue
       FROM orders,
            LATERAL jsonb_array_elements(items) AS item
       WHERE delivery_status != 'cancelled'
       GROUP BY item->>'name'
       ORDER BY units_sold DESC
       LIMIT 10`
    );

    // ── Daily revenue for the last 30 days ────────────────────────────────────
    const dailyRevenueRes = await db.query(
      `SELECT
         TO_CHAR(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS day,
         COUNT(*)                                              AS orders,
         COALESCE(SUM(total_price), 0)                        AS revenue
       FROM orders
       WHERE created_at >= NOW() - INTERVAL '30 days'
         AND delivery_status != 'cancelled'
       GROUP BY day
       ORDER BY day ASC`
    );

    // ── Category sales revenue ────────────────────────────────────────────────
    const categorySalesRes = await db.query(
      `SELECT
         p.category,
         COUNT(DISTINCT o.id)                                                          AS order_count,
         SUM((item->>'quantity')::int * (item->>'price')::numeric)                    AS revenue
       FROM orders o,
            LATERAL jsonb_array_elements(o.items) AS item
       JOIN products p ON p.name = item->>'name'
       WHERE o.delivery_status != 'cancelled'
       GROUP BY p.category
       ORDER BY revenue DESC`
    );

    // ── Visitor / page-view metrics ───────────────────────────────────────────
    const [
      totalViewsRes,
      viewsTodayRes,
      viewsThisMonthRes,
      uniqueIpsRes,
      topPagesRes,
      topCountriesRes,
      dailyVisitorsRes,
    ] = await Promise.all([
      db.query(`SELECT COUNT(*) AS count FROM page_views`),
      db.query(
        `SELECT COUNT(*) AS count FROM page_views
         WHERE created_at >= date_trunc('day', NOW())`
      ),
      db.query(
        `SELECT COUNT(*) AS count FROM page_views
         WHERE created_at >= date_trunc('month', NOW())`
      ),
      db.query(
        `SELECT COUNT(DISTINCT ip) AS count FROM page_views WHERE ip IS NOT NULL`
      ),
      db.query(
        `SELECT path, COUNT(*) AS count
         FROM page_views
         GROUP BY path
         ORDER BY count DESC
         LIMIT 10`
      ),
      db.query(
        `SELECT country, COUNT(*) AS count
         FROM page_views
         WHERE country IS NOT NULL
         GROUP BY country
         ORDER BY count DESC
         LIMIT 10`
      ),
      db.query(
        `SELECT
           date_trunc('day', created_at AT TIME ZONE 'UTC')::date::text AS day,
           COUNT(*)                                                      AS views,
           COUNT(DISTINCT ip)                                            AS unique_visitors
         FROM page_views
         WHERE created_at >= NOW() - INTERVAL '30 days'
         GROUP BY day
         ORDER BY day ASC`
      ),
    ]);

    return NextResponse.json({
      users: {
        total: parseInt(totalUsersRes.rows[0].count, 10),
        newThisMonth: parseInt(newUsersRes.rows[0].count, 10),
      },
      orders: {
        total: parseInt(totalOrdersRes.rows[0].count, 10),
        byStatus: statusBreakdownRes.rows.map(r => ({
          status: r.delivery_status as string,
          count: parseInt(r.count, 10),
        })),
        totalRevenue: parseFloat(revenueRes.rows[0].total),
        revenueThisMonth: parseFloat(monthRevenueRes.rows[0].total),
        averageOrderValue: parseFloat(avgOrderRes.rows[0].avg),
      },
      products: {
        total: parseInt(totalProductsRes.rows[0].count, 10),
        byCategory: categoryBreakdownRes.rows.map(r => ({
          category: r.category as string,
          count: parseInt(r.count, 10),
        })),
      },
      topProducts: topProductsRes.rows.map(r => ({
        name: r.name as string,
        unitsSold: parseInt(r.units_sold, 10),
        revenue: parseFloat(r.revenue),
      })),
      dailyRevenue: dailyRevenueRes.rows.map(r => ({
        day: r.day as string,
        orders: parseInt(r.orders, 10),
        revenue: parseFloat(r.revenue),
      })),
      categorySales: categorySalesRes.rows.map(r => ({
        category: r.category as string,
        orderCount: parseInt(r.order_count, 10),
        revenue: parseFloat(r.revenue),
      })),
      visitors: {
        totalViews: parseInt(totalViewsRes.rows[0].count, 10),
        viewsToday: parseInt(viewsTodayRes.rows[0].count, 10),
        viewsThisMonth: parseInt(viewsThisMonthRes.rows[0].count, 10),
        uniqueIps: parseInt(uniqueIpsRes.rows[0].count, 10),
        topPages: topPagesRes.rows.map(r => ({
          path: r.path as string,
          count: parseInt(r.count, 10),
        })),
        topCountries: topCountriesRes.rows.map(r => ({
          country: r.country as string,
          count: parseInt(r.count, 10),
        })),
        dailyTraffic: dailyVisitorsRes.rows.map(r => ({
          day: r.day as string,
          views: parseInt(r.views, 10),
          uniqueVisitors: parseInt(r.unique_visitors, 10),
        })),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to load analytics' }, { status: 500 });
  }
}
