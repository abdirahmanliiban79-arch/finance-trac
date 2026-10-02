"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "12px",
            background: "#f7f9fb",
            color: "#191c1e",
            fontFamily:
              "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            textAlign: "center",
            padding: "24px",
          }}
        >
          <h1 style={{ fontSize: "18px", margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: "12px", color: "#45464d", margin: 0 }}>
            {error.message || "An unexpected error occurred."}
          </p>
          <button
            onClick={reset}
            style={{
              height: "36px",
              padding: "0 20px",
              border: 0,
              borderRadius: "8px",
              background: "#000",
              color: "#fff",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
