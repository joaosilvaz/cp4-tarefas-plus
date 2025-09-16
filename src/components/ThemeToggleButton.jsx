import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useTheme } from "../context/ThemeContext";

export default function ThemeToggleButton() {
    const { theme, toggleTheme, colors } = useTheme(); // <- pega o tema atual
    const isLight = theme === "light";

    // Rotulo com emoji (sem i18n, como você pediu: "Light"/"Dark")
    const label = isLight ? "Dark" : "Light";

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.button }]}
            onPress={toggleTheme}
            accessibilityRole="button"
            accessibilityLabel={isLight ? "Switch to dark theme" : "Switch to light theme"}
            activeOpacity={0.8}
        >
            <Text style={[styles.text, { color: colors.buttonText }]}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        marginTop: 20,
        alignItems: "center",
        justifyContent: "center",
    },
    text: {
        fontSize: 16,
        fontWeight: "bold",
    },
});
