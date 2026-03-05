export function reportWebVitals(metric: {
  id: string;
  name: string;
  value: number;
  label: "web-vital" | "custom";
}) {
  // Send to analytics
  if (typeof window !== "undefined" && "gtag" in window) {
    (window as unknown as { gtag: (...args: unknown[]) => void }).gtag(
      "event",
      metric.name,
      {
        event_category:
          metric.label === "web-vital" ? "Web Vitals" : "Custom Metric",
        value: Math.round(
          metric.name === "CLS" ? metric.value * 1000 : metric.value,
        ),
        event_label: metric.id,
        non_interaction: true,
      },
    );
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[Perf]", metric.name, metric.value);
  }
}
