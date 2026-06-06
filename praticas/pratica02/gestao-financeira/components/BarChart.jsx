import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../constants/colors";

/**
 * Gráfico de Barras Horizontal.
 * Exibe a proporção de gastos ou receitas por categoria em formato de barra de progresso.
 *
 * @param {{
 *   data: { key: string, name: string, value: number, color: string }[],
 *   title: string
 * }} props
 * @returns {JSX.Element}
 */
export default function BarChart({ data = [], title = "Distribuição" }) {
  // Filtrar apenas categorias com valor maior que 0 e ordenar do maior para o menor
  const sortedData = useMemo(() => {
    return data
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  // Valor total acumulado
  const totalValue = useMemo(() => {
    return sortedData.reduce((sum, item) => sum + item.value, 0);
  }, [sortedData]);

  if (totalValue === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emptyText}>Sem dados suficientes para gerar o gráfico.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.barsWrapper}>
        {sortedData.map((item) => {
          const percentage = (item.value / totalValue) * 100;
          return (
            <View key={item.key} style={styles.barItem}>
              <View style={styles.barHeader}>
                <View style={styles.categoryInfo}>
                  <View style={[styles.colorDot, { backgroundColor: item.color }]} />
                  <Text style={styles.categoryName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.valueText}>
                  {item.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </Text>
              </View>

              <View style={styles.track}>
                <View
                  style={[
                    styles.fill,
                    {
                      width: `${percentage}%`,
                      backgroundColor: item.color,
                    },
                  ]}
                />
              </View>
              <Text style={styles.percentageText}>{Math.round(percentage)}% do total</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.primaryText,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 14,
    color: colors.secondaryText,
    fontStyle: "italic",
    textAlign: "center",
    paddingVertical: 12,
  },
  barsWrapper: {
    gap: 16,
  },
  barItem: {
    width: "100%",
  },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  colorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryText,
  },
  valueText: {
    fontSize: 14,
    fontWeight: "700",
    color: colors.primaryText,
  },
  track: {
    height: 10,
    width: "100%",
    backgroundColor: "#F0F0F0",
    borderRadius: 5,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 5,
  },
  percentageText: {
    fontSize: 11,
    color: colors.secondaryText,
    marginTop: 4,
    alignSelf: "flex-end",
  },
});
