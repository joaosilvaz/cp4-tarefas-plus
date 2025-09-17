import React, { useEffect } from "react";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import Constants from "expo-constants";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import { auth } from "../services/firebaseConfig";
import ThemedButton from "./ThemedButton";

WebBrowser.maybeCompleteAuthSession();

export default function GoogleButton() {
    const extra: any =
        Constants.expoConfig?.extra ??
        (Constants.manifest as any)?.extra ??
        {};

    // ✅ SDKs recentes aceitam `clientId`
    const clientId: string | undefined = extra.googleWebClientId;

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: extra.googleWebClientId,
        responseType: "id_token",
        scopes: ["openid", "profile", "email"],
        selectAccount: true,
    });

    useEffect(() => {
        (async () => {
            if (response?.type !== "success") return;

            // Aqui chega o id_token
            const idToken =
                response.authentication?.idToken || (response as any)?.params?.id_token;

            console.log("id_token =", idToken); // (apenas para debug)

            if (!idToken) return;

            // Use o id_token para logar no Firebase
            const cred = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, cred);
        })();
    }, [response]);

    return (
        <ThemedButton
            title="Continuar com Google"
            onPress={() => promptAsync()}
            disabled={!request || !clientId}
        />
    );
}
