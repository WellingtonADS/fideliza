# **Fideliza+**

## **Sobre o Projeto**

O projeto **Fideliza** é uma plataforma de fidelização de clientes composta por três serviços principais que operam em um único repositório (monorepo). O objetivo é fornecer uma solução integrada para gerenciar programas de fidelidade, permitir que clientes pontuem e resgatem prêmios, e oferecer um painel de gestão completo para as empresas parceiras.

---

## **Estrutura do Monorepo**

Este repositório está organizado em três diretórios principais, cada um contendo um serviço separado da plataforma:

* **fideliza\_backend**: A API de back-end que gerencia toda a lógica de negócios, autenticação e banco de dados. Foi desenvolvida com FastAPI.  
* **fideliza\_cliente**: A aplicação móvel para clientes, construída em React Native. É a interface onde os usuários interagem com o programa de fidelidade.  
* **fideliza\_gestao**: A aplicação móvel de gestão para administradores e colaboradores, também em React Native. É utilizada para gerenciar clientes, prêmios e relatórios.

---

## **Tecnologias Utilizadas**

### **fideliza\_backend**

* **Framework**: [FastAPI](https://fastapi.tiangolo.com/)  
* **Linguagem**: Python 3.10+  
* **Base de Dados**: [PostgreSQL](https://www.postgresql.org/)  
* **ORM**: [SQLAlchemy](https://www.sqlalchemy.org/) (com suporte asyncio)  
* **Validação de Dados**: [Pydantic](https://www.google.com/search?q=https://docs.pydantic.dev/)  
* **Autenticação**: JWT com python-jose e passlib

### **fideliza\_cliente e fideliza\_gestao**

* **Framework**: [React Native](https://reactnative.dev/)  
* **Linguagem**: [TypeScript](https://www.typescriptlang.org/)  
* **Build Tools (Android)**: Gradle (versão 8.14.1)  
* **Build Tools (iOS)**: CocoaPods (versão \>= 1.13)

---

## **Como Começar**

Siga os passos abaixo para configurar e rodar a plataforma completa em seu ambiente de desenvolvimento.

### **Pré-requisitos**

* [Node.js](https://nodejs.org/en/) (versão 18 ou superior)  
* [Python 3.10+](https://www.python.org/)  
* [PostgreSQL](https://www.postgresql.org/) a correr localmente.  
* [Ambiente de desenvolvimento React Native configurado](https://reactnative.dev/docs/environment-setup) (JDK 17, Android Studio, etc.)

### **1\. Configuração do Backend**

1. Navegue até o diretório fideliza\_backend.  
2. Crie e ative um ambiente virtual.  
3. Instale as dependências com pip install \-r requirements.txt.  
4. Crie o arquivo .env com as variáveis de ambiente necessárias, incluindo DATABASE\_URL, SECRET\_KEY, ALGORITHM e ACCESS\_TOKEN\_EXPIRE\_MINUTES.  
5. Execute o script fideliza\_db.sql no seu banco de dados PostgreSQL para criar a estrutura das tabelas.  
6. Inicie o servidor:  
   Bash  
   uvicorn src.main:app \--reload

   A API estará disponível em http://127.0.0.1:8000.

### **2\. Configuração e Execução das Aplicações Móveis**

1. Para o **fideliza\_cliente**, navegue até o diretório correspondente e instale as dependências:  
   Bash  
   cd fideliza\_cliente  
   npm install

   Em seguida, configure a conexão com a API no arquivo App.tsx.  
2. Para o **fideliza\_gestao**, siga o mesmo processo:  
   Bash  
   cd fideliza\_gestao  
   npm install

   Ajuste a conexão com a API no arquivo App.tsx desta pasta.  
3. Para rodar qualquer uma das aplicações, use um emulador ou dispositivo físico e execute o comando correspondente:  
   * **Android**: npx react-native run-android  
   * **iOS**: npx react-native run-ios

---

## **Contribuindo**

Contribuições são bem-vindas\! Se tiver interesse em contribuir, por favor, abra uma issue ou pull request.

---

## **Licença**

Este projeto é desenvolvido com base nas informações e tecnologias encontradas nos arquivos do repositório.