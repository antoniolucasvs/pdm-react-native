import { createContext, useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../services/api";

export const MoneyContext = createContext();

/**
 * Provider global do app.
 *
 * Centraliza:
 *  - hidratação inicial das categorias e transações a partir da API REST;
 *  - estado de carregamento e erro de rede;
 *  - ações para criar/excluir transações e categorias mantendo o estado em sync.
 *
 * O estado **não** é mais persistido em AsyncStorage. A fonte de verdade é o
 * banco MySQL exposto pela API (`gestao-financeira-api/`).
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {JSX.Element} Provider com o objeto de contexto exposto via `MoneyContext`.
 */
export default function GlobalState({ children }) {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      try {
        const storedUser = await AsyncStorage.getItem("@user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (e) {
        console.error("Error loading user:", e);
      } finally {
        setAuthLoading(false);
      }
    }
    loadUser();
  }, []);

  const login = useCallback(async (username) => {
    const newUser = { name: username };
    await AsyncStorage.setItem("@user", JSON.stringify(newUser));
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem("@user");
    setUser(null);
  }, []);

  /**
   * Recarrega categorias e transações do servidor em paralelo.
   *
   * @returns {Promise<void>} Resolve quando ambos os GETs terminarem.
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [cats, txs] = await Promise.all([
        api.listCategories(),
        api.listTransactions(),
      ]);
      setCategories(cats);
      setTransactions(txs);
    } catch (e) {
      setError(e.message ?? "Falha ao carregar dados do servidor");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  /**
   * Cria uma nova transação no servidor e adiciona-a ao estado local.
   *
   * @param {{description: string, value: number, date: Date|string, categoryId: string}} data
   * @returns {Promise<object>} Transação criada (já com a categoria expandida).
   */
  const addTransaction = useCallback(async (data) => {
    const created = await api.createTransaction(data);
    setTransactions((prev) => [created, ...prev]);
    return created;
  }, []);

  /**
   * Exclui uma transação no servidor e remove-a do estado local.
   *
   * @param {string} id - id (cuid) da transação.
   * @returns {Promise<void>}
   */
  const removeTransaction = useCallback(async (id) => {
    await api.deleteTransaction(id);
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /**
   * Atualiza uma transação no servidor e no estado local.
   *
   * @param {string} id - id da transação.
   * @param {object} data - dados atualizados.
   * @returns {Promise<object>}
   */
  const updateTransaction = useCallback(async (id, data) => {
    const updated = await api.updateTransaction(id, data);
    setTransactions((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  }, []);

  /**
   * Cria uma nova categoria no servidor e adiciona-a ao estado local.
   *
   * @param {{name: string, displayName: string, icon: string, background: string, isIncome?: boolean}} data
   * @returns {Promise<object>} Categoria criada.
   */
  const addCategory = useCallback(async (data) => {
    const created = await api.createCategory(data);
    setCategories((prev) =>
      [...prev, created].sort((a, b) => a.displayName.localeCompare(b.displayName))
    );
    return created;
  }, []);

  /**
   * Exclui uma categoria no servidor e remove-a do estado local.
   * Categorias padrão (`isDefault`) são bloqueadas pelo back-end.
   *
   * @param {string} id - id (cuid) da categoria.
   * @returns {Promise<void>}
   */
  const removeCategory = useCallback(async (id) => {
    await api.deleteCategory(id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }, []);

  /**
   * Atualiza uma categoria no servidor e no estado local.
   *
   * @param {string} id - id da categoria.
   * @param {object} data - dados atualizados.
   * @returns {Promise<object>}
   */
  const updateCategory = useCallback(async (id, data) => {
    const updated = await api.updateCategory(id, data);
    setCategories((prev) =>
      prev
        .map((c) => (c.id === id ? updated : c))
        .sort((a, b) => a.displayName.localeCompare(b.displayName))
    );
    return updated;
  }, []);

  return (
    <MoneyContext.Provider
      value={{
        transactions,
        categories,
        loading,
        error,
        refresh,
        addTransaction,
        removeTransaction,
        updateTransaction,
        addCategory,
        removeCategory,
        updateCategory,
        user,
        authLoading,
        login,
        logout,
      }}
    >
      {children}
    </MoneyContext.Provider>
  );
}
