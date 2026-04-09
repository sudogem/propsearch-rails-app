// src/components/ui/LoadingSpinner.js
import React from "react";

export default function LoadingSpinner({ fullPage = false }) {
  if (fullPage) {
    return (
      <div className="spinner-fullpage">
        <div className="spinner" />
      </div>
    );
  }
  return (
    <div className="spinner-wrap">
      <div className="spinner" />
    </div>
  );
}