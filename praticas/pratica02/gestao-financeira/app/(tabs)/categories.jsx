import { useContext, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { MoneyContext } from "../../contexts/GlobalState";
import Button from "../../components/Button";
import CategoryItem from "../../components/CategoryItem";
import { globalStyles } from "../../styles/globalStyles";
import { colors } from "../../constants/colors";

const PRESET_COLORS = [
  "#DE9AC3",
  "#DEA17B",
  "#E6E088",
  "#AB8FBE",
  "#82C9DE",
  "#FFB6B6",
  "#9ED9A9",
  "#F5C26B",
];

const PRESET_ICONS = [
  "label",
  "fastfood",
  "directions-car",
  "home",
  "school",
  "local-hospital",
  "sports-esports",
  "flight",
  "work",
  "fitness-center",
  "movie",
  "phone",
  "shopping-cart",
  "pets",
  "build",
  "attach-money",
  "card-giftcard",
  "trending-up",
  "eco",
  "beach-access",
  "face",
  "child-care",
  "bolt",
  "water-drop",
  "key",
  "credit-card",
  "receipt",
  "security",
  "local-laundry-service",
  "commute",
  "storefront",
  "music-note",
];

/**
 * Tela "Categorias".
 *
 * Permite listar, criar e editar categorias, separadas visualmente por abas (Receitas/Despesas).
 *
 * @returns {JSX.Element}
 */
export default function CategoriesScreen() {
  const { categories, loading, addCategory, removeCategory, updateCategory } =
    useContext(MoneyContext);

  const [activeTab, setActiveTab] = useState("expense"); // "expense" | "income"
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [icon, setIcon] = useState("label");
  const [background, setBackground] = useState(PRESET_COLORS[0]);
  const [isIncome, setIsIncome] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const resetForm = () => {
    setName("");
    setDisplayName("");
    setIcon("label");
    setBackground(PRESET_COLORS[0]);
    setIsIncome(activeTab === "income");
    setEditingCategory(null);
  };

  const handleSave = async () => {
    if (!name.trim() || name.trim().length < 2) {
      Alert.alert("Informe um identificador (mín. 2 letras, sem espaços).");
      return;
    }
    if (!displayName.trim() || displayName.trim().length < 2) {
      Alert.alert("Informe o nome de exibição (mín. 2 letras).");
      return;
    }
    if (!icon.trim()) {
      Alert.alert("Selecione um ícone.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim().toLowerCase().replace(/\s+/g, "_"),
        displayName: displayName.trim(),
        icon: icon.trim(),
        background,
        isIncome: isIncome,
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
        Alert.alert("Categoria atualizada!");
      } else {
        await addCategory(payload);
        Alert.alert("Categoria criada!");
      }
      resetForm();
      setModalVisible(false);
    } catch (e) {
      Alert.alert("Erro ao salvar", e.message ?? "Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (item) => {
    setEditingCategory(item);
    setName(item.name);
    setDisplayName(item.displayName);
    setIcon(item.icon);
    setBackground(item.background);
    setIsIncome(!!item.isIncome);
    setModalVisible(true);
  };

  const handleDelete = (item) => {
    Alert.alert(
      "Excluir categoria",
      `Deseja excluir "${item.displayName}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCategory(item.id);
            } catch (e) {
              Alert.alert("Erro ao excluir", e.message ?? "Tente novamente.");
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const filteredCategories = useMemo(() => {
    const targetIncome = activeTab === "income";
    return categories.filter((c) => !!c.isIncome === targetIncome);
  }, [categories, activeTab]);

  if (loading && categories.length === 0) {
    return (
      <View style={[globalStyles.screenContainer, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={globalStyles.screenContainer}>
      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.tabHeaderRow}>
            {/* Abas Despesas / Receitas */}
            <View style={styles.tabContainer}>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "expense" && styles.tabButtonActive]}
                onPress={() => setActiveTab("expense")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "expense" && styles.tabButtonTextActive,
                  ]}
                >
                  Despesas
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tabButton, activeTab === "income" && styles.tabButtonActive]}
                onPress={() => setActiveTab("income")}
              >
                <Text
                  style={[
                    styles.tabButtonText,
                    activeTab === "income" && styles.tabButtonTextActive,
                  ]}
                >
                  Receitas
                </Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.addButton}
              onPress={() => {
                resetForm();
                setIsIncome(activeTab === "income");
                setModalVisible(true);
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={24} color={colors.primaryContrast} />
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.categoryRow}>
            <CategoryItem category={item} />
            <View style={styles.categoryInfo}>
              <Text style={globalStyles.primaryText}>{item.displayName}</Text>
              <Text style={globalStyles.secondaryText}>
                {item.isDefault ? "padrão" : "personalizada"}
              </Text>
            </View>
            {!item.isDefault && (
              <View style={styles.actionButtons}>
                <TouchableOpacity
                  onPress={() => handleEdit(item)}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name="edit"
                    size={22}
                    color={colors.primary}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  hitSlop={8}
                >
                  <MaterialIcons
                    name="delete-outline"
                    size={22}
                    color={colors.negativeText}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      />

      {/* Modal for Creating/Editing Category */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => {
          resetForm();
          setModalVisible(false);
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            resetForm();
            setModalVisible(false);
          }}
        >
          <View
            style={styles.modalContent}
            onStartShouldSetResponder={() => true} // Prevent closing when clicking content
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingCategory ? "Editar categoria" : "Nova categoria"}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  resetForm();
                  setModalVisible(false);
                }}
              >
                <MaterialIcons name="close" size={24} color={colors.primaryText} />
              </TouchableOpacity>
            </View>

            <View style={styles.formContainer}>
              {/* Seletor Tipo: Despesa / Receita */}
              <View>
                <Text style={globalStyles.inputLabel}>Tipo</Text>
                <View style={styles.typeRow}>
                  <TouchableOpacity
                    style={[styles.typeButton, !isIncome && styles.typeButtonActive]}
                    onPress={() => setIsIncome(false)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.typeButtonText, !isIncome && styles.typeButtonTextActive]}
                    >
                      Despesa
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.typeButton, isIncome && styles.typeButtonActive]}
                    onPress={() => setIsIncome(true)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[styles.typeButtonText, isIncome && styles.typeButtonTextActive]}
                    >
                      Receita
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Identificador</Text>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="ex.: health"
                  autoCapitalize="none"
                  style={globalStyles.input}
                />
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Nome de exibição</Text>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="ex.: Saúde"
                  style={globalStyles.input}
                />
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Ícone</Text>
                <ScrollView
                  style={styles.iconScrollContainer}
                  nestedScrollEnabled={true}
                  showsVerticalScrollIndicator={true}
                >
                  <View style={styles.iconRow}>
                    {PRESET_ICONS.map((ic) => (
                      <TouchableOpacity
                        key={ic}
                        onPress={() => setIcon(ic)}
                        style={[
                          styles.iconDot,
                          icon === ic && styles.iconDotSelected,
                        ]}
                      >
                        <MaterialIcons
                          name={ic}
                          size={20}
                          color={icon === ic ? colors.primaryContrast : colors.primaryText}
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View>
                <Text style={globalStyles.inputLabel}>Cor</Text>
                <View style={styles.colorRow}>
                  {PRESET_COLORS.map((c) => (
                    <TouchableOpacity
                      key={c}
                      onPress={() => setBackground(c)}
                      style={[
                        styles.colorDot,
                        { backgroundColor: c },
                        background === c && styles.colorDotSelected,
                      ]}
                    />
                  ))}
                </View>
              </View>

              <Button onPress={handleSave} disabled={submitting}>
                {submitting
                  ? "Salvando..."
                  : editingCategory
                  ? "Salvar alterações"
                  : "Adicionar categoria"}
              </Button>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    gap: 12,
    paddingBottom: 24,
  },
  tabHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
    marginTop: 4,
  },
  formContainer: {
    gap: 12,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryText,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 6,
  },
  categoryInfo: {
    flex: 1,
  },
  colorRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  colorDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "transparent",
  },
  colorDotSelected: {
    borderColor: colors.primaryText,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    gap: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primaryText,
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingVertical: 4,
  },
  iconScrollContainer: {
    maxHeight: 100,
    backgroundColor: "#fafafa",
    borderRadius: 8,
    padding: 8,
    borderWidth: 1,
    borderColor: colors.secondaryText + "20",
  },
  iconDot: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.secondaryText + "40",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  iconDotSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  actionButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  tabContainer: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#ececec",
    borderRadius: 8,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  tabButtonActive: {
    backgroundColor: "#ffffff",
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: colors.primaryText,
  },
  tabButtonTextActive: {
    color: colors.primary,
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
  typeButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
