/* eslint-disable react-refresh/only-export-components */
// src/context/WatchlistContext.js
import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from "react";
import { watchlistService } from "../services/api";
import { subscribeToWatchlist } from "../services/cable";
import { useAuth } from "./AuthContext";

export const WatchlistContext = createContext(null);

const initialState = {
  ids:        new Set(),   // Set of watchlisted property IDs (fast O(1) lookup)
  properties: [],          // Full property objects for the watchlist page
  loading:    false,
  error:      null,
  totalCount: 0,
};

function watchlistReducer(state, action) {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false };
    case "LOAD_SUCCESS": {
      const ids = new Set(action.payload.map((p) => p.id));
      return { ...state, ids, properties: action.payload, loading: false, error: null };
    }
    case "ADD": {
      const ids = new Set(state.ids);
      ids.add(action.payload.id);
      return {
        ...state,
        ids,
        properties: [action.payload, ...state.properties],
        totalCount: state.totalCount + 1,
      };
    }
    case "REMOVE": {
      const ids = new Set(state.ids);
      ids.delete(action.payload);
      return {
        ...state,
        ids,
        properties: state.properties.filter((p) => p.id !== action.payload),
        totalCount: Math.max(0, state.totalCount - 1),
      };
    }
    case "RESET":
      return { ...initialState, ids: new Set() };
    default:
      return state;
  }
}

export function WatchlistProvider({ children }) {
  const [state, dispatch] = useReducer(watchlistReducer, { ...initialState, ids: new Set() });
  const { user } = useAuth();
  const subscriptionRef = useRef(null);

  // Load watchlist IDs when user logs in
  useEffect(() => {
    if (!user) {
      dispatch({ type: "RESET" });
      return;
    }

    const load = async () => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        // Load all watchlisted properties to build the ID set
        const data = await watchlistService.list({ per_page: 100 });
        dispatch({ type: "LOAD_SUCCESS", payload: data.data || [] });
      // eslint-disable-next-line no-unused-vars
      } catch (err) {
        dispatch({ type: "SET_ERROR", payload: "Failed to load watchlist" });
      }
    };

    load();
  }, [user]);

  // Subscribe to ActionCable for real-time updates
  useEffect(() => {
    if (!user) return;

    // Small delay to ensure token is persisted
    const timer = setTimeout(() => {
      subscriptionRef.current = subscribeToWatchlist((message) => {
        console.debug("[Watchlist] WebSocket message:", message);
        // Real-time notifications can be handled here
        // The actual state is updated optimistically via add/remove
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      subscriptionRef.current?.unsubscribe();
      subscriptionRef.current = null;
    };
  }, [user]);

  const addToWatchlist = useCallback(async (property) => {
    // Optimistic update
    dispatch({ type: "ADD", payload: { ...property, is_watchlisted: true } });
    try {
      await watchlistService.add(property.id);
    } catch (err) {
      // Rollback on failure
      dispatch({ type: "REMOVE", payload: property.id });
      throw err;
    }
  }, []);

  const removeFromWatchlist = useCallback(async (propertyId) => {
    const property = state.properties.find((p) => p.id === propertyId);
    // Optimistic update
    dispatch({ type: "REMOVE", payload: propertyId });
    try {
      await watchlistService.remove(propertyId);
    } catch (err) {
      // Rollback on failure
      if (property) dispatch({ type: "ADD", payload: property });
      throw err;
    }
  }, [state.properties]);

  const isWatchlisted = useCallback((id) => state.ids.has(id), [state.ids]);

  const toggleWatchlist = useCallback(async (property) => {
    if (isWatchlisted(property.id)) {
      await removeFromWatchlist(property.id);
    } else {
      await addToWatchlist(property);
    }
  }, [isWatchlisted, addToWatchlist, removeFromWatchlist]);

  const refreshWatchlist = useCallback(async () => {
    if (!user) return;
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await watchlistService.list({ per_page: 100 });
      dispatch({ type: "LOAD_SUCCESS", payload: data.data || [] });
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      dispatch({ type: "SET_ERROR", payload: "Failed to refresh watchlist" });
    }
  }, [user]);

  return (
    <WatchlistContext.Provider value={{
      ...state,
      addToWatchlist,
      removeFromWatchlist,
      toggleWatchlist,
      isWatchlisted,
      refreshWatchlist,
    }}>
      {children}
    </WatchlistContext.Provider>
  );
}

export const useWatchlist = () => {
  const ctx = useContext(WatchlistContext);
  if (!ctx) throw new Error("useWatchlist must be used within WatchlistProvider");
  return ctx;
};