// app/_layout.tsx
import React from "react";
import { Slot } from "expo-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";

import ThemeProvider from "../src/context/ThemeContext";
import AuthProvider from "../src/context/AuthContext";
import i18n from "../src/services/i18n";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
});

export default function RootLayout() {
  return (
    <I18nextProvider i18n={i18n}>
      <ThemeProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <Slot />
          </QueryClientProvider>
        </AuthProvider>
      </ThemeProvider>
    </I18nextProvider>
  );
}
