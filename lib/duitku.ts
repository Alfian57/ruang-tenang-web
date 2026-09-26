export type DuitkuEnvironment = "sandbox" | "production";

interface DuitkuPopOptions {
  defaultLanguage?: string;
  successEvent?: (result?: unknown) => void;
  pendingEvent?: (result?: unknown) => void;
  errorEvent?: (result?: unknown) => void;
  closeEvent?: () => void;
}

interface DuitkuCheckout {
  process: (reference: string, options?: DuitkuPopOptions) => void;
}

declare global {
  interface Window {
    checkout?: DuitkuCheckout;
    __duitkuPopLoading?: Partial<Record<DuitkuEnvironment, Promise<boolean>>>;
  }
}

function getScriptUrl(environment: DuitkuEnvironment): string {
  return environment === "production"
    ? "https://app-prod.duitku.com/lib/js/duitku.js"
    : "https://app-sandbox.duitku.com/lib/js/duitku.js";
}

async function loadDuitkuPop(environment: DuitkuEnvironment): Promise<boolean> {
  if (typeof window === "undefined") return false;
  if (window.checkout?.process) return true;

  window.__duitkuPopLoading ??= {};
  const currentLoad = window.__duitkuPopLoading[environment];
  if (currentLoad) return currentLoad;

  const loadPromise = new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = getScriptUrl(environment);
    script.async = true;
    script.onload = () => resolve(Boolean(window.checkout?.process));
    script.onerror = () => resolve(false);
    document.head.appendChild(script);
  });

  window.__duitkuPopLoading[environment] = loadPromise;
  const loaded = await loadPromise;
  if (!loaded) delete window.__duitkuPopLoading[environment];
  return loaded;
}

export async function openDuitkuCheckout(params: {
  providerReference?: string;
  paymentUrl?: string;
  environment?: DuitkuEnvironment;
  callbacks?: Omit<DuitkuPopOptions, "defaultLanguage">;
}): Promise<boolean> {
  const { providerReference, paymentUrl, environment = "sandbox", callbacks } = params;
  if (providerReference && await loadDuitkuPop(environment) && window.checkout?.process) {
    window.checkout.process(providerReference, {
      defaultLanguage: "id",
      successEvent: callbacks?.successEvent,
      pendingEvent: callbacks?.pendingEvent,
      errorEvent: callbacks?.errorEvent,
      closeEvent: callbacks?.closeEvent,
    });
    return true;
  }

  if (paymentUrl && typeof window !== "undefined") {
    const opened = window.open(paymentUrl, "_blank");
    if (opened) {
      opened.opener = null;
      return true;
    }
    window.location.assign(paymentUrl);
    return true;
  }

  return false;
}
