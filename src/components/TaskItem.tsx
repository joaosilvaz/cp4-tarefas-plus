// src/components/TaskItem.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import dayjs from "dayjs";
import { useTheme } from "../context/ThemeContext";
import { auth, db } from "../services/firebaseConfig";
import { doc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import ThemedButton from "./ThemedButton";

type Props = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string; // ISO
};

function toIsoZ(raw: string) {
  const norm = raw.trim().replace(" ", "T"); // "YYYY-MM-DD HH:mm" -> "YYYY-MM-DDTHH:mm"
  const d = new Date(norm);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export default function TaskItem({ id, title, description, completed, dueDate }: Props) {
  const { colors, theme } = useTheme();
  const isLight = theme === "light";
  const uid = auth.currentUser?.uid!;
  const ref = doc(db, "users", uid, "tasks", id);

  // modal de edição
  const [open, setOpen] = useState(false);
  const [tTitle, setTTitle] = useState(title);
  const [tDesc, setTDesc] = useState(description);
  const [tDue, setTDue] = useState(
    dueDate && dayjs(dueDate).isValid() ? dayjs(dueDate).format("YYYY-MM-DD HH:mm") : ""
  );
  const [saving, setSaving] = useState(false);

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

  const openEdit = () => {
    // sincroniza com os valores atuais
    setTTitle(title);
    setTDesc(description);
    setTDue(dueDate && dayjs(dueDate).isValid() ? dayjs(dueDate).format("YYYY-MM-DD HH:mm") : "");
    setOpen(true);
  };

  const saveEdit = async () => {
    try {
      const newTitle = tTitle.trim();
      const newDesc = tDesc.trim();
      const iso = tDue ? toIsoZ(tDue) : ""; // permite vazio

      if (!newTitle || !newDesc) {
        return Alert.alert("Atenção", "Preencha título e descrição.");
      }
      if (tDue && !iso) {
        return Alert.alert(
          "Atenção",
          "Data inválida. Use o formato: YYYY-MM-DD HH:mm (ex: 2025-09-10 14:00)."
        );
      }

      setSaving(true);
      await updateDoc(ref, {
        title: newTitle,
        description: newDesc,
        dueDate: iso || "", // mantém vazio se não informado
        updatedAt: serverTimestamp(),
      });
      setOpen(false);
    } catch (e) {
      console.log("Erro ao salvar edição", e);
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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

        {/* Botão editar */}
        <TouchableOpacity onPress={openEdit} style={styles.iconBtn}>
          <MaterialIcons name="edit" size={22} color={isLight ? "#111" : "#fff"} />
        </TouchableOpacity>

        {/* Botão deletar */}
        <TouchableOpacity onPress={remove} style={styles.iconBtn}>
          <MaterialIcons name="delete" size={22} color={isLight ? "#111" : "#fff"} />
        </TouchableOpacity>
      </View>

      {/* Modal de edição */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={styles.backdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={[styles.modalCard, { backgroundColor: isLight ? "#fff" : "#212121" }]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>Editar tarefa</Text>

            <TextInput
              placeholder="Título"
              placeholderTextColor="#8A8A8A"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isLight ? "#f4f4f5" : "#2a2a2a",
                  borderColor: isLight ? "#E5E7EB" : "#333",
                },
              ]}
              value={tTitle}
              onChangeText={setTTitle}
              returnKeyType="next"
            />

            <TextInput
              placeholder="Descrição"
              placeholderTextColor="#8A8A8A"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isLight ? "#f4f4f5" : "#2a2a2a",
                  borderColor: isLight ? "#E5E7EB" : "#333",
                },
              ]}
              value={tDesc}
              onChangeText={setTDesc}
              returnKeyType="next"
            />

            <TextInput
              placeholder="Data (YYYY-MM-DD HH:mm)"
              placeholderTextColor="#8A8A8A"
              style={[
                styles.input,
                {
                  color: colors.text,
                  backgroundColor: isLight ? "#f4f4f5" : "#2a2a2a",
                  borderColor: isLight ? "#E5E7EB" : "#333",
                },
              ]}
              value={tDue}
              onChangeText={setTDue}
              returnKeyType="done"
            />

            <View style={{ height: 8 }} />

            <View style={{ flexDirection: "row", gap: 10 }}>
              <View style={{ flex: 1 }}>
                <ThemedButton title="Cancelar" onPress={() => setOpen(false)} />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedButton
                  title={saving ? "Salvando..." : "Salvar"}
                  onPress={saveEdit}
                  disabled={saving}
                />
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
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
  iconBtn: { padding: 8, borderRadius: 8, marginLeft: 6 },

  // modal
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 10,
    fontSize: 15,
  },
});
