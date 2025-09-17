import { SafeAreaView } from "react-native-safe-area-context";
import {
	Text, TextInput, StyleSheet, ActivityIndicator, FlatList,
	KeyboardAvoidingView, Platform, View, Alert,
} from "react-native";
import { useRouter } from "expo-router";
import ItemLoja from "../src/components/ItemLoja";
import { useEffect, useState } from "react";
import { deleteUser } from "firebase/auth";
import ThemedButton from "../src/components/ThemedButton";
import { auth, addDoc } from "../src/services/firebaseConfig";
import { userTasksCol } from "../src/services/firestorePaths";
import { useAuth } from "../src/context/AuthContext";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";
import { onSnapshot, query, orderBy } from "firebase/firestore";

type Item = { id: string; nomeProduto: string; isChecked: boolean };

export default function HomeScreen() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const { user, signOut } = useAuth();
	const router = useRouter();

	const [nomeProduto, setNomeProduto] = useState("");
	const [listaItems, setListaItems] = useState<Item[]>([]);
	const [loadingList, setLoadingList] = useState(true);

	const realizarLogoff = async () => {
		try {
			await signOut();
			router.replace("/");
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
			Alert.alert(t("error") || "Erro", t("logoutError") || "Erro ao fazer logout");
		}
	};

	const excluirConta = () => {
		Alert.alert(
			t("confirmDelete") || "Confirmar Exclusão",
			t("confirmDeleteMessage") ||
			"Tem certeza que deseja excluir sua conta? Essa ação não poderá ser desfeita.",
			[
				{ text: t("cancel") || "Cancelar", style: "cancel" },
				{
					text: t("delete") || "Excluir",
					style: "destructive",
					onPress: async () => {
						try {
							const currentUser = auth.currentUser;
							if (currentUser) {
								await deleteUser(currentUser);
								Alert.alert(
									t("accountDeleted") || "Conta Excluída",
									t("accountDeletedMessage") || "Sua conta foi excluída com sucesso."
								);
								router.replace("/");
							} else {
								Alert.alert("Error", "Nenhum usuário logado");
							}
						} catch (error) {
							console.log("Erro ao excluir conta");
							Alert.alert("Error", "Não foi possível excluir a conta");
						}
					},
				},
			]
		);
	};

	const salvarItem = async () => {
		try {
			const uid = auth.currentUser?.uid;
			if (!uid) return Alert.alert("Erro", "Usuário não autenticado.");
			const nome = nomeProduto.trim();
			if (!nome) return;

			await addDoc(userTasksCol(uid), {
				userId: uid,
				nomeProduto: nome,
				isChecked: false,
				createdAt: Date.now(),
			});

			setNomeProduto("");
		} catch (e: any) {
			console.log("Erro ao salvar:", e?.code ?? e?.message ?? e);
			Alert.alert("Erro", "Não foi possível salvar o item.");
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
				const tasks: Item[] = snap.docs.map((d) => {
					const data = d.data() as any;
					return {
						id: d.id,
						nomeProduto: String(data?.nomeProduto ?? ""),
						isChecked: Boolean(data?.isChecked),
					};
				});
				setListaItems(tasks);
				setLoadingList(false);
			},
			(err) => {
				console.log("onSnapshot error", err);
				setLoadingList(false);
			}
		);
		return () => unsub();
	}, []);

	return (
		<SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
			<KeyboardAvoidingView
				style={styles.container}
				behavior={Platform.OS === "ios" ? "padding" : "height"}
				keyboardVerticalOffset={20}
			>
				<Text style={[styles.welcome, { color: colors.text }]}>
					Seja bem-vindo, você está logado!
				</Text>

				<TextInput
					placeholder="Digite o nome do produto"
					placeholderTextColor="#6B7280"
					style={[styles.input, { backgroundColor: "lightgray", color: colors.text }]}
					value={nomeProduto}
					onChangeText={setNomeProduto}
					onSubmitEditing={salvarItem}
					returnKeyType="done"
				/>

				{loadingList ? (
					<ActivityIndicator />
				) : (
					<FlatList
						data={listaItems}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingVertical: 8 }}
						renderItem={({ item }) => (
							<ItemLoja
								id={item.id}
								nomeProduto={item.nomeProduto}
								isChecked={item.isChecked}
							/>
						)}
					/>
				)}

				<View style={styles.actions}>
					<View style={styles.buttonGroup}>
						<View style={styles.buttonItem}>
							<ThemedButton title="Realizar logoff" onPress={realizarLogoff} />
						</View>
						<View style={styles.buttonItem}>
							<ThemedButton
								title="Alterar Senha"
								onPress={() => router.push("/AlterarSenhaScreen")}
							/>
						</View>
						<View style={styles.buttonItem}>
							<ThemedButton title="Excluir" onPress={excluirConta} />
						</View>
						<View style={styles.buttonItem}>
							<ThemedButton
								title="Disparar notificação"
								onPress={async () =>
									Notifications.scheduleNotificationAsync({
										content: { title: "Promoções do dia!", body: "Aproveite as melhores ofertas!!" },
										trigger: { type: "timeInterval", seconds: 2, repeats: false } as Notifications.TimeIntervalTriggerInput,
									})
								}
							/>
						</View>
					</View>
				</View>
			</KeyboardAvoidingView>

			<ThemeToggleButton />
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	welcome: { marginBottom: 12, fontSize: 26, textAlign: "center", fontWeight: "600" },
	actions: { marginBottom: 16 },
	buttonGroup: { marginTop: 10, width: "100%" },
	buttonItem: { marginVertical: 6, borderRadius: 40 },
	input: {
		width: "100%",
		alignSelf: "center",
		marginTop: 16,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
});
