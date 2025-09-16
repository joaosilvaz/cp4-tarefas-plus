#  📱 CP4 — Lista Tarefas Plus (Expo + Firebase)

### Aplicativo mobile de lista de tarefas com login, Firestore por usuário (tempo real), tema claro, i18n PT/EN com bandeiras 🇧🇷/🇺🇸, notificações locais e navegação por arquivos usando expo-router.
---

## ✨ Funcionalidades

- Autenticação E-mail/Senha (Firebase Auth)
- Sessão persistente
- Firestore por usuário users/{uid}/tasks com sync em tempo real (onSnapshot)
- Tema claro por padrão + botões principais pretos
- Internacionalização (PT/EN) com troca por bandeiras (emoji) 🇧🇷/🇺🇸
- Notificações locais agendadas (expo-notifications)
- expo-router (file-based routing)
- Organização em contexts / services / screens / components

---

## 🧱 Stack

- Expo SDK 54, React Native 0.81, React 19
- expo-router • Firebase Web SDK (Auth + Firestore)
- i18next + react-i18next
- expo-notifications, expo-device, expo-constants
- @react-native-async-storage/async-storage

---
## Estrutura do Projeto

     app/
      _layout.tsx
      index.tsx
      HomeScreen.tsx
      CadastrarScreen.tsx
      AlterarSenhaScreen.tsx
    
    src/
      components/
        ThemeToggleButton.jsx
        ItemLoja.tsx
      context/
        AuthContext.tsx
        ThemeContext.tsx
      locales/
        pt.json
        en.json
      services/
        firebaseConfig.ts
        i18n.ts
        notifications.ts
    
    assets/
      (imagens/ícones se necessário)
    
    package.json
    babel.config.js
    app.json

---

## 🚀🚀 Como rodar localmente

Instalar dependências

npm install

npx expo install

## 👨‍💻 Autores
João Vitor da Silva Nascimento RM554694 
Fernando Henrique Aguiar RM
Rafael

FIAP 
