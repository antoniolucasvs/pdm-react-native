import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { globalStyles } from "../../styles/globalStyles";
import Button from "../../components/Button";
import DescriptionInput from "../../components/DescriptionInput";
import CurrencyInput from "../../components/CurrencyInput";
import DatePicker from "../../components/DatePicker";
import CategoryPicker from "../../components/CategoryPicker";
import { MoneyContext } from "../../contexts/GlobalState";
import { colors } from "../../constants/colors";

/**
 * Tela "Adicionar Transação".
 *
 * Permite selecionar o tipo da transação (Despesa ou Receita) para
 * filtrar dinamicamente as categorias disponíveis.
 *
 * @returns {JSX.Element}
 */
export default function AddTransactions() {
  const { categories, loading, addTransaction } = useContext(MoneyContext);
  const valueInputRef = useRef();

  const [transactionType, setTransactionType] = useState("expense"); // "expense" | "income"

  const filteredCategories = useMemo(() => {
    const targetIncome = transactionType === "income";
    return categories.filter((c) => !!c.isIncome === targetIncome);
  }, [categories, transactionType]);

  const defaultCategoryId = useMemo(() => {
    return filteredCategories.length > 0 ? filteredCategories[0].id : "";
  }, [filteredCategories]);

  const buildInitialForm = () => ({
    description: "",
    value: 0,
    date: new Date(),
    categoryId: defaultCategoryId,
  });

  const [form, setForm] = useState(buildInitialForm);
  const [submitting, setSubmitting] = useState(false);

  // mantém o categoryId default coerente com a lista de categorias filtradas
  useEffect(() => {
    if (filteredCategories.length > 0) {
      const exists = filteredCategories.some((c) => c.id === form.categoryId);
      if (!exists) {
        setForm((prev) => ({ ...prev, categoryId: filteredCategories[0].id }));
      }
    } else {
      setForm((prev) => ({ ...prev, categoryId: "" }));
    }
  }, [filteredCategories]);

  const handleAdd = async () => {
    if (!form.description.trim()) {
      Alert.alert("Informe a descrição.");
      return;
    }
    if (!form.value || form.value <= 0) {
      Alert.alert("Informe um valor maior que zero.");
      return;
    }
    if (!form.categoryId) {
      Alert.alert("Selecione uma categoria.");
      return;
    }

    setSubmitting(true);
    try {
      await addTransaction({
        description: form.description.trim(),
        value: form.value,
        date: form.date,
        categoryId: form.categoryId,
      });
      // Limpa os campos mantendo o tipo de transação selecionado
      setForm({
        description: "",
        value: 0,
        date: new Date(),
        categoryId: defaultCategoryId,
      });
      Alert.alert("Transação adicionada com sucesso!");
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message ?? "Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.secondaryText}>Carregando categorias...</Text>
      </View>
    );
  }

  if (categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <Text style={globalStyles.primaryText}>
          Nenhuma categoria cadastrada.
        </Text>
        <Text style={globalStyles.secondaryText}>
          Vá até a aba &quot;Categorias&quot; para criar a primeira.
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={globalStyles.screenContainer}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView style={globalStyles.content}>
          <View style={styles.form}>
            {/* Seletor Tipo de Transação */}
            <View>
              <Text style={globalStyles.inputLabel}>Tipo de transação</Text>
              <View style={styles.typeRow}>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    transactionType === "expense" && styles.typeButtonExpenseActive,
                  ]}
                  onPress={() => setTransactionType("expense")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      transactionType === "expense" && styles.typeButtonTextActive,
                    ]}
                  >
                    Despesa
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.typeButton,
                    transactionType === "income" && styles.typeButtonIncomeActive,
                  ]}
                  onPress={() => setTransactionType("income")}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.typeButtonText,
                      transactionType === "income" && styles.typeButtonTextActive,
                    ]}
                  >
                    Receita
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <DescriptionInput
              form={form}
              setForm={setForm}
              valueInputRef={valueInputRef}
            />
            <CurrencyInput
              form={form}
              setForm={setForm}
              valueInputRef={valueInputRef}
            />
            <DatePicker form={form} setForm={setForm} />
            <CategoryPicker
              form={form}
              setForm={setForm}
              categories={filteredCategories}
            />
          </View>
          <Button onPress={handleAdd} disabled={submitting}>
            {submitting ? "Salvando..." : "Adicionar"}
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
    marginBottom: 40,
    marginTop: 10,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  typeRow: {
    flexDirection: "row",
    gap: 8,
  },
  typeButton: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.secondaryText + "40",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  typeButtonExpenseActive: {
    backgroundColor: colors.negativeText,
    borderColor: colors.negativeText,
  },
  typeButtonIncomeActive: {
    backgroundColor: colors.positiveText,
    borderColor: colors.positiveText,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryText,
  },
  typeButtonTextActive: {
    color: colors.primaryContrast,
  },
});
