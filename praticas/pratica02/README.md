# 🪙 Gestão Financeira - Entrega de Atividade

Este repositório contém a entrega da atividade prática de Desenvolvimento de Dispositivos Móveis (PDM). O projeto consiste em um aplicativo de controle financeiro completo com **Frontend (React Native/Expo)** integrado a um **Backend (Node.js/Express/Prisma/PostgreSQL)**.

---

## ⚡ Modo Rápido (Executar tudo com 1 clique)

Para facilitar a execução simultânea do Frontend e do Backend, disponibilizamos scripts automatizados na raiz da pasta de entrega:

*   **No Windows**: Dê dois cliques no arquivo `start.bat` (ou execute `./start.bat` no terminal).
*   **No macOS / Linux**: Execute o comando `./start.sh` no terminal (lembre-se de dar permissão de execução com `chmod +x start.sh` se necessário).

Esses scripts vão abrir duas janelas de terminal separadas, instalar as dependências de cada projeto, executar as migrações/seed do banco de dados (Prisma) e iniciar os servidores automaticamente.

> [!WARNING]
> **Configuração do `.env` Requerida Primeiro**:
> Antes de executar o script rápido (`start.bat` ou `start.sh`), certifique-se de configurar o arquivo `.env` na pasta `gestao-financeira-api`!
> 
> 1. Copie o arquivo `gestao-financeira-api/.env.example` para `gestao-financeira-api/.env`.
> 2. Abra o `.env` criado e configure a variável `DATABASE_URL` com as credenciais do seu banco PostgreSQL/MySQL local para que as migrações do Prisma funcionem corretamente.

> [!NOTE]
> **Alternativa caso o terminal/CMD do sistema esteja bloqueado por políticas do Windows**:
> Se o arquivo `.bat` não abrir por restrições do sistema, você pode usar os comandos do Node.js diretamente pelo editor de código (VS Code, Cursor, etc.), que usa o terminal do próprio editor. Na raiz da pasta `EntregaAtvPdm`, execute:
> 
> 1. **Instalar todas as dependências**:
>    ```bash
>    npm run install-all
>    ```
> 2. **Iniciar o front e o back concorrentemente**:
>    ```bash
>    npm start
>    ```
> *(Essa alternativa utiliza o pacote `concurrently` interno para rodar ambas as aplicações na mesma aba do terminal).*

---

## 🚀 Como Executar o Projeto Manualmente

Siga os passos abaixo caso prefira configurar e executar cada parte individualmente.

### 💻 1. Configurando o Backend (`gestao-financeira-api`)

O backend gerencia as transações e categorias no banco de dados.

1. **Navegue até a pasta do backend**:
   ```bash
   cd gestao-financeira-api
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Configuração de Variáveis de Ambiente (`.env`)**:
   * Copie o arquivo de exemplo `.env.example` para `.env`:
     ```bash
     cp .env.example .env
     ```
   * Abra o `.env` e configure a sua string de conexão `DATABASE_URL` do banco PostgreSQL.
     *(Exemplo: `DATABASE_URL="postgresql://postgres:sua_senha@localhost:5432/gestao_financeira"`)*

4. **Execute as Migrações do Banco de Dados**:
   ```bash
   npm run prisma:migrate
   ```

5. **Rode o Seed** (para criar as categorias padrão necessárias no app):
   ```bash
   npm run prisma:seed
   ```

6. **Inicie o servidor de desenvolvimento**:
   ```bash
   npm run dev
   ```
   *O servidor estará rodando em `http://localhost:3000`.*

---

### 📱 2. Configurando o Frontend (`gestao-financeira`)

O frontend é um aplicativo móvel híbrido feito com **Expo Router**.

1. **Abra um novo terminal e navegue até a pasta do frontend**:
   ```bash
   cd gestao-financeira
   ```

2. **Instale as dependências**:
   ```bash
   npm install
   ```

3. **Verifique a URL da API (Opcional)**:
   * Em `services/api.js`, certifique-se de que a `BASE_URL` aponta para o endereço correto da sua API local (ex: `http://localhost:3000` para emuladores iOS/Web ou o IP da sua máquina para emuladores Android/Dispositivos Físicos).

4. **Inicie o aplicativo com Expo**:
   ```bash
   npx expo start --clear
   ```
   *Pressione `w` no terminal para abrir no navegador web, ou escaneie o QR Code com o app **Expo Go** no celular.*

---

## 📬 3. Testando e Importando Rotas no Postman

Para facilitar a correção, as rotas da API foram testadas e exportadas.

1. **Collection do Postman**:
   * O arquivo da collection está localizado em: `gestao-financeira-api/postman/collection.json`
   * Importe-o no Postman através de: **File > Import** e selecione o arquivo.

2. **Configuração de Variáveis de Ambiente no Postman**:
   * Defina uma variável de ambiente chamada `baseUrl` apontando para `http://localhost:3000`.

3. **Documentação de Rotas**:
   * Para conferir os detalhes de cada endpoint, formato de requisição e respostas esperadas, leia o arquivo de documentação em: [gestao-financeira-api/POSTMAN.md](file:///c:/Users/NAYELE%20MOTA/Desktop/PdmEntrega/EntregaAtvPdm/gestao-financeira-api/POSTMAN.md).

---

## ✨ Funcionalidades Implementadas

* **Login Persistente (Offline)**: Tela de login com validação local que armazena a sessão usando `AsyncStorage`.
* **Saudação Personalizada**: Mensagem dinâmica com o nome do usuário autenticado no cabeçalho principal.
* **Gráficos de Resumo (SVG)**: Gráfico de Rosca (`PieChart`) e Gráfico de Barras Horizontal (`BarChart`) ordenado por valor.
* **Filtros por Período**: Seleção rápida de Mês/Ano nas telas de listagem e resumo financeiro.
* **CRUD de Transações**: Suporta a edição e exclusão de transações ao fazer um toque longo nos itens.
* **Categorias Customizadas**: Permite criar novas categorias dinamicamente além das 5 iniciais padrão.
