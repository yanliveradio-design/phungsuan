import { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeModeProvider } from "../helpers/themeMode";
import { AppThemeProvider } from "../helpers/useAppTheme";
import { BrandingProvider } from "../helpers/useBranding";
import { TooltipProvider } from "./Tooltip";
import { SonnerToaster } from "./SonnerToaster";
import { ScrollToHashElement } from "./ScrollToHashElement";
import { AuthProvider } from "../helpers/useAuth";
import { AppHead } from "../helpers/AppHead";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute “fresh” window
    },
  },
});

export const GlobalContextProviders = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrandingProvider>
        <AuthProvider>
          <AppThemeProvider>
            <ThemeModeProvider>
              <AppHead />
              <ScrollToHashElement />
              <TooltipProvider>
                {children}
                <SonnerToaster />
              </TooltipProvider>
            </ThemeModeProvider>
          </AppThemeProvider>
        </AuthProvider>
      </BrandingProvider>
    </QueryClientProvider>
);
};
