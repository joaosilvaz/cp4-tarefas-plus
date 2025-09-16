import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
} from "react-native";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../src/services/firebaseConfig";
import { useRouter } from "expo-router";
import { useAuth } from "../src/context/AuthContext";
import { useTheme } from "../src/context/ThemeContext";
import { useTranslation } from "react-i18next";
import ThemeToggleButton from "../src/components/ThemeToggleButton";

export default function CadastroScreen() {
    const { setUser } = useAuth();
    const router = useRouter();
    const { t, i18n } = useTranslation();
    const { theme, colors } = useTheme();
    const isLight = theme === "light";

    const flagBtnStyle = {
        backgroundColor: isLight ? "#222222" : "#fff",
        borderColor: isLight ? "#fff" : "#222222",
    };

    // Estados para armazenar os valores digitados
    const [nome, setNome] = useState("");
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [confirmarSenha, setConfirmarSenha] = useState("");
    const [loading, setLoading] = useState(false);

    // Função para mudar o idioma
    const mudarIdioma = (lang: string) => {
        i18n.changeLanguage(lang);
    };

    // Função para validar os dados
    const validarDados = () => {
        if (!nome.trim()) {
            Alert.alert(
                t("attention") || "Atenção",
                t("enterFullName") || "Digite seu nome completo!",
            );
            return false;
        }

        if (!email.trim()) {
            Alert.alert(
                t("attention") || "Atenção",
                t("enterEmail") || "Digite seu e-mail!",
            );
            return false;
        }

        if (!senha) {
            Alert.alert(
                t("attention") || "Atenção",
                t("enterPassword") || "Digite sua senha!",
            );
            return false;
        }

        if (senha.length < 6) {
            Alert.alert(
                t("attention") || "Atenção",
                t("passwordMinLength") || "A senha deve ter pelo menos 6 caracteres!",
            );
            return false;
        }

        if (senha !== confirmarSenha) {
            Alert.alert(
                t("attention") || "Atenção",
                t("passwordsDontMatch") || "As senhas não coincidem!",
            );
            return false;
        }
        return true;
    };

    // Função para cadastro com email e senha
    const handleCadastro = async () => {
        if (!validarDados()) return;

        setLoading(true);
        try {
            // Criar usuário
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                email.trim(),
                senha,
            );
            const user = userCredential.user;

            // Atualizar o perfil com o nome
            await updateProfile(user, {
                displayName: nome.trim(),
            });

            // Atualizar o contexto
            setUser(user);

            Alert.alert(
                t("success") || "Sucesso",
                t("accountCreatedSuccessfully") || "Conta criada com sucesso!",
                [
                    {
                        text: "OK",
                        onPress: () => router.replace("/HomeScreen"),
                    },
                ],
            );
        } catch (error: unknown) {
            console.log("Erro no cadastro:", error);

            let errorMessage =
                t("registrationError") || "Erro ao criar conta. Tente novamente.";

            if (error instanceof Error) {
                if (error.message.includes("auth/email-already-in-use")) {
                    errorMessage =
                        t("emailAlreadyInUse") || "Este e-mail já está cadastrado.";
                } else if (error.message.includes("auth/invalid-email")) {
                    errorMessage = t("invalidEmail") || "E-mail inválido.";
                } else if (error.message.includes("auth/weak-password")) {
                    errorMessage = t("weakPassword") || "Senha muito fraca.";
                }
            }

            Alert.alert(t("error") || "Erro", errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: colors.background }]}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={[styles.titulo, { color: colors.text }]}>
                        {t("createAccount") || "Criar Conta"}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                        {t("signUpToContinue") || "Cadastre-se para continuar"}
                    </Text>
                </View>

                <View style={styles.form}>
                    {/* Campo Nome */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t("fullName") || "Nome completo"}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                },
                            ]}
                            placeholder={t("enterYourFullName") || "Digite seu nome completo"}
                            placeholderTextColor={colors.textSecondary}
                            value={nome}
                            onChangeText={setNome}
                            editable={!loading}
                            autoCapitalize="words"
                        />
                    </View>

                    {/* Campo Email */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t("email") || "E-mail"}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                },
                            ]}
                            placeholder={t("enterYourEmail") || "Digite seu e-mail"}
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            value={email}
                            onChangeText={setEmail}
                            editable={!loading}
                        />
                    </View>

                    {/* Campo Senha */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t("password") || "Senha"}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                },
                            ]}
                            placeholder={
                                t("enterYourPassword") || "Digite sua senha (min. 6 caracteres)"
                            }
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                            value={senha}
                            onChangeText={setSenha}
                            editable={!loading}
                        />
                    </View>

                    {/* Campo Confirmar Senha */}
                    <View style={styles.inputContainer}>
                        <Text style={[styles.inputLabel, { color: colors.text }]}>
                            {t("confirmPassword") || "Confirmar senha"}
                        </Text>
                        <TextInput
                            style={[
                                styles.input,
                                {
                                    color: colors.text,
                                    borderColor: colors.border,
                                    backgroundColor: colors.inputBackground,
                                },
                            ]}
                            placeholder={t("confirmYourPassword") || "Confirme sua senha"}
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry
                            value={confirmarSenha}
                            onChangeText={setConfirmarSenha}
                            editable={!loading}
                        />
                    </View>

                    {/* Botão Cadastrar */}
                    <TouchableOpacity
                        style={[styles.botao, { backgroundColor: colors.primary }]}
                        onPress={handleCadastro}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.textoBotao}>
                                {t("register") || "Cadastrar"}
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Divisor */}
                    <View style={styles.divider}>
                        <View
                            style={[styles.dividerLine, { backgroundColor: colors.border }]}
                        />
                        <Text style={[styles.dividerText, { color: colors.textSecondary }]}>
                            {t("or") || "ou"}
                        </Text>
                        <View
                            style={[styles.dividerLine, { backgroundColor: colors.border }]}
                        />
                    </View>
                </View>
                <View style={styles.languageContainer} key={theme}>
                    <TouchableOpacity
                        onPress={() => mudarIdioma("en")}
                        style={[styles.langIconBtn, styles.langShadow, flagBtnStyle]}
                        accessibilityLabel="Switch to English"
                        activeOpacity={0.8}
                    >
                        <Text style={styles.flag}>🇺🇸</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => mudarIdioma("pt")}
                        style={[styles.langIconBtn, styles.langShadow, flagBtnStyle]}
                        accessibilityLabel="Mudar para Português"
                        activeOpacity={0.8}
                    >
                        <Text style={styles.flag}>🇧🇷</Text>
                    </TouchableOpacity>
                </View>
                
                <ThemeToggleButton />

                {/* Link para Login */}
                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => router.back()}>
                        <Text style={[styles.backToLoginText, { color: colors.text }]}>
                            {t("alreadyHaveAccount") || "Já tem uma conta?"}{" "}
                            <Text style={{ color: colors.primary }}>
                                {t("signIn") || "Entrar"}
                            </Text>
                        </Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 25,
    },
    scrollContainer: {
        flexGrow: 1,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 30,
    },
    titulo: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 8,
        textAlign: "center",
    },
    subtitle: {
        fontSize: 16,
        textAlign: "center",
    },
    form: {
        marginBottom: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 8,
    },
    input: {
        borderRadius: 12,
        padding: 13,
        fontSize: 16,
        borderWidth: 1.5,
    },
    botao: {
        padding: 13,
        borderRadius: 12,
        alignItems: "center",
        marginBottom: 10,
    },
    textoBotao: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
    },
    divider: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 10,
    },
    dividerLine: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        marginHorizontal: 15,
        fontSize: 16,
    },
    languageContainer: {
        flexDirection: "row",
        justifyContent: "center",
        marginBottom: 10,
        gap: 12,
    },
    langIconBtn: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
    },
    langShadow: {
        shadowColor: "#000",
        shadowOpacity: 0.06,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 3 },
        elevation: 2,
    },
    flag: { fontSize: 24 },

    footer: {
        alignItems: "center",
        marginTop: 20,
    },
    backToLoginText: {
        fontSize: 16,
        textAlign: "center",
    },
});