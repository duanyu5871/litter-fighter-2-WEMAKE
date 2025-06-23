import { MetricType } from "web-vitals";

const reportWebVitals = (onPerfEntry?: (metric: MetricType) => void) => {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    import("web-vitals").then((r) => {
      r.onCLS(onPerfEntry);
      r.onINP(onPerfEntry);
      r.onFCP(onPerfEntry);
      r.onLCP(onPerfEntry);
      r.onTTFB(onPerfEntry);
    });
  }
};

export default reportWebVitals;
