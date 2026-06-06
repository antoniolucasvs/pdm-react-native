import { useContext, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";
import Button from "../components/Button";

export default function Login() {
  const { login } = useContext(MoneyContext);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async () => {
    const trimmedName = username.trim();
    if (!trimmedName) {
      Alert.alert("Erro", "Por favor, insira o seu nome.");
      return;
    }

    if (trimmedName.length < 2) {
      Alert.alert("Erro", "O nome deve conter pelo menos 2 caracteres.");
      return;
    }

    setLoading(true);
    try {
      await login(trimmedName);
      router.replace("/welcome");
    } catch (error) {
      Alert.alert("Erro ao entrar", "Não foi possível realizar o login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <View style={styles.card}>
          <View style={styles.iconContainer}>
            <MaterialIcons name="account-balance-wallet" size={64} color={colors.primary} />
          </View>
          
          <Text style={styles.title}>Finanças Pessoais</Text>
          <Text style={styles.subtitle}>Gerencie suas receitas e despesas de forma simples</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Qual o seu nome?</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome..."
              placeholderTextColor={colors.inactive}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={30}
            />
          </View>

          <Button onPress={handleLogin} disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  iconContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: colors.primaryText,
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 20,
  },
  inputContainer: {
    width: "100%",
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.primaryText,
    marginBottom: 8,
  },
  input: {
    height: 48,
    backgroundColor: "#F9F9F9",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#333333",
  },
});
