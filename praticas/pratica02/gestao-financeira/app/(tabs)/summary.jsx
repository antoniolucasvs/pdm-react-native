import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MoneyContext } from "../../contexts/GlobalState";
import SummaryItem from "../../components/SummaryItem";
import PieChart from "../../components/PieChart";
import BarChart from "../../components/BarChart";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

/**
 * Tela "Resumo".
 *
 * Exibe o saldo geral das contas em destaque e o gráfico de rosca com seletor local.
 * Abaixo, lista separadamente o detalhamento de Despesas e Receitas por categoria.
 *
 * @returns {JSX.Element}
 */
export default function Summary() {
  const { transactions, categories, loading } = useContext(MoneyContext);
  const [chartType, setChartType] = useState("expense"); // "expense" | "income"
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

  const { totalsById, totalIncome, totalExpense, balance } = useMemo(() => {
    const acc = {};
    let saldo = 0;
    let incomeSum = 0;
    let expenseSum = 0;

    for (const c of categories) acc[c.id] = 0;

    for (const t of transactions) {
      const txDate = new Date(t.date);
      const matchesPeriod =
        selectedPeriod.month === null ||
        (txDate.getMonth() === selectedPeriod.month &&
          txDate.getFullYear() === selectedPeriod.year);

      if (!matchesPeriod) continue;

      const numericValue = Number(t.value);
      if (acc[t.categoryId] !== undefined) {
        acc[t.categoryId] += numericValue;
      }
      const cat = t.category ?? categories.find((c) => c.id === t.categoryId);
      if (cat?.isIncome) {
        saldo += numericValue;
        incomeSum += numericValue;
      } else {
        saldo -= numericValue;
        expenseSum += numericValue;
      }
    }
    return { totalsById: acc, totalIncome: incomeSum, totalExpense: expenseSum, balance: saldo };
  }, [transactions, categories, selectedPeriod]);

  const expenseCategories = useMemo(() => {
    return categories.filter((c) => !c.isIncome);
  }, [categories]);

  const incomeCategories = useMemo(() => {
    return categories.filter((c) => !!c.isIncome);
  }, [categories]);

  const chartData = useMemo(() => {
    const targetCats = chartType === "income" ? incomeCategories : expenseCategories;
    return targetCats.map((c) => ({
      key: c.id,
      name: c.displayName,
      value: totalsById[c.id] ?? 0,
      color: c.background,
    }));
  }, [chartType, incomeCategories, expenseCategories, totalsById]);

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const balanceStyle =
    balance >= 0 ? globalStyles.positiveText : globalStyles.negativeText;

  // Filtrar apenas categorias com movimentações maiores que zero
  const activeExpenses = expenseCategories.filter((c) => (totalsById[c.id] ?? 0) > 0);
  const activeIncomes = incomeCategories.filter((c) => (totalsById[c.id] ?? 0) > 0);

  return (
    <View style={globalStyles.screenContainer}>
      <ScrollView style={globalStyles.content}>
        
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

        {/* Card de Resumo Geral */}
        <View style={styles.summaryCard}>
          <View style={styles.balanceHeader}>
            <Text style={styles.cardLabel}>Saldo Geral</Text>
            <Text style={[styles.cardValueBig, balanceStyle]}>
              {balance.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </Text>
          </View>
          <View style={globalStyles.line} />
          <View style={styles.cardRow}>
            <View style={styles.cardColumn}>
              <Text style={styles.cardSublabel}>Receitas</Text>
              <Text style={[styles.cardValue, globalStyles.positiveText]}>
                {totalIncome.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
            <View style={[styles.cardColumn, { borderLeftWidth: 1, borderLeftColor: colors.secondaryText + "30" }]}>
              <Text style={styles.cardSublabel}>Despesas</Text>
              <Text style={[styles.cardValue, globalStyles.negativeText]}>
                {totalExpense.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </Text>
            </View>
          </View>
        </View>

        {/* Gráfico de Rosca com Toggle Local */}
        <View style={styles.chartSection}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === "expense" && styles.toggleButtonActive]}
              onPress={() => setChartType("expense")}
            >
              <Text style={[styles.toggleButtonText, chartType === "expense" && styles.toggleButtonTextActive]}>
                Despesas
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, chartType === "income" && styles.toggleButtonActive]}
              onPress={() => setChartType("income")}
            >
              <Text style={[styles.toggleButtonText, chartType === "income" && styles.toggleButtonTextActive]}>
                Receitas
              </Text>
            </TouchableOpacity>
          </View>

          <PieChart
            data={chartData}
            totalLabel={chartType === "expense" ? "Total Despesas" : "Total Receitas"}
          />
        </View>

        <BarChart
          data={chartData}
          title={chartType === "expense" ? "Participação por Categoria (Gastos)" : "Participação por Categoria (Ganhos)"}
        />

        {/* Listas Abaixo */}
        
        {/* Seção Despesas */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.negativeText }]}>
            Detalhamento de Despesas
          </Text>
          {activeExpenses.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma despesa registrada.</Text>
          ) : (
            activeExpenses.map((category) => (
              <SummaryItem
                key={category.id}
                category={category}
                value={totalsById[category.id] ?? 0}
              />
            ))
          )}
        </View>

        {/* Seção Receitas */}
        <View style={styles.listSection}>
          <Text style={[styles.sectionTitle, { color: colors.positiveText }]}>
            Detalhamento de Receitas
          </Text>
          {activeIncomes.length === 0 ? (
            <Text style={styles.emptyText}>Nenhuma receita registrada.</Text>
          ) : (
            activeIncomes.map((category) => (
              <SummaryItem
                key={category.id}
                category={category}
                value={totalsById[category.id] ?? 0}
              />
            ))
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  balanceHeader: {
    alignItems: "center",
    marginBottom: 12,
  },
  cardLabel: {
    fontSize: 14,
    color: colors.primaryText,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValueBig: {
    fontSize: 26,
    fontWeight: "800",
    marginTop: 4,
  },
  cardRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  cardColumn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 4,
  },
  cardSublabel: {
    fontSize: 12,
    color: colors.secondaryText,
    fontWeight: "600",
  },
  cardValue: {
    fontSize: 16,
    fontWeight: "700",
    marginTop: 2,
  },
  chartSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: "#ececec",
    borderRadius: 8,
    padding: 4,
    width: "100%",
    marginBottom: 12,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 6,
    alignItems: "center",
    borderRadius: 6,
  },
  toggleButtonActive: {
    backgroundColor: "#ffffff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  toggleButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.primaryText,
  },
  toggleButtonTextActive: {
    color: colors.primary,
  },
  listSection: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 8,
  },
  periodFilterContainer: {
    paddingVertical: 8,
    backgroundColor: "transparent",
    marginBottom: 8,
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

