import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { fetchProducts } from "../api/products";
import FilterSidebar from "../components/FilterSidebar";
import ProductCard from "../components/ProductCard";
import type { ProductFilters, ProductResponse } from "../types/product";
import styles from "./ProductListPage.module.css";

type FetchState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "success"; data: ProductResponse[] };

export default function ProductListPage() {
  const location = useLocation();
  const [state, setState] = useState<FetchState>({ status: "loading" });
  const [filters, setFilters] = useState<ProductFilters>({});

  useEffect(() => {
    let cancelled = false;

    fetchProducts(filters)
      .then((data) => {
        if (!cancelled) setState({ status: "success", data });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({
            status: "error",
            message: err instanceof Error ? err.message : "Unknown error",
          });
      });

    return () => {
      cancelled = true;
    };
  }, [filters]);

  return (
    <div className={styles.page}>
      <FilterSidebar onApply={setFilters} />

      <section className={styles.content}>
        {location.state?.checkoutSuccess && (
          <div className={styles.success}>
            <p>✅ Order placed successfully! Thank you for your purchase.</p>
          </div>
        )}

        <h2 className={styles.heading}>Products</h2>

        {state.status === "loading" && (
          <p className={styles.status}>Loading products…</p>
        )}

        {state.status === "error" && (
          <p className={styles.error}>Error: {state.message}</p>
        )}

        {state.status === "success" && state.data.length === 0 && (
          <p className={styles.status}>
            No products found. Try adjusting your filters.
          </p>
        )}

        {state.status === "success" && state.data.length > 0 && (
          <div className={styles.grid}>
            {state.data.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
