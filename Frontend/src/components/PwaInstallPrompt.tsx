import { useState } from "react";
import { Download, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePwaInstall } from "@/hooks/usePwaInstall";
import liaLogo from "@/assets/lia-logo.png";

export function PwaInstallPrompt() {
  const { isInstallable, installApp } = usePwaInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <div className="fixed bottom-6 z-[60] animate-fade-in left-1/2 -translate-x-1/2 w-[calc(100%-3rem)] max-w-sm md:left-auto md:translate-x-0 md:right-6 md:w-auto md:max-w-md">
      <div className="bg-card border border-border rounded-2xl shadow-2xl shadow-primary/10">
        {/* Desktop: full card layout */}
        <div className="hidden md:flex items-center gap-4 p-4">
          <div className="flex h-12 w-12 rounded-xl bg-primary/10 items-center justify-center flex-shrink-0">
            <img src={liaLogo} alt="LIA" className="h-9 w-9 object-contain" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground">Install LIA Portal</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add to home screen for quick access
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={installApp}
              size="sm"
              className="gap-1.5 rounded-xl px-4"
            >
              <Download className="h-4 w-4" />
              Install
            </Button>
            <button
              onClick={() => setDismissed(true)}
              className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-secondary text-muted-foreground transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Mobile: compact layout */}
        <div className="flex md:hidden items-center gap-2 p-3">
          <Button
            onClick={installApp}
            size="sm"
            className="gap-1.5 rounded-xl"
          >
            <Download className="h-4 w-4" />
            Install App
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setDismissed(true)}
            className="h-9 w-9 rounded-xl border-border"
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
