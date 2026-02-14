"use client";

import { useEffect } from "react";

export default function AlumniError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[AlumniError]", error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-foreground">
          Failed to load alumni
        </h2>
        <p className="mt-2 text-sm text-muted">
          {error.message || "Could not retrieve the alumni roster."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-action px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-action-hover"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
