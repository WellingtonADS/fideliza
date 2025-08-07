# **Aplicação Cliente \- Fideliza+ (React Native)**

Bem-vindo ao repositório da aplicação do cliente para o sistema **Fideliza+**. Esta aplicação foi construída em React Native e serve como a interface principal para os clientes interagirem com os seus programas de fidelidade.

## **milestone Marco de Projeto: Conclusão da Fase 4**

Este projeto representa a conclusão bem-sucedida da **Fase 4: Desenvolvimento do Aplicativo Móvel do Cliente**. A aplicação está funcional, testada e pronta para ser usada, consumindo a API backend do Fideliza+.

## **✨ Funcionalidades Implementadas**

* **Fluxo de Autenticação Completo:**  
  * Tela de **Registo** para novos clientes (POST /register/client/).  
  * Tela de **Login** segura (POST /token).  
  * Gestão de sessão com tokens JWT.  
* **Painel do Cliente (Dashboard):**  
  * Exibição dos dados do utilizador logado (nome e email).  
  * Geração e exibição do **QR Code** de fidelidade único do cliente.  
* **Consulta de Pontos e Prémios:**  
  * Busca e exibe o saldo de pontos do cliente em tempo real, agrupado por empresa (GET /points/my-points).  
  * Lista todos os prémios disponíveis, mostrando o progresso e o estado de resgate (redeemable) para cada um (GET /rewards/my-status).  
* **Resgate de Prémios:**  
  * Botão interativo para resgatar prémios.  
  * Caixa de diálogo de confirmação para evitar resgates acidentais.  
  * Comunicação com a API para "gastar" os pontos e registar o resgate (POST /rewards/redeem).  
  * Atualização automática do painel após o resgate.

## **🛠️ Tecnologias Utilizadas**

* **Framework:** [React Native](https://reactnative.dev/)  
* **Linguagem:** [TypeScript](https://www.typescriptlang.org/)  
* **Estilização:** StyleSheet (API nativa do React Native)

## **🚀 Como Executar o Projeto Localmente**

### **1\. Pré-requisitos**

* Ambiente de desenvolvimento React Native configurado (Node.js, JDK 17, Android Studio).  
* O [servidor backend do Fideliza+](https://www.google.com/search?q=https://github.com/wellingtonads/fideliza_backend) a correr localmente.

### **2\. Configuração do Ambiente**

1. **Clone o repositório (se aplicável):**  
   git clone \<URL\_DO\_SEU\_REPOSITORIO\_FRONTEND\>  
   cd fideliza\_cliente

2. **Instale as dependências:**  
   npm install  
   \# ou, se usar Yarn  
   \# yarn install

3. **Configure a Conexão com a API:**  
   * Abra o ficheiro App.tsx.  
   * No topo do ficheiro, encontre a constante API\_BASE\_URL.  
   * **IMPORTANTE:** Altere o endereço para corresponder ao seu ambiente de desenvolvimento:  
     * Para o **Emulador Android**, o endereço é geralmente: 'http://10.0.2.2:8000/api/v1'  
     * Para um **telemóvel físico** na mesma rede Wi-Fi, use o IP da sua máquina: 'http://SEU\_IP\_LOCAL:8000/api/v1'

### **3\. Executar a Aplicação**

1. Inicie um emulador a partir do Android Studio.  
2. No seu terminal, dentro da pasta fideliza\_cliente, execute:  
   npx react-native run-android

A aplicação será compilada e instalada no seu emulador, pronta para ser testada.