"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { ProtectedRoute } from "@/components/Auth/ProtectedRoute";
import { getAuthHeaders, handleAuthError } from "@/lib/auth";

interface ProductDetails {
  _id: string;
  name?: string;
  description?: string;
  price?: number;
  unit?: string;
  sku?: string;
  stock?: number;
  company_id?: string;
  category?:
    | string
    | {
        mainCategory?: string;
        subCategory?: string;
        subSubCategory?: string;
      };
  createdAt?: string;
  updatedAt?: string;
}

export default function ProductDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const productId = String(params?.id || "");

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<ProductDetails | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      try {
        setLoading(true);
        setError("");
        const response = await fetch(`/api/products/${productId}`, {
          headers: getAuthHeaders(),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const message = String(errorData?.error || errorData?.message || "Failed to load product");
          if (handleAuthError(response.status, "Please sign in to view product details")) return;
          setError(message);
          setProduct(null);
          return;
        }

        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error("Error loading product details:", err);
        setError("Unable to load product details");
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const categoryLabel =
    typeof product?.category === "string"
      ? product.category
      : product?.category?.mainCategory || "Uncategorized";

  return (
    <ProtectedRoute requiredPermission="products.read">
      <div className="w-full min-w-0">
        <Breadcrumb pageName="Product Details" />

        <div className="mb-4">
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:border-blue-900 hover:text-blue-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          >
            Back to Products
          </button>
        </div>

        <div className="bg-white/90 dark:bg-gray-800/90 rounded-xl shadow border border-white/20 dark:border-gray-700/20 p-6">
          {loading ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Loading product details...</p>
          ) : error ? (
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : !product ? (
            <p className="text-sm text-gray-600 dark:text-gray-300">Product not found.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
                <p className="text-base font-semibold text-blue-900 dark:text-white">{product.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">SKU</p>
                <p className="text-base text-blue-900 dark:text-white">{product.sku || "-"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Category</p>
                <p className="text-base text-blue-900 dark:text-white">{categoryLabel}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Price</p>
                <p className="text-base font-semibold text-blue-900 dark:text-white">
                  PKR {Number(product.price || 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Stock</p>
                <p className="text-base text-blue-900 dark:text-white">
                  {Number(product.stock || 0)} {product.unit || "units"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Company</p>
                <p className="text-base text-blue-900 dark:text-white">{product.company_id || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs text-gray-500 dark:text-gray-400">Description</p>
                <p className="text-base text-blue-900 dark:text-white whitespace-pre-wrap">{product.description || "-"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
