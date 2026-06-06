import { useContext } from "react";
import { StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { MoneyContext } from "../contexts/GlobalState";
import { colors } from "../constants/colors";
import Button from "../components/Button";

export default function Welcome() {
  const { user } = useContext(MoneyContext);
  const router = useRouter();

  const handleContinue = () => {
    router.replace("/(tabs)");
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.successIconContainer}>
          <MaterialIcons name="check-circle" size={80} color={colors.primary} />
        </View>

        <Text style={styles.greeting}>Olá, {user?.name}!</Text>
        
        <Text style={styles.welcomeText}>
          Seu acesso foi configurado com sucesso. Agora você pode gerenciar suas finanças de forma inteligente e organizada.
        </Text>

        <View style={styles.buttonContainer}>
          <Button onPress={handleContinue}>
            Começar a Usar
          </Button>
        </View>
      </View>
    </View>
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
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 26,
    fontWeight: "bold",
    color: colors.primary,
    textAlign: "center",
    marginBottom: 12,
  },
  welcomeText: {
    fontSize: 15,
    color: colors.primaryText,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 32,
  },
  buttonContainer: {
    width: "100%",
  },
});
