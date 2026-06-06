import { useContext, useEffect, useMemo, useState, useRef } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  TouchableWithoutFeedback,
} from "react-native";
import { MoneyContext } from "../../contexts/GlobalState";
import TransactionItem from "../../components/TransactionItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";
import Button from "../../components/Button";
import DescriptionInput from "../../components/DescriptionInput";
import CurrencyInput from "../../components/CurrencyInput";
import DatePicker from "../../components/DatePicker";
import CategoryPicker from "../../components/CategoryPicker";
import { MaterialIcons } from "@expo/vector-icons";

/**
 * Tela "Transações".
 *
 * Lista as transações vindas do servidor, com:
 *  - estado de carregamento inicial,
 *  - mensagem de erro com botão de "Tentar novamente",
 *  - pull-to-refresh,
 *  - toque longo para abrir modal de edição e exclusão.
 *
 * @returns {JSX.Element}
 */
export default function Transactions() {
  const {
    transactions,
    categories,
    loading,
    error,
    refresh,
    removeTransaction,
    updateTransaction,
    user,
    logout,
  } = useContext(MoneyContext);

  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [selectedPeriod, setSelectedPeriod] = useState({ month: null, year: null });

  const currentYear = new Date().getFullYear();
  const months = useMemo(() => [
    { label: "Todos", month: null, year: null },
    { label: "Jan", month: 0, year: currentYear },
    { label: "Fev", month: 1, year: currentYear },
    { label: "Mar", month: 2, year: currentYear },
    { label: "Abr", month: 3, year: currentYear },
    { label: "Mai", month: 4, year: currentYear },
    { label: "Jun", month: 5, year: currentYear },
    { label: "Jul", month: 6, year: currentYear },
    { label: "Ago", month: 7, year: currentYear },
    { label: "Set", month: 8, year: currentYear },
    { label: "Out", month: 9, year: currentYear },
    { label: "Nov", month: 10, year: currentYear },
    { label: "Dez", month: 11, year: currentYear },
  ], [currentYear]);

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    description: "",
    value: 0,
    date: new Date(),
    categoryId: "",
  });

  const valueInputRef = useRef();

  useEffect(() => {
    if (filterCategory !== "all") {
      const selectedCat = categories.find((c) => c.id === filterCategory);
      if (selectedCat) {
        const isSelectedInc = !!selectedCat.isIncome;
        if (
          (filterType === "expense" && isSelectedInc) ||
          (filterType === "income" && !isSelectedInc)
        ) {
          setFilterCategory("all");
        }
      }
    }
  }, [filterType, categories]);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const cat = t.category ?? categories.find((c) => c.id === t.categoryId);
      const matchesType =
        filterType === "all" ||
        (filterType === "expense" && !cat?.isIncome) ||
        (filterType === "income" && !!cat?.isIncome);
      const matchesCategory =
        filterCategory === "all" || t.categoryId === filterCategory;
      
      const txDate = new Date(t.date);
      const matchesPeriod =
        selectedPeriod.month === null ||
        (txDate.getMonth() === selectedPeriod.month &&
          txDate.getFullYear() === selectedPeriod.year);

      return matchesType && matchesCategory && matchesPeriod;
    });
  }, [transactions, categories, filterType, filterCategory, selectedPeriod]);

  const handleLongPress = (item) => {
    setSelectedTransaction(item);
    setForm({
      description: item.description,
      value: Number(item.value),
      date: new Date(item.date),
      categoryId: item.categoryId || item.category?.id || "",
    });
    setModalVisible(true);
  };

  const handleSave = async () => {
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
      await updateTransaction(selectedTransaction.id, {
        description: form.description.trim(),
        value: form.value,
        date: form.date,
        categoryId: form.categoryId,
      });
      setModalVisible(false);
      Alert.alert("Sucesso", "Transação atualizada com sucesso!");
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message ?? "Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Excluir transação",
      `Deseja excluir "${selectedTransaction.description}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            setSubmitting(true);
            try {
              await removeTransaction(selectedTransaction.id);
              setModalVisible(false);
              Alert.alert("Sucesso", "Transação excluída!");
            } catch (e) {
              Alert.alert("Erro ao excluir", e.message ?? "Tente novamente.");
            } finally {
              setSubmitting(false);
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading && transactions.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={globalStyles.secondaryText}>Carregando transações...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <Text style={globalStyles.primaryText}>
          Não foi possível carregar.
        </Text>
        <Text style={globalStyles.secondaryText}>{error}</Text>
        <TouchableOpacity onPress={refresh} style={styles.retry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View>
            <View style={styles.welcomeHeader}>
              <View>
                <Text style={styles.welcomeGreeting}>Olá, {user?.name} 👋</Text>
                <Text style={styles.welcomeDate}>Bem-vindo ao seu painel financeiro</Text>
              </View>
              <TouchableOpacity onPress={logout} style={styles.logoutButton}>
                <MaterialIcons name="exit-to-app" size={24} color={colors.negativeText} />
              </TouchableOpacity>
            </View>

            {/* Filtro de Mês/Ano */}
            <View style={styles.periodFilterContainer}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.periodFilterRow}
              >
                {months.map((p) => {
                  const isActive = selectedPeriod.month === p.month && selectedPeriod.year === p.year;
                  return (
                    <TouchableOpacity
                      key={p.label}
                      style={[styles.periodButton, isActive && styles.periodButtonActive]}
                      onPress={() => setSelectedPeriod({ month: p.month, year: p.year })}
                    >
                      <Text style={[styles.periodText, isActive && styles.periodTextActive]}>
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.filterContainer}>
              <View style={styles.typeFilterRow}>
              <TouchableOpacity
                style={[styles.typeFilterButton, filterType === "all" && styles.typeFilterButtonActive]}
                onPress={() => setFilterType("all")}
              >
                <Text style={[styles.typeFilterText, filterType === "all" && styles.typeFilterTextActive]}>
                  Todas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeFilterButton, filterType === "expense" && styles.typeFilterButtonActive]}
                onPress={() => setFilterType("expense")}
              >
                <Text style={[styles.typeFilterText, filterType === "expense" && styles.typeFilterTextActive]}>
                  Despesas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.typeFilterButton, filterType === "income" && styles.typeFilterButtonActive]}
                onPress={() => setFilterType("income")}
              >
                <Text style={[styles.typeFilterText, filterType === "income" && styles.typeFilterTextActive]}>
                  Receitas
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryFilterRow}
            >
              <TouchableOpacity
                style={[styles.catFilterButton, filterCategory === "all" && styles.catFilterButtonActive]}
                onPress={() => setFilterCategory("all")}
              >
                <Text style={[styles.catFilterText, filterCategory === "all" && styles.catFilterTextActive]}>
                  Todas
                </Text>
              </TouchableOpacity>
              {categories
                .filter((c) => {
                  if (filterType === "all") return true;
                  return filterType === "income" ? c.isIncome : !c.isIncome;
                })
                .map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[styles.catFilterButton, filterCategory === cat.id && styles.catFilterButtonActive]}
                    onPress={() => setFilterCategory(cat.id)}
                  >
                    <Text style={[styles.catFilterText, filterCategory === cat.id && styles.catFilterTextActive]}>
                      {cat.displayName}
                    </Text>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onLongPress={() => handleLongPress(item)}
            activeOpacity={0.7}
          >
            <TransactionItem {...item} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={globalStyles.secondaryText}>
            Nenhuma transação encontrada para este filtro.
          </Text>
        }
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refresh} />
        }
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView behavior="padding" style={styles.modalContent}>
              <Text style={styles.modalTitle}>Editar Transação</Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalForm}>
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
                    categories={categories}
                  />
                </View>

                <View style={styles.buttonContainer}>
                  <Button onPress={handleSave} disabled={submitting}>
                    {submitting ? "Salvando..." : "Salvar"}
                  </Button>

                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={handleDelete}
                    disabled={submitting}
                  >
                    <Text style={styles.deleteButtonText}>Excluir</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setModalVisible(false)}
                    disabled={submitting}
                  >
                    <Text style={styles.cancelButtonText}>Cancelar</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: 24,
  },
  retry: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  retryText: {
    color: colors.primaryContrast,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    maxHeight: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: colors.primaryText,
    marginBottom: 16,
    textAlign: "center",
  },
  modalForm: {
    gap: 12,
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
    marginTop: 10,
  },
  deleteButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 8,
    backgroundColor: colors.negativeText,
  },
  deleteButtonText: {
    color: colors.primaryContrast,
    fontSize: 18,
    fontWeight: "600",
  },
  cancelButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inactive,
  },
  cancelButtonText: {
    color: colors.primaryText,
    fontSize: 18,
    fontWeight: "600",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  typeFilterRow: {
    flexDirection: "row",
    backgroundColor: "#ececec",
    borderRadius: 8,
    padding: 4,
  },
  typeFilterButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  typeFilterButtonActive: {
    backgroundColor: "#ffffff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  typeFilterText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryText,
  },
  typeFilterTextActive: {
    color: colors.primary,
  },
  categoryFilterRow: {
    gap: 8,
    paddingVertical: 4,
  },
  catFilterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryText + "30",
    backgroundColor: "#ffffff",
  },
  catFilterButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  catFilterText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryText,
  },
  catFilterTextActive: {
    color: colors.primaryContrast,
  },
  welcomeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#ececec",
  },
  welcomeGreeting: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.primary,
  },
  welcomeDate: {
    fontSize: 12,
    color: colors.primaryText,
    marginTop: 2,
  },
  logoutButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#FDF0F2",
  },
  periodFilterContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
    backgroundColor: "#ffffff",
  },
  periodFilterRow: {
    gap: 8,
  },
  periodButton: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.secondaryText + "30",
    backgroundColor: "#ffffff",
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryText,
  },
  periodTextActive: {
    color: colors.primaryContrast,
  },
});
