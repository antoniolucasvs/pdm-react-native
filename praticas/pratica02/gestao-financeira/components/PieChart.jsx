import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { G, Circle } from "react-native-svg";
import { colors } from "../constants/colors";

/**
 * Gráfico de Rosca (Donut Chart) desenvolvido em SVG puro.
 * Suporta múltiplas fatias e exibe o resumo financeiro no centro.
 *
 * @param {{
 *   data: { key: string, name: string, value: number, color: string }[],
 *   totalLabel: string
 * }} props
 */
export default function PieChart({ data = [], totalLabel = "Total" }) {
  const radius = 70;
  const strokeWidth = 16;
  const size = 180;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  // Filtrar apenas itens com valor maior que 0
  const activeSlices = useMemo(() => {
    return data.filter((item) => item.value > 0);
  }, [data]);

  // Valor total acumulado
  const totalValue = useMemo(() => {
    return activeSlices.reduce((sum, item) => sum + item.value, 0);
  }, [activeSlices]);

  // Mapeamento das fatias com seus comprimentos e offsets correspondentes
  const slices = useMemo(() => {
    let accumulatedValue = 0;
    return activeSlices.map((item) => {
      const percentage = item.value / totalValue;
      const strokeLength = percentage * circumference;
      const strokeOffset = -(accumulatedValue / totalValue) * circumference;
      accumulatedValue += item.value;

      return {
        ...item,
        percentage,
        strokeLength,
        strokeOffset,
      };
    });
  }, [activeSlices, totalValue, circumference]);

  return (
    <View style={styles.container}>
      <View style={styles.chartWrapper}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <G rotation="-90" origin={`${center}, ${center}`}>
            {/* Círculo de fundo cinza caso não haja transações */}
            {totalValue === 0 ? (
              <Circle
                cx={center}
                cy={center}
                r={radius}
                stroke={colors.inactive || "#E0E0E0"}
                strokeWidth={strokeWidth}
                fill="none"
                opacity={0.2}
              />
            ) : (
              slices.map((slice) => (
                <Circle
                  key={slice.key}
                  cx={center}
                  cy={center}
                  r={radius}
                  stroke={slice.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={`${slice.strokeLength} ${circumference}`}
                  strokeDashoffset={slice.strokeOffset}
                  strokeLinecap="round"
                  fill="none"
                />
              ))
            )}
          </G>
        </Svg>

        {/* Texto centralizado no meio da rosca */}
        <View style={styles.centerTextContainer}>
          <Text style={styles.totalLabel}>{totalLabel}</Text>
          <Text style={styles.totalValue}>
            {totalValue.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </Text>
        </View>
      </View>

      {/* Legenda simples */}
      {totalValue > 0 && (
        <View style={styles.legendContainer}>
          {slices.map((slice) => (
            <View key={slice.key} style={styles.legendItem}>
              <View style={[styles.legendColor, { backgroundColor: slice.color }]} />
              <Text style={styles.legendText} numberOfLines={1}>
                {slice.name} ({Math.round(slice.percentage * 100)}%)
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartWrapper: {
    position: "relative",
    width: 180,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
  },
  centerTextContainer: {
    position: "absolute",
    justifyContent: "center",
    alignItems: "center",
    width: 120,
    height: 120,
  },
  totalLabel: {
    fontSize: 12,
    color: colors.secondaryText || "#999999",
    textTransform: "uppercase",
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: colors.primaryText || "#333333",
    marginTop: 4,
  },
  legendContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 12,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  legendColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    fontSize: 12,
    color: colors.primaryText || "#555555",
  },
});
