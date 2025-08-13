import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert,
  Modal,
} from 'react-native';

import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

// --- Configuração da API ---
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// --- Definições de Tipos (TypeScript) ---
type ScreenType = 'login' | 'dashboard' | 'scanner';

interface User {
  id: number;
  email: string;
  name: string;
  user_type: 'ADMIN' | 'COLLABORATOR' | 'CLIENT';
  company_id?: number;
}

interface Reward {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
}

interface PointTransaction {
  id: number;
  points: number;
  client: { name: string };
  awarded_by: { name: string };
  created_at: string;
}

interface CompanyReport {
  total_points_awarded: number;
  total_rewards_redeemed: number;
  unique_customers: number;
}

interface AuthScreenProps {
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
}

interface DashboardScreenProps {
  user: User;
  authToken: string;
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  setScreen: React.Dispatch<React.SetStateAction<ScreenType>>;
}

interface ScannerScreenProps {
  authToken: string;
  setScreen: React.Dispatch<React.SetStateAction<ScreenType>>;
}

// --- Componente Principal da Aplicação ---
export default function App() {
  const [authToken, setAuthToken] = React.useState<string | null>(null);
  const [userData, setUserData] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [screen, setScreen] = React.useState<ScreenType>('login');

  const fetchUserData = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: User = await response.json();
      if (response.ok) {
        if (data.user_type === 'ADMIN' || data.user_type === 'COLLABORATOR') {
          setUserData(data);
        } else {
          Alert.alert("Acesso Negado", "Esta aplicação é apenas para Administradores e Colaboradores.");
          setAuthToken(null);
        }
      } else {
        setAuthToken(null);
      }
    } catch (error) {
      console.error('Erro ao buscar dados do utilizador:', error);
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
      setAuthToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (authToken) {
      fetchUserData(authToken);
      setScreen('dashboard');
    } else {
      setUserData(null);
      setScreen('login');
    }
  }, [authToken]);

  if (isLoading) {
    return <View style={styles.container}><ActivityIndicator size="large" color="#1d4ed8" /></View>;
  }

  if (screen === 'scanner' && userData && authToken) {
    return <ScannerScreen authToken={authToken} setScreen={setScreen} />;
  }

  if (screen === 'dashboard' && userData && authToken) {
    return <DashboardScreen user={userData} authToken={authToken} setAuthToken={setAuthToken} setScreen={setScreen} />;
  }

  return <LoginScreen setAuthToken={setAuthToken} />;
}

// --- Tela de Login ---
const LoginScreen: React.FC<AuthScreenProps> = ({ setAuthToken }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');

    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await fetch(`${API_BASE_URL}/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData.toString(),
      });
      const data = await response.json();
      if (response.ok) {
        setAuthToken(data.access_token);
      } else {
        setError(data.detail || 'Falha no login. Verifique as suas credenciais.');
      }
    } catch (e) {
      setError('Erro de conexão. Verifique a sua internet e o endereço da API.');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.authContainer}>
        <Text style={styles.title}>Fideliza+ Gestão</Text>
        <Text style={styles.subtitle}>Acesso para Administradores e Colaboradores</Text>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Senha"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.button}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// --- Tela do Leitor de QR Code ---
const ScannerScreen: React.FC<ScannerScreenProps> = ({ authToken, setScreen }) => {
  const handleAddPoints = async (clientId: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/points/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ client_identifier: clientId }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Sucesso!", `1 ponto foi adicionado com sucesso ao cliente ID ${clientId}.`);
      } else {
        Alert.alert("Erro", data.detail || "Não foi possível adicionar o ponto.");
      }
    } catch (error) {
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setScreen('dashboard');
    }
  };

  const onSuccess = (e: { data: string }) => {
    handleAddPoints(e.data);
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.off}
      topContent={
        <Text style={styles.centerText}>
          Aponte a câmara para o QR Code do cliente
        </Text>
      }
      bottomContent={
        <TouchableOpacity style={styles.buttonTouchable} onPress={() => setScreen('dashboard')}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      }
    />
  );
};


// --- Tela Principal (Dashboard) ---
const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, authToken, setAuthToken, setScreen }) => {
  const [clientId, setClientId] = React.useState('');
  const [isAddingPoints, setIsAddingPoints] = React.useState(false);
  const [collaborators, setCollaborators] = React.useState<User[]>([]);
  const [newCollabName, setNewCollabName] = React.useState('');
  const [newCollabEmail, setNewCollabEmail] = React.useState('');
  const [newCollabPassword, setNewCollabPassword] = React.useState('');
  const [isAddingCollab, setIsAddingCollab] = React.useState(false);
  const [rewards, setRewards] = React.useState<Reward[]>([]);
  const [newRewardName, setNewRewardName] = React.useState('');
  const [newRewardDescription, setNewRewardDescription] = React.useState('');
  const [newRewardPoints, setNewRewardPoints] = React.useState('');
  const [isAddingReward, setIsAddingReward] = React.useState(false);
  const [transactions, setTransactions] = React.useState<PointTransaction[]>([]);
  const [report, setReport] = React.useState<CompanyReport | null>(null);
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [editingCollab, setEditingCollab] = React.useState<User | null>(null);
  const [updatedName, setUpdatedName] = React.useState('');

  const fetchAdminData = async () => {
    try {
      const headers = { 'Authorization': `Bearer ${authToken}` };

      const [collabRes, rewardRes, transRes, reportRes] = await Promise.all([
        fetch(`${API_BASE_URL}/collaborators/`, { headers }),
        fetch(`${API_BASE_URL}/rewards/`, { headers }),
        fetch(`${API_BASE_URL}/points/transactions/`, { headers }),
        fetch(`${API_BASE_URL}/reports/summary`, { headers })
      ]);

      if (collabRes.ok) setCollaborators(await collabRes.json());
      if (rewardRes.ok) setRewards(await rewardRes.json());
      if (transRes.ok) setTransactions(await transRes.json());
      if (reportRes.ok) setReport(await reportRes.json());

    } catch (error) {
      console.error("Erro ao buscar dados de admin:", error);
      Alert.alert("Erro", "Não foi possível carregar os dados do painel.");
    }
  };

  React.useEffect(() => {
    if (user.user_type === 'ADMIN') {
      fetchAdminData();
    }
  }, [user]);

  const handleAddPoints = async () => {
    if (!clientId) {
      Alert.alert("Atenção", "Por favor, insira o ID do cliente.");
      return;
    }
    setIsAddingPoints(true);
    try {
      const response = await fetch(`${API_BASE_URL}/points/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ client_identifier: clientId }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Sucesso!", `1 ponto foi adicionado com sucesso ao cliente ID ${clientId}.`);
        setClientId('');
        if (user.user_type === 'ADMIN') fetchAdminData();
      } else {
        Alert.alert("Erro", data.detail || "Não foi possível adicionar o ponto.");
      }
    } catch (error) {
      console.error("Erro ao adicionar pontos:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setIsAddingPoints(false);
    }
  };

  const handleAddCollaborator = async () => {
    if (!newCollabName || !newCollabEmail || !newCollabPassword) {
      Alert.alert("Atenção", "Preencha todos os campos para adicionar um colaborador.");
      return;
    }
    setIsAddingCollab(true);
    try {
      const response = await fetch(`${API_BASE_URL}/collaborators/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name: newCollabName, email: newCollabEmail, password: newCollabPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Sucesso!", `Colaborador "${newCollabName}" adicionado.`);
        setNewCollabName('');
        setNewCollabEmail('');
        setNewCollabPassword('');
        fetchAdminData();
      } else {
        Alert.alert("Erro", data.detail || "Não foi possível adicionar o colaborador.");
      }
    } catch (error) {
      console.error("Erro ao adicionar colaborador:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setIsAddingCollab(false);
    }
  };

  const handleAddReward = async () => {
    if (!newRewardName || !newRewardPoints) {
      Alert.alert("Atenção", "Nome e Pontos são obrigatórios para criar um prémio.");
      return;
    }
    setIsAddingReward(true);
    try {
      const response = await fetch(`${API_BASE_URL}/rewards/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name: newRewardName, description: newRewardDescription, points_required: parseInt(newRewardPoints, 10) }),
      });
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Sucesso!", `Prémio "${newRewardName}" adicionado.`);
        setNewRewardName('');
        setNewRewardDescription('');
        setNewRewardPoints('');
        fetchAdminData();
      } else {
        Alert.alert("Erro", data.detail || "Não foi possível adicionar o prémio.");
      }
    } catch (error) {
      console.error("Erro ao adicionar prémio:", error);
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    } finally {
      setIsAddingReward(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
  };

  const handleDeleteCollaborator = async (collab: User) => {
    Alert.alert("Confirmar Exclusão", `Tem a certeza que deseja excluir o colaborador "${collab.name}"?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/collaborators/${collab.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${authToken}` },
              });
              if (response.ok) {
                Alert.alert("Sucesso!", `Colaborador "${collab.name}" excluído.`);
                fetchAdminData();
              } else {
                const data = await response.json();
                Alert.alert("Erro", data.detail || "Não foi possível excluir o colaborador.");
              }
            } catch (error) {
              Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
            }
          },
        },
      ]
    );
  };

  const openEditModal = (collab: User) => {
    setEditingCollab(collab);
    setUpdatedName(collab.name);
    setIsEditModalVisible(true);
  };

  const handleUpdateCollaborator = async () => {
    if (!updatedName || !editingCollab) {
      setIsEditModalVisible(false);
      return;
    }
    if (updatedName === editingCollab.name) {
      setIsEditModalVisible(false);
      return;
    }
    try {
      const response = await fetch(`${API_BASE_URL}/collaborators/${editingCollab.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${authToken}` },
        body: JSON.stringify({ name: updatedName }),
      });
      if (response.ok) {
        Alert.alert("Sucesso!", "Nome do colaborador atualizado.");
        fetchAdminData();
      } else {
        const data = await response.json();
        Alert.alert("Erro", data.detail || "Não foi possível atualizar o colaborador.");
      }
    } catch (error) {
      Alert.alert("Erro de Rede", "Não foi possível conectar ao servidor.");
    }
    finally {
      setIsEditModalVisible(false);
      setEditingCollab(null);
      setUpdatedName('');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.dashboardContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Bem-vindo(a),</Text>
              <Text style={styles.headerName}>{user.name}!</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoCardLabel}>Email</Text>
            <Text style={styles.infoCardValue}>{user.email}</Text>
            <View style={styles.divider} />
            <Text style={styles.infoCardLabel}>Função</Text>
            <Text style={styles.infoCardValue}>{user.user_type}</Text>
          </View>

          <View style={styles.featureCard}>
            <Text style={styles.featureTitle}>Pontuar Cliente</Text>
            <TouchableOpacity onPress={() => setScreen('scanner')} style={[styles.button, { marginBottom: 16, backgroundColor: '#16a34a' }]}>
              <Text style={styles.buttonText}>Escanear QR Code</Text>
            </TouchableOpacity>

            <Text style={styles.featureSubtitle}>Ou insira o ID manualmente:</Text>
            <TextInput
              style={styles.input}
              placeholder="ID do Cliente"
              value={clientId}
              onChangeText={setClientId}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={handleAddPoints} disabled={isAddingPoints} style={styles.button}>
              {isAddingPoints ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Adicionar 1 Ponto</Text>}
            </TouchableOpacity>
          </View>

          {user.user_type === 'ADMIN' && (
            <>
              {report && (
                <View style={styles.featureCard}>
                  <Text style={styles.featureTitle}>Relatório da Empresa</Text>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Clientes Únicos:</Text>
                    <Text style={styles.reportValue}>{report.unique_customers}</Text>
                  </View>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Total de Pontos Atribuídos:</Text>
                    <Text style={styles.reportValue}>{report.total_points_awarded}</Text>
                  </View>
                  <View style={styles.reportRow}>
                    <Text style={styles.reportLabel}>Total de Prémios Resgatados:</Text>
                    <Text style={styles.reportValue}>{report.total_rewards_redeemed}</Text>
                  </View>
                </View>
              )}

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Atividade Recente</Text>
                {transactions.length > 0 ? (
                  transactions.slice(0, 5).map(tx => (
                    <View key={tx.id} style={styles.itemContainer}>
                      <View>
                        <Text style={styles.itemName}>
                          {tx.points > 0 ? `+${tx.points} pts para ` : `${tx.points} pts de `}
                          <Text style={{ fontWeight: 'bold' }}>{tx.client.name}</Text>
                        </Text>
                        <Text style={styles.itemSubtitle}>
                          {tx.points > 0 ? `Por: ${tx.awarded_by.name}` : 'Resgate de Prémio'}
                        </Text>
                      </View>
                      <Text style={styles.itemSubtitle}>
                        {new Date(tx.created_at).toLocaleDateString()}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nenhuma atividade registada.</Text>
                )}
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Gestão de Colaboradores</Text>
                {collaborators.length > 0 ? (
                  collaborators.map(collab => (
                    <View key={collab.id} style={styles.itemContainer}>
                      <View>
                        <Text style={styles.itemName}>{collab.name}</Text>
                        <Text style={styles.itemSubtitle}>{collab.email}</Text>
                      </View>
                      <View style={styles.actionsContainer}>
                        <TouchableOpacity onPress={() => openEditModal(collab)} style={[styles.actionButton, styles.editButton]}>
                          <Text style={styles.actionButtonText}>Editar</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteCollaborator(collab)} style={[styles.actionButton, styles.deleteButton]}>
                          <Text style={styles.actionButtonText}>Excluir</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nenhum colaborador encontrado.</Text>
                )}
                <View style={styles.divider} />
                <Text style={styles.featureSubtitle}>Adicionar Novo Colaborador</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Colaborador"
                  value={newCollabName}
                  onChangeText={setNewCollabName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Email do Colaborador"
                  value={newCollabEmail}
                  onChangeText={setNewCollabEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Senha Provisória"
                  value={newCollabPassword}
                  onChangeText={setNewCollabPassword}
                  secureTextEntry
                />
                <TouchableOpacity onPress={handleAddCollaborator} disabled={isAddingCollab} style={styles.button}>
                  {isAddingCollab ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Adicionar Colaborador</Text>}
                </TouchableOpacity>
              </View>

              <View style={styles.featureCard}>
                <Text style={styles.featureTitle}>Gestão de Prémios</Text>
                {rewards.length > 0 ? (
                  rewards.map(reward => (
                    <View key={reward.id} style={styles.itemContainer}>
                      <View>
                        <Text style={styles.itemName}>{reward.name}</Text>
                        <Text style={styles.itemSubtitle}>{reward.description}</Text>
                      </View>
                      <Text style={styles.pointsTag}>{reward.points_required} pts</Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.emptyText}>Nenhum prémio encontrado.</Text>
                )}
                <View style={styles.divider} />
                <Text style={styles.featureSubtitle}>Adicionar Novo Prémio</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nome do Prémio"
                  value={newRewardName}
                  onChangeText={setNewRewardName}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Descrição (opcional)"
                  value={newRewardDescription}
                  onChangeText={setNewRewardDescription}
                />
                <TextInput
                  style={styles.input}
                  placeholder="Pontos Necessários"
                  value={newRewardPoints}
                  onChangeText={setNewRewardPoints}
                  keyboardType="number-pad"
                />
                <TouchableOpacity onPress={handleAddReward} disabled={isAddingReward} style={styles.button}>
                  {isAddingReward ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Adicionar Prémio</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      {/* Modal de Edição para Colaboradores */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={isEditModalVisible}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Editar Colaborador</Text>
            <TextInput
              style={styles.input}
              value={updatedName}
              onChangeText={setUpdatedName}
              placeholder="Novo nome do colaborador"
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateCollaborator}
              >
                <Text style={styles.buttonText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

// --- Folha de Estilos (StyleSheet) ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f9fafb'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb'
  },
  authContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: 24
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1d4ed8',
    textAlign: 'center',
    marginBottom: 8
  },
  subtitle: {
    fontSize: 18,
    color: '#4b5563',
    textAlign: 'center',
    marginBottom: 40
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb'
  },
  button: {
    backgroundColor: '#1d4ed8',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginBottom: 16
  },
  dashboardContainer: {
    padding: 24
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32
  },
  headerTitle: {
    fontSize: 24,
    color: '#374151'
  },
  headerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937'
  },
  logoutButton: {
    backgroundColor: '#fee2e2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 99
  },
  logoutButtonText: {
    color: '#dc2626',
    fontWeight: 'bold'
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  infoCardLabel: {
    color: '#6b7280',
    fontSize: 14,
    marginBottom: 2
  },
  infoCardValue: {
    color: '#1f2937',
    fontSize: 16,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 16
  },
  featureCard: {
    marginTop: 24,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4
  },
  featureSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 20
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6'
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    flexShrink: 1
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#6b7280'
  },
  pointsTag: {
    backgroundColor: '#e0e7ff',
    color: '#3730a3',
    fontWeight: 'bold',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99
  },
  emptyText: {
    textAlign: 'center',
    color: '#6b7280',
    paddingVertical: 10
  },
  actionsContainer: {
    flexDirection: 'row'
  },
  actionButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginLeft: 8
  },
  editButton: {
    backgroundColor: '#dbeafe'
  },
  deleteButton: {
    backgroundColor: '#fee2e2'
  },
  actionButtonText: {
    fontWeight: '500',
    color: '#374151'
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#9ca3af',
    marginRight: 10,
  },
  saveButton: {
    backgroundColor: '#1d4ed8',
    marginLeft: 10,
  },
  reportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  reportLabel: {
    fontSize: 16,
    color: '#4b5563',
  },
  reportValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  centerText: {
    flex: 1,
    fontSize: 18,
    padding: 32,
    color: '#777',
    textAlign: 'center',
  },
  buttonTouchable: {
    backgroundColor: '#dc2626',
    padding: 16,
    borderRadius: 12,
    margin: 24,
  },
});