import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  return (
    <main style={{ padding: "48px", fontFamily: "Arial, sans-serif" }}>
      <h1>Sallihha</h1>
      <p>Electronic Device Repair Marketplace</p>
      <p>Project foundation is ready.</p>
    </main>
  );
}
