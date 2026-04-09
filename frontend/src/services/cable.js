// src/services/cable.js
import { createConsumer } from "@rails/actioncable";

// const VITE_CABLE_URL =
//   (typeof process !== "undefined" &&
//     process.env &&
//     process.env.REACT_APP_CABLE_URL) ||
//   "ws://localhost:3000/cable";

const VITE_CABLE_URL = import.meta.env.VITE_CABLE_URL || "ws://localhost:3001/cable";

let consumer = null;

export const getCableConsumer = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  if (!consumer) {
    consumer = createConsumer(`${VITE_CABLE_URL}?token=${token}`);
  }
  return consumer;
};

export const disconnectCable = () => {
  if (consumer) {
    consumer.disconnect();
    consumer = null;
  }
};

/**
 * Subscribe to the watchlist channel for the current user.
 * @param {Function} onReceived - callback(data) when a message arrives
 * @returns subscription object (call .unsubscribe() to clean up)
 */
export const subscribeToWatchlist = (onReceived) => {
  const cable = getCableConsumer();
  if (!cable) return null;

  return cable.subscriptions.create("WatchlistChannel", {
    received: onReceived,
    connected()    { console.debug("[Cable] WatchlistChannel connected"); },
    disconnected() { console.debug("[Cable] WatchlistChannel disconnected"); },
  });
};