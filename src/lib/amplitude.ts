"use client";

import * as amplitude from "@amplitude/analytics-browser";
import { pageViewTrackingPlugin } from "@amplitude/plugin-page-view-tracking-browser";
import { env } from "@/config/env";

let initialized = false;

function initAmplitude() {
  if (initialized || typeof window === "undefined") return;

  const apiKey = env.AMPLITUDE_API_KEY;
  if (!apiKey) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[Amplitude] NEXT_PUBLIC_AMPLITUDE_API_KEY is not set.");
    }
    initialized = true;
    return;
  }

  amplitude.init(apiKey);
  amplitude.add(pageViewTrackingPlugin({ trackHistoryChanges: "all" }));
  initialized = true;
}

initAmplitude();

export default amplitude;
