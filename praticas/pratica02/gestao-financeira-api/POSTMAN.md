# API Documentation (Postman Tests)

This file documents the API routes available in the `gestao-financeira-api` and how to test them.

## Setup in Postman
- Base URL: `http://localhost:3000`
- To use an environment variable:
  - Create a new Environment in Postman.
  - Set a variable named `baseUrl` with the value `http://localhost:3000`.
  - Use `{{baseUrl}}/categories` or `{{baseUrl}}/transactions` in your requests.

---

## 1. Categories (`/categories`)

### List Categories
* **Method:** `GET`
* **Path:** `{{baseUrl}}/categories`
* **Response Example (200 OK):**
  ```json
  [
    {
      "id": "cly1234567890abcdef",
      "name": "alimentacao",
      "displayName": "Alimentação",
      "icon": "restaurant",
      "background": "#FF5733",
      "isIncome": false,
      "isDefault": true
    }
  ]
  ```

### Create Category
* **Method:** `POST`
* **Path:** `{{baseUrl}}/categories`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "name": "lazer",
    "displayName": "Lazer & Diversão",
    "icon": "movie",
    "background": "#9B59B6",
    "isIncome": false
  }
  ```
* **Response Example (201 Created):**
  ```json
  {
    "id": "cly1234567890abcdef2",
    "name": "lazer",
    "displayName": "Lazer & Diversão",
    "icon": "movie",
    "background": "#9B59B6",
    "isIncome": false,
    "isDefault": false
  }
  ```

### Update Category
* **Method:** `PUT`
* **Path:** `{{baseUrl}}/categories/:id`
* **Headers:** `Content-Type: application/json`
* **Body (JSON - partial fields):**
  ```json
  {
    "displayName": "Lazer e Shows",
    "background": "#8E44AD"
  }
  ```
* **Response Example (200 OK):**
  ```json
  {
    "id": "cly1234567890abcdef2",
    "name": "lazer",
    "displayName": "Lazer e Shows",
    "background": "#8E44AD",
    "icon": "movie",
    "isIncome": false,
    "isDefault": false
  }
  ```

### Delete Category
* **Method:** `DELETE`
* **Path:** `{{baseUrl}}/categories/:id`
* **Response Example (204 No Content):** (No body returned)

---

## 2. Transactions (`/transactions`)

### List Transactions
* **Method:** `GET`
* **Path:** `{{baseUrl}}/transactions`
* **Response Example (200 OK):**
  ```json
  [
    {
      "id": "tx1234567890abc",
      "description": "Supermercado Semanal",
      "value": 150.50,
      "date": "2026-06-05T12:00:00.000Z",
      "categoryId": "cly1234567890abcdef",
      "category": {
        "id": "cly1234567890abcdef",
        "name": "alimentacao",
        "displayName": "Alimentação",
        "icon": "restaurant",
        "background": "#FF5733",
        "isIncome": false,
        "isDefault": true
      }
    }
  ]
  ```

### Create Transaction
* **Method:** `POST`
* **Path:** `{{baseUrl}}/transactions`
* **Headers:** `Content-Type: application/json`
* **Body (JSON):**
  ```json
  {
    "description": "Salário Mensal",
    "value": 5000.00,
    "date": "2026-06-05T09:00:00.000Z",
    "categoryId": "cly1234567890abcdef_income_id"
  }
  ```
* **Response Example (201 Created):**
  ```json
  {
    "id": "tx1234567890abd",
    "description": "Salário Mensal",
    "value": 5000.00,
    "date": "2026-06-05T09:00:00.000Z",
    "categoryId": "cly1234567890abcdef_income_id",
    "category": {
      "id": "cly1234567890abcdef_income_id",
      "name": "salario",
      "displayName": "Salário",
      "icon": "work",
      "background": "#2ECC71",
      "isIncome": true,
      "isDefault": true
    }
  }
  ```

### Update Transaction
* **Method:** `PUT`
* **Path:** `{{baseUrl}}/transactions/:id`
* **Headers:** `Content-Type: application/json`
* **Body (JSON - partial fields):**
  ```json
  {
    "description": "Salário Mensal com Bônus",
    "value": 5500.00
  }
  ```
* **Response Example (200 OK):**
  ```json
  {
    "id": "tx1234567890abd",
    "description": "Salário Mensal com Bônus",
    "value": 5500.00,
    "date": "2026-06-05T09:00:00.000Z",
    "categoryId": "cly1234567890abcdef_income_id",
    "category": {
      "id": "cly1234567890abcdef_income_id",
      "name": "salario",
      "displayName": "Salário",
      "icon": "work",
      "background": "#2ECC71",
      "isIncome": true,
      "isDefault": true
    }
  }
  ```

### Delete Transaction
* **Method:** `DELETE`
* **Path:** `{{baseUrl}}/transactions/:id`
* **Response Example (204 No Content):** (No body returned)
