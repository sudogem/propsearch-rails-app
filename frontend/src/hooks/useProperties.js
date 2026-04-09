// src/hooks/useProperties.js
import { useState, useEffect, useCallback, useRef } from "react";
import { propertyService } from "../services/api";

const PER_PAGE = 12;

/**
 * Hook for fetching properties with filtering, pagination, and infinite scroll support.
 */
export function useProperties(filters = {}) {
  const [properties, setProperties]   = useState([]);
  const [meta, setMeta]               = useState(null);
  const [loading, setLoading]         = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]             = useState(null);
  const [page, setPage]               = useState(1);

  // Track whether the current fetch is for a fresh search (page 1) or load-more
  const filtersRef   = useRef(filters);
  const abortRef     = useRef(null);

  const fetchProperties = useCallback(async (pageNum, currentFilters, append = false) => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    append ? setLoadingMore(true) : setLoading(true);
    setError(null);

    try {
      const data = await propertyService.list({
        ...currentFilters,
        page:     pageNum,
        per_page: PER_PAGE,
      });

      setProperties((prev) => append ? [...prev, ...(data.data || [])] : (data.data || []));
      setMeta(data.meta || null);
    } catch (err) {
      if (err.name !== "CanceledError" && err.name !== "AbortError") {
        setError(err.response?.data?.error || "Failed to fetch properties");
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  // Reset and re-fetch when filters change
  useEffect(() => {
    filtersRef.current = filters;
    setPage(1);
    fetchProperties(1, filters, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  const loadMore = useCallback(() => {
    if (loadingMore || loading) return;
    if (meta && page >= meta.total_pages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    fetchProperties(nextPage, filtersRef.current, true);
  }, [fetchProperties, loadingMore, loading, meta, page]);

  const hasMore = meta ? page < meta.total_pages : false;

  return { properties, meta, loading, loadingMore, error, loadMore, hasMore, setProperties };
}



