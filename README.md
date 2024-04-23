# Vertical-Logistica

Este é um desafio técnico para o projeto Vertical-Logistica, que visa desenvolver um sistema de gerenciamento de pedidos, usuários e produtos para uma empresa de logística.

## Ferramentas

- Typescript
- ExpressJS
- Prisma ORM 
- PostgreSQL
- Jest
- Swagger

## Rodando o projeto
Use a imagem docker ou clone o repositório.
- Docker
  * Iterativo 

    ```
    docker run -it --name test-vertical-logistica -p 3000:3000 josehpequeno/vertical-logistica:latest
    ```

  * Não iterativo 
    ```
    docker run -d --name test-vertical-logistica -p 3000:3000 josehpequeno/vertical-logistica:latest
    ```
  
- clone o repositório

```
git clone https://github.com/Josehpequeno/Vertical-Logistica.git 
```

- Entre no diretório 

```
cd Vertical-Logistica 
```

- Instale as dependências 

```
npm i
```

- Inicie banco de dados no docker-compose file

```
docker-compose up -d
```

- Copie o arquivo .env 
```
cp .env.example .env
```

- Rode as migrations
```
npx prisma migrate dev
```

- Inicie o servidor 

```
npm start
```

## Design do Banco de Dados

O banco de dados deste projeto consiste em quatro tabelas principais: `Users`, `Products`, `ProductsOrder` e `Orders`, com relacionamentos entre elas.

### Tabela `Users`

Esta tabela armazena informações sobre os usuários do sistema e possui um relacionamento de um para muitos com a tabela `Orders`.

| Campo     | Tipo    | Descrição                |
|-----------|---------|--------------------------|
| user_id   | Inteiro | Identificador do usuário |
| name      | Texto   | Nome do usuário          |


### Tabela `Products`

Esta tabela armazena informações sobre os produtos disponíveis no sistema.

| Campo       | Tipo    | Descrição                  |
|-------------|---------|----------------------------|
| product_id  | Inteiro | Identificador do produto   |
| value       | Decimal | Valor do produto           |


### Tabela `ProductOrders`

Esta tabela armazena informações sobre os produtos já pedido relacionados a tabela `Orders` com quem possui um relacionamento de muitos para muitos.

| Campo       | Tipo    | Descrição                  |
|-------------|---------|----------------------------|
| product_id  | Inteiro | Identificador do produto   |
| order_id    | Inteiro | Identificador da order     |
| value       | Decimal | Valor do produto           |


### Tabela `Orders`

Esta tabela armazena informações sobre os pedidos feitos pelos usuários e possui relacionamentos com as tabelas `Users` e `ProductOrders`.

| Campo     | Tipo    | Descrição                   |
|-----------|---------|-----------------------------|
| order_id  | Inteiro | Identificador do pedido     |
| user_id   | Inteiro | Identificador do usuário    |
| total     | Decimal | Valor total do pedido       |
| date      | String  | Data do pedido em formato de texto|

### Relacionamentos

- A tabela `Users` tem um relacionamento de um para muitos com a tabela `Orders`. Cada usuário pode ter vários pedidos.
- A tabela `Orders` tem um relacionamento de um para muitos com a tabela `ProductOrders`. Um pedido pode conter vários produtos.

