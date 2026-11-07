import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import Layout from "../components/layout/Layout";
import { fetchProductHistory } from "../services/api";
import type { ProductHistoryResponse } from "../models/types";

const currency = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

export default function ProductPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<ProductHistoryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    fetchProductHistory(id)
      .then(setData)
      .catch((requestError: unknown) => {
        setError(requestError instanceof Error ? requestError.message : "Failed to load price history");
      });
  }, [id]);

  return (
    <Layout>
      <div className="product-page">
        <Link to="/addeditems" className="back-link">← Saved finds</Link>
        {error ? (
          <p className="page-message" role="alert">{error}</p>
        ) : !data ? (
          <p className="page-message">Loading price history...</p>
        ) : (
          <>
            <div className="product-page-heading">
              <div>
                <p className="eyebrow">PRICE HISTORY</p>
                <h1>{data.item.title}</h1>
              </div>
              <p className="product-current-price">{currency.format(data.item.extracted_price)}</p>
            </div>

            <section className="history-panel" aria-labelledby="history-title">
              <div className="history-panel-heading">
                <div>
                  <p className="eyebrow">TRACKED OVER TIME</p>
                  <h2 id="history-title">Price movement</h2>
                </div>
                <span>{data.history.length} {data.history.length === 1 ? "check" : "checks"}</span>
              </div>
              {data.history.length < 2 ? (
                <p className="empty-state">We need another price check before a trend can emerge.</p>
              ) : (
                <div className="history-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.history} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}>
                      <CartesianGrid stroke="#e8ede8" vertical={false} />
                      <XAxis dataKey="recorded_at" tickFormatter={(value: string) => new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })} tick={{ fill: "#77817c", fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis tickFormatter={(value: number) => currency.format(value)} tick={{ fill: "#77817c", fontSize: 11 }} axisLine={false} tickLine={false} width={66} domain={["auto", "auto"]} />
                      <Tooltip labelFormatter={(value) => new Date(String(value)).toLocaleString()} formatter={(value) => [currency.format(Number(value)), "Price"]} contentStyle={{ border: "1px solid #dfe5df", borderRadius: 3, boxShadow: "0 8px 20px rgb(33 48 40 / 8%)" }} />
                      <Line type="monotone" dataKey="price" stroke="#f0644e" strokeWidth={3} dot={{ fill: "#f0644e", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </section>

            {data.item.product_link && (
              <a className="primary-button product-retailer-link" href={data.item.product_link} target="_blank" rel="noopener noreferrer">
                Visit retailer <span aria-hidden="true">↗</span>
              </a>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}