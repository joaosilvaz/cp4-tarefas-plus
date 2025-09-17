import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";

type Props = { id: string; nomeProduto: string; isChecked: boolean };

export default function ItemLoja({ id, nomeProduto, isChecked }: Props) {
    const { colors, theme } = useTheme();
    const isLight = theme === "light";

    const uid = auth.currentUser?.uid!;
    const path = doc(db, "users", uid, "tasks", id);

    const toggle = async () => {
        try { await updateDoc(path, { isChecked: !isChecked }); }
        catch (e) { console.log("Erro ao alternar item", e); }
    };

    const remove = async () => {
        try { await deleteDoc(path); }
        catch (e) { console.log("Erro ao deletar item", e); }
    };

    return (
        <View style={[
            styles.card,
            { backgroundColor: isLight ? "#fff" : "#181818", borderColor: isLight ? "#E5E7EB" : "#333" },
        ]}>
            <TouchableOpacity onPress={toggle} style={styles.left}>
                <MaterialIcons
                    name={isChecked ? "check-box" : "check-box-outline-blank"}
                    size={24}
                    color={colors.primary}
                />
                <Text
                    style={[
                        styles.title,
                        { color: colors.text, textDecorationLine: isChecked ? "line-through" : "none", opacity: isChecked ? 0.6 : 1 },
                    ]}
                >
                    {nomeProduto}
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={remove} style={styles.deleteBtn}>
                <MaterialIcons name="delete" size={22} color={isLight ? "#111" : "#fff"} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row", alignItems: "center", borderWidth: 1,
        borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, marginVertical: 6,
    },
    left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
    title: { fontSize: 16, fontWeight: "600" },
    deleteBtn: { padding: 8, borderRadius: 8 },
});
