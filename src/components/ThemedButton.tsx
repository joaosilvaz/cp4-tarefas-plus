import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "../context/ThemeContext";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  style?: ViewStyle;
};

export default function ThemedButton({ title, onPress, disabled, style }: Props) {
  const { theme } = useTheme();
  const isLight = theme === "light";

  // preto no tema claro, branco no tema escuro
  const bg = isLight ? "#111111" : "#FFFFFF";
  const fg = isLight ? "#FFFFFF" : "#111111";
  const border = isLight ? "#111111" : "#FFFFFF";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      disabled={disabled}
      style={[
        styles.btn,
        { backgroundColor: bg, borderColor: border, opacity: disabled ? 0.6 : 1 },
        style,
      ]}
    >
      <Text style={[styles.text, { color: fg }]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
  },
  text: {
    fontSize: 16,
    fontWeight: "700",
  },
});
