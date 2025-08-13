# **Aplicação de Gestão \- Fideliza+ (React Native)**

Bem-vindo ao repositório da **Aplicação de Gestão Fideliza+**. Esta aplicação, construída em React Native, é a ferramenta de trabalho para os Administradores e Colaboradores das empresas parceiras, permitindo-lhes gerir os seus programas de fidelidade de forma eficiente.

## **🚀 Início da Fase 5**

Este projeto marca o início da **Fase 5: Desenvolvimento do Aplicativo Móvel de Gestão**. O objetivo é construir uma aplicação completa que consuma a API backend do Fideliza+ e forneça todas as ferramentas de gestão necessárias.

## **✨ Funcionalidades Planeadas**

Esta aplicação irá incluir as seguintes funcionalidades, divididas por tipo de utilizador:

### **Para Colaboradores e Administradores:**

* **Autenticação Segura:** Tela de login para aceder ao painel de gestão.  
* **Atribuição de Pontos:**  
  * Funcionalidade de câmara para ler o QR Code dos clientes.  
  * Interface para atribuir pontos rapidamente após a identificação do cliente.  
  * Opção de pesquisa manual de clientes.

### **Apenas para Administradores:**

* **Gestão de Colaboradores:**  
  * Listar, criar, editar e excluir os colaboradores da sua empresa.  
* **Gestão de Prémios:**  
  * Listar e criar novos prémios (recompensas).  
* **Relatórios:**  
  * Visualização do painel de resumo com as principais métricas de desempenho da loja.

## **🛠️ Tecnologias Utilizadas**

* **Framework:** [React Native](https://reactnative.dev/)  
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)  
* **Estilização:** StyleSheet (API nativa do React Native)

## **🚀 Como Executar o Projeto Localmente**

### **1\. Pré-requisitos**

* Ambiente de desenvolvimento React Native configurado (Node.js, JDK 17, Android Studio).  
* O [servidor backend do Fideliza+](https://www.google.com/search?q=https://github.com/wellingtonads/fideliza_backend) a correr localmente.

### **2\. Configuração do Ambiente**

1. **Clone o repositório:**  
   git clone \<URL\_DO\_SEU\_REPOSITORIO\_GESTAO\>  
   cd fideliza\_gestao

2. **Instale as dependências:**  
   npm install

3. **Configure a Conexão com a API:**  
   * Abra o ficheiro App.tsx.  
   * No topo do ficheiro, encontre a constante API\_BASE\_URL.  
   * **IMPORTANTE:** Altere o endereço para corresponder ao seu ambiente de desenvolvimento:  
     * Para o **Emulador Android**, o endereço é geralmente: 'http://10.0.2.2:8000/api/v1'  
     * Para um **telemóvel físico** na mesma rede Wi-Fi, use o IP da sua máquina: 'http://SEU\_IP\_LOCAL:8000/api/v1'

### **3\. Executar a Aplicação**

1. Inicie um emulador a partir do Android Studio.  
2. No seu terminal, dentro da pasta fideliza\_gestao, execute:  
   npx react-native run-android

A aplicação será compilada e instalada no seu emulador, pronta para o desenvolvimento das próximas funcionalidades.