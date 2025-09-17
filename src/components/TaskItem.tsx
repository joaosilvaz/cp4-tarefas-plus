import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

type Props = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string; // ISO
};

export default function TaskItem({ id, title, description, completed, dueDate }: Props) {
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const uid = auth.currentUser?.uid!;
  const ref = doc(db, "users", uid, "tasks", id);

  const toggle = async () => {
    try {
      await updateDoc(ref, { completed: !completed, updatedAt: serverTimestamp() });
    } catch (e) {
      console.log("Erro ao alternar task", e);
    }
  };

  const remove = async () => {
    try {
      await deleteDoc(ref);
    } catch (e) {
      console.log("Erro ao deletar task", e);
    }
  };

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
      <TouchableOpacity onPress={toggle} style={styles.left}>
        <MaterialIcons
          name={completed ? "check-box" : "check-box-outline-blank"}
          size={24}
          color={colors.primary}
        />
        <View style={{ flex: 1 }}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                textDecorationLine: completed ? "line-through" : "none",
                opacity: completed ? 0.6 : 1,
              },
            ]}
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text style={[styles.desc, { color: colors.textSecondary }]} numberOfLines={2}>
            {description}
          </Text>
          {!!dueDate && (
            <Text style={[styles.due, { color: colors.textSecondary }]}>
              {`⏰ ${dayjs(dueDate).format("DD/MM/YYYY HH:mm")}`}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      <TouchableOpacity onPress={remove} style={styles.deleteBtn}>
        <MaterialIcons name="delete" size={22} color={isLight ? "#111" : "#fff"} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginVertical: 6,
  },
  left: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  title: { fontSize: 16, fontWeight: "700" },
  desc: { fontSize: 14, marginTop: 2 },
  due: { fontSize: 12, marginTop: 2 },
  deleteBtn: { padding: 8, borderRadius: 8, marginLeft: 8 },
});
