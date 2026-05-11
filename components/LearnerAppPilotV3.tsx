"use client";

import { useEffect } from "react";
import LearnerAppPilotV2 from "@/components/LearnerAppPilotV2";

function hideDuplicateContentBranding() {
  const roots = document.querySelectorAll(".pilot-v3 .flex-1 img[alt='차바이오그룹 CI']");
  roots.forEach((image) => {
    const wrapper = image.parentElement;
    if (wrapper instanceof HTMLElement) {
      wrapper.style.display = "none";
    }
  });
}

export default function LearnerAppPilotV3() {
  useEffect(() => {
    hideDuplicateContentBranding();
    const observer = new MutationObserver(() => hideDuplicateContentBranding());
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="pilot-v3">
      <LearnerAppPilotV2 />
    </div>
  );
}
