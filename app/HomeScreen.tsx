import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import {
	Text,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	View,
	Alert,
	TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import * as Notifications from "expo-notifications";
import { onSnapshot, query, orderBy, serverTimestamp } from "firebase/firestore";
import { deleteUser } from "firebase/auth";

import TaskItem from "../src/components/TaskItem";
import ThemedButton from "../src/components/ThemedButton";
import QuoteCard from "../src/components/QuoteCard";

import { auth, addDoc } from "../src/services/firebaseConfig";
import { userTasksCol } from "../src/services/firestorePaths";

import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import { setupNotifications, scheduleTaskReminder } from "../src/services/notifications";


type Task = {
	id: string;
	title: string;
	description: string;
	completed: boolean;
	dueDate: string;
};

export default function HomeScreen() {
	const { t } = useTranslation();
	const { colors, theme } = useTheme();
	const { signOut: signOutUser } = useAuth();
	const router = useRouter();

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [dueDate, setDueDate] = useState(""); // ex: 2025-09-10 14:00

	const [tasks, setTasks] = useState<Task[]>([]);
	const [loadingList, setLoadingList] = useState(true);
	const unsubRef = useRef<null | (() => void)>(null);

	const realizarLogoff = async () => {
		try {
			// para de escutar o Firestore antes de sair
			unsubRef.current?.();
			unsubRef.current = null;

			// desmonta a lista pra não renderizar TaskItem com userId indefinido
			setTasks([]);
			setLoadingList(true);

			await signOutUser();
			router.replace("/");
		} catch (error: any) {
			Alert.alert("Erro", error?.message || "Erro ao fazer logout");
		}
	};

	const excluirConta = () => {
		Alert.alert(
			"Confirmar Exclusão",
			"Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.",
			[
				{ text: "Cancelar", style: "cancel" },
				{
					text: "Excluir",
					style: "destructive",
					onPress: async () => {
						try {
							const currentUser = auth.currentUser;
							if (currentUser) {
								await deleteUser(currentUser);
								Alert.alert("Conta Excluída", "Sua conta foi excluída com sucesso.");
								router.replace("/");
							} else {
								Alert.alert("Erro", "Nenhum usuário logado");
							}
						} catch {
							Alert.alert("Erro", "Não foi possível excluir a conta");
						}
					},
				},
			]
		);
	};

	const toIsoZ = (raw: string) => {
		const norm = raw.trim().replace(" ", "T"); // "YYYY-MM-DD HH:mm" -> "YYYY-MM-DDTHH:mm"
		const d = new Date(norm);
		if (isNaN(d.getTime())) return null;
		return d.toISOString();
	};

	const salvarTask = async () => {
		try {
			const uid = auth.currentUser?.uid;
			if (!uid) return Alert.alert("Erro", "Usuário não autenticado.");

			const tTitle = title.trim();
			const desc = description.trim();
			const iso = toIsoZ(dueDate); // sua função que transforma "YYYY-MM-DD HH:mm" em ISO

			if (!tTitle || !desc || !iso) {
				return Alert.alert(
					"Atenção",
					"Preencha Título, Descrição e Data (ex: 2025-09-10 14:00)."
				);
			}

			await addDoc(userTasksCol(uid), {
				userId: uid,
				title: tTitle,
				description: desc,
				completed: false,
				dueDate: iso,
				createdAt: serverTimestamp(),
				updatedAt: serverTimestamp(),
			});

			await scheduleTaskReminder(tTitle, iso);

			setTitle("");
			setDescription("");
			setDueDate("");
		} catch (e: any) {
			console.log("Erro ao salvar:", e?.code ?? e?.message ?? e);
			Alert.alert("Erro", "Não foi possível salvar a tarefa.");
		}
	};

	useEffect(() => {
		const sub = Notifications.addNotificationReceivedListener((n) =>
			console.log("Notificação recebida: ", n)
		);
		return () => sub.remove();
	}, []);

	useEffect(() => {
		(async () => {
			const { status } = await Notifications.getPermissionsAsync();
			if (status !== "granted") await Notifications.requestPermissionsAsync();
		})();
	}, []);

	useEffect(() => {
		const uid = auth.currentUser?.uid;
		if (!uid) return;

		const q = query(userTasksCol(uid), orderBy("createdAt", "desc"));
		const unsub = onSnapshot(
			q,
			(snap) => {
				const rows: Task[] = snap.docs.map((d) => {
					const data = d.data() as any;
					return {
						id: d.id,
						title: String(data?.title ?? ""),
						description: String(data?.description ?? ""),
						completed: Boolean(data?.completed),
						dueDate: String(data?.dueDate ?? ""),
					};
				});
				setTasks(rows);
				setLoadingList(false);
			},
			(err) => {
				console.log("onSnapshot error", err);
				setLoadingList(false);
			}
		);
		unsubRef.current = unsub;
		return () => {
			unsub();
			unsubRef.current = null;
		};
	}, []);

	useEffect(() => {
		setupNotifications();
	}, []);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			{/* FAB de logout: emoji no canto superior direito */}
			<TouchableOpacity
				onPress={realizarLogoff}
				style={[
					styles.logoutFab,
					{
						backgroundColor: theme === "light" ? "#00000010" : "#ffffff10",
						borderColor: theme === "light" ? "#00000020" : "#ffffff20",
					},
				]}
				accessibilityLabel="Sair"
			>
				<Text style={{ fontSize: 20 }}>➜]</Text>
			</TouchableOpacity>

			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={20}
			>
				<Text style={[styles.welcome, { color: colors.text }]}>Suas tarefas</Text>

				<TextInput
					placeholder="Título da tarefa"
					placeholderTextColor="#6B7280"
					style={[styles.input, { backgroundColor: "lightgray", color: colors.text }]}
					value={title}
					onChangeText={setTitle}
					returnKeyType="next"
				/>
				<TextInput
					placeholder="Descrição"
					placeholderTextColor="#6B7280"
					style={[styles.input, { backgroundColor: "lightgray", color: colors.text }]}
					value={description}
					onChangeText={setDescription}
					returnKeyType="next"
				/>
				<TextInput
					placeholder="Data (ex: 2025-09-10 14:00)"
					placeholderTextColor="#6B7280"
					style={[styles.input, { backgroundColor: "lightgray", color: colors.text }]}
					value={dueDate}
					onChangeText={setDueDate}
					onSubmitEditing={salvarTask}
					returnKeyType="done"
				/>

				<View style={{ marginTop: 8, marginBottom: 12 }}>
					<ThemedButton title="Adicionar tarefa" onPress={salvarTask} />
				</View>

				{loadingList ? (
					<ActivityIndicator />
				) : (
					<FlatList
						data={tasks}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingVertical: 8 }}
						renderItem={({ item }) => (
							<TaskItem
								id={item.id}
								title={item.title}
								description={item.description}
								completed={item.completed}
								dueDate={item.dueDate}
							/>
						)}
					/>
				)}


				<View style={styles.actions}>
					<View style={styles.buttonGroup}>
						<View style={{ marginBottom: 0 }}>
							<QuoteCard />
						</View>
						<View style={styles.buttonItem}>
							<ThemedButton
								title="Alterar Senha"
								onPress={() => router.push("/AlterarSenhaScreen")}
							/>
						</View>
						<View style={styles.buttonItem}>
							<ThemedButton title="Excluir conta" onPress={excluirConta} />
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 20
	},
	welcome: {
		marginBottom: 12,
		fontSize: 26,
		textAlign: "center",
		fontWeight: "600"
	},
	actions: {
		marginTop: 0,
		marginBottom: 16
	},
	buttonGroup: {
		marginTop: 10,
		width: "100%"
	},
	buttonItem: {
		marginVertical: 6,
		borderRadius: 40
	},
	input: {
		width: "100%",
		alignSelf: "center",
		marginTop: 10,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
	logoutFab: {
		position: "absolute",
		top: 40,
		right: 12,
		zIndex: 20,
		paddingVertical: 6,
		paddingHorizontal: 10,
		borderRadius: 10,
		borderWidth: 1,
	},
});
