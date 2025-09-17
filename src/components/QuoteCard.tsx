// src/components/QuoteCard.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useQuery } from "@tanstack/react-query";
import ThemedButton from "./ThemedButton";
import { useTheme } from "../context/ThemeContext";

type Quote = { content: string; author: string };

async function fetchWithTimeout(url: string, ms = 6000) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    return res;
  } finally {
    clearTimeout(t);
  }
}

// 1) ZenQuotes (sem API key)
async function fromZenQuotes(): Promise<Quote> {
  const res = await fetchWithTimeout("https://zenquotes.io/api/random");
  if (!res.ok) throw new Error("ZenQuotes falhou");
  const data = await res.json();
  if (!Array.isArray(data) || !data[0]?.q) throw new Error("ZenQuotes inválido");
  return { content: data[0].q, author: data[0].a || "Unknown" };
}

// 2) AdviceSlip (fallback)
async function fromAdviceSlip(): Promise<Quote> {
  const res = await fetchWithTimeout("https://api.adviceslip.com/advice");
  if (!res.ok) throw new Error("AdviceSlip falhou");
  const data = await res.json();
  const content = data?.slip?.advice;
  if (!content) throw new Error("AdviceSlip inválido");
  return { content, author: "Advice" };
}

// Tenta em cascata
async function fetchQuote(): Promise<Quote> {
  try {
    return await fromZenQuotes();
  } catch {
    return await fromAdviceSlip();
  }
}

export default function QuoteCard() {
  const { colors, theme } = useTheme();
  const isLight = theme === "light";

  const { data, isFetching, refetch, error } = useQuery({
    queryKey: ["quote"],
    queryFn: fetchQuote,
    staleTime: 60_000,
    retry: 1,
  });

  const text =
    error
      ? "Não foi possível carregar a citação. Tente novamente."
      : data
      ? `“${data.content}” — ${data.author}`
      : "Carregando...";

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: isLight ? "#fff" : "#181818",
          borderColor: isLight ? "#E5E7EB" : "#333",
        },
      ]}
    >
      <Text style={[styles.text, { color: colors.text }]}>{text}</Text>

      <View style={{ marginTop: 8 }}>
        <ThemedButton
          title={isFetching ? "Atualizando..." : "Nova citação"}
          onPress={() => refetch()}
          disabled={isFetching}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 12 },
  text: { fontSize: 14, lineHeight: 20 },
});
