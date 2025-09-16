import { SafeAreaView } from "react-native-safe-area-context";
import {
	Text,
	Button,
	TextInput,
	StyleSheet,
	ActivityIndicator,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	View,
} from "react-native";
import { useRouter } from "expo-router";
import ItemLoja from "../src/components/ItemLoja";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { deleteUser } from "firebase/auth";
import {
	auth,
	db,
	addDoc,
	collection,
	getDocs,
} from "../src/services/firebaseConfig";
import { useAuth } from "../src/context/AuthContext";
import ThemeToggleButton from "../src/components/ThemeToggleButton";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import * as Notifications from "expo-notifications";

export default function HomeScreen() {
	const { t } = useTranslation();
	const { colors } = useTheme();
	const { user, signOut } = useAuth();
	const router = useRouter();
	const [nomeProduto, setNomeProduto] = useState("");

	interface Item {
		id: string;
		nomeProduto: string;
		isChecked: boolean;
	}
	const [listaItems, setListaItems] = useState<Item[]>([]);

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
			await addDoc(collection(db, "tasks"), {
				nomeProduto: nomeProduto,
				isChecked: false,
			});
			setNomeProduto(""); // limpa o TextInput
			Alert.alert("Sucesso", "Produto salvo com sucesso.");
			await buscarTasks(); // 🔄 atualiza a lista após salvar
		} catch (e) {
			console.log("Erro ao criar o produto", e);
		}
	};

	const buscarTasks = async () => {
		try {
			const querySnapshot = await getDocs(collection(db, "tasks"));
			const tasks: Item[] = [];
			querySnapshot.forEach((item) => {
				tasks.push({
					...(item.data() as Omit<Item, "id">),
					id: item.id,
				});
			});
			setListaItems(tasks);
		} catch (e) {
			console.log("Erro ao carregar as tasks", e);
		}
	};

	// Notificação local
	const dispararNotificacao = async () => {
		await Notifications.scheduleNotificationAsync({
			content: {
				title: "Promoções do dia!",
				body: "Aproveite as melhores ofertas!!",
			},
			trigger: { type: "timeInterval", seconds: 2, repeats: false } as Notifications.TimeIntervalTriggerInput,
		});
	};

	useEffect(() => {
		const sub = Notifications.addNotificationReceivedListener((notification) => {
			console.log("Notificação recebida: ", notification);
		});
		return () => sub.remove();
	}, []);

	useEffect(() => {
		(async () => {
			const { status: existingStatus } = await Notifications.getPermissionsAsync();
			if (existingStatus !== "granted") {
				await Notifications.requestPermissionsAsync();
			}
		})();
	}, []);

	useEffect(() => {
		buscarTasks();
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

				{/* Input */}
				<TextInput
					placeholder="Digite o nome do produto"
					placeholderTextColor="#6B7280"
					style={[
						styles.input,
						{
							backgroundColor: "lightgray",
							color: colors.text,
						},
					]}
					value={nomeProduto}
					onChangeText={setNomeProduto}
					onSubmitEditing={salvarItem}
					returnKeyType="done"
				/>

				{/* Lista */}
				{listaItems.length <= 0 ? (
					<ActivityIndicator />
				) : (
					<FlatList
						data={listaItems}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{ paddingVertical: 8 }}
						renderItem={({ item }) => (
							<ItemLoja
								nomeProduto={item.nomeProduto}
								isChecked={item.isChecked}
								id={item.id}
							/>
						)}
					/>
				)}
				{/* Ações / Botões */}
				<View style={styles.actions}>


					{/* Grupo de botões com espaçamento */}
					<View style={styles.buttonGroup}>
						<View style={styles.buttonItem}>
							<Button title="Realizar logoff" onPress={realizarLogoff} />
						</View>

						<View style={styles.buttonItem}>
							<Button
								title="Alterar Senha"
								color="orange"
								onPress={() => router.push("/AlterarSenhaScreen")}
							/>
						</View>

						<View style={styles.buttonItem}>
							<Button title="Excluir" color="red" onPress={excluirConta} />
						</View>

						<View style={styles.buttonItem}>
							<Button
								title="Disparar notificação"
								color="purple"
								onPress={dispararNotificacao}
							/>
						</View>
					</View>
				</View>


				<ThemeToggleButton />

			</KeyboardAvoidingView>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 20 },
	welcome: {
		marginBottom: 12,
		fontSize: 26,
		textAlign: "center",
		fontWeight: "600"
	},
	actions: {
		marginBottom: 16
	},
	buttonGroup: {
		marginTop: 10,
		width: "100%",
	},
	buttonItem: {
		marginVertical: 6,
		borderRadius: 40
	},
	input: {
		width: "100%",
		alignSelf: "center",
		marginTop: 16,
		borderRadius: 10,
		paddingHorizontal: 16,
		paddingVertical: 12,
	},
});
