import React, { createContext, useContext, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getBranding,
  BrandingData,
  PageCovers,
} from "../endpoints/branding/get_GET.schema";
import { postUpdateBranding } from "../endpoints/admin/branding/update_POST.schema";
import { toast } from "sonner";

// Re-export types for convenience
export type { BrandingData, PageCovers };

const BRANDING_QUERY_KEY = ["branding", "get"];

// --- Hooks ---

export function useBrandingQuery() {
  return useQuery({
    queryKey: BRANDING_QUERY_KEY,
    queryFn: () => getBranding(),
    staleTime: 1000 * 60 * 60, // Cache for 1 hour since branding rarely changes
  });
}

export function useUpdateBranding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUpdateBranding,
    onSuccess: (data) => {
      if (data.success) {
        toast.success("Đã cập nhật thông tin thương hiệu thành công");
        queryClient.invalidateQueries({ queryKey: BRANDING_QUERY_KEY });
      }
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });
}

// --- Context & Provider ---

type BrandingContextValue = {
  branding: BrandingData | null;
  isLoading: boolean;
  error: unknown;
};

const BrandingContext = createContext<BrandingContextValue | null>(null);

export function useBranding() {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error("useBranding must be used within BrandingProvider");
  }
  return context;
}

export function BrandingProvider({ children }: { children: React.ReactNode }) {
  const { data, isLoading, error } = useBrandingQuery();

  const value = useMemo(
    () => ({
      branding: data?.branding ?? null,
      isLoading,
      error,
    }),
    [data, isLoading, error]
  );

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
}