import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Alert, // Importa o componente Alert
} from 'react-native';

// --- Configuração da API ---
const API_BASE_URL = 'http://10.0.2.2:8000/api/v1';

// --- Definições de Tipos (TypeScript) ---
type ScreenType = 'login' | 'register' | 'dashboard';

interface User {
  id: number;
  email: string;
  name: string;
  user_type: string;
  company_id?: number;
  qr_code_base64?: string;
}

interface CompanyInfo {
  id: number;
  name: string;
}

interface PointsByCompany {
  total_points: number;
  company: CompanyInfo;
}

interface RewardStatus {
  id: number;
  name: string;
  description: string | null;
  points_required: number;
  company_id: number;
  redeemable: boolean;
  points_to_redeem: number;
}

interface AuthScreenProps {
  setAuthToken: React.Dispatch<React.SetStateAction<string | null>>;
  setScreen: React.Dispatch<React.SetStateAction<ScreenType>>;
}

interface DashboardScreenProps extends AuthScreenProps {
  user: User;
  authToken: string;
}

// --- Componente Principal da Aplicação ---
export default function App() {
  const [screen, setScreen] = useState<ScreenType>('login');
  const [authToken, setAuthToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchUserData = async (token: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: User = await response.json();
      if (response.ok) {
        setUserData(data);
        setScreen('dashboard');
      } else {
        setAuthToken(null);
        setScreen('login');
      }
    } catch (error) {
      console.error('Erro ao buscar dados do utilizador:', error);
      setAuthToken(null);
      setScreen('login');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authToken) {
      fetchUserData(authToken);
    }
  }, [authToken]);

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#4f46e5" />
      </View>
    );
  }

  switch (screen) {
    case 'login':
      return <LoginScreen setAuthToken={setAuthToken} setScreen={setScreen} />;
    case 'register':
      return <RegisterScreen setAuthToken={setAuthToken} setScreen={setScreen} />;
    case 'dashboard':
      if (userData && authToken) {
        return <DashboardScreen user={userData} authToken={authToken} setAuthToken={setAuthToken} setScreen={setScreen} />;
      }
      setScreen('login');
      return null;
    default:
      return <LoginScreen setAuthToken={setAuthToken} setScreen={setScreen} />;
  }
}

// --- Tela de Login (Sem alterações) ---
const LoginScreen: React.FC<AuthScreenProps> = ({ setAuthToken, setScreen }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        <Text style={styles.title}>Fideliza+</Text>
        <Text style={styles.subtitle}>Bem-vindo de volta!</Text>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Senha" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity onPress={handleLogin} disabled={loading} style={styles.button}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text>Não tem uma conta?</Text>
          <TouchableOpacity onPress={() => setScreen('register')}>
            <Text style={styles.switchButtonText}> Registe-se</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Tela de Registo (Sem alterações) ---
const RegisterScreen: React.FC<AuthScreenProps> = ({ setAuthToken, setScreen }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/register/client/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        const tokenResponse = await fetch(`${API_BASE_URL}/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData.toString(),
        });
        const tokenData = await tokenResponse.json();
        if (tokenResponse.ok) {
          setAuthToken(tokenData.access_token);
        } else {
           setError("Registo bem-sucedido, mas o login automático falhou.");
           setScreen('login');
        }
      } else {
        setError(data.detail || 'Falha no registo. Tente novamente.');
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
        <Text style={styles.title}>Criar Conta</Text>
        <Text style={styles.subtitle}>Junte-se ao Fideliza+</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <TextInput style={styles.input} placeholder="Nome Completo" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={styles.input} placeholder="Crie uma senha" value={password} onChangeText={setPassword} secureTextEntry />

        <TouchableOpacity onPress={handleRegister} disabled={loading} style={styles.button}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Registar</Text>}
        </TouchableOpacity>

        <View style={styles.switchContainer}>
          <Text>Já tem uma conta?</Text>
          <TouchableOpacity onPress={() => setScreen('login')}>
            <Text style={styles.switchButtonText}> Faça login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

// --- Tela Principal (Dashboard) ---
const DashboardScreen: React.FC<DashboardScreenProps> = ({ user, authToken, setAuthToken, setScreen }) => {
  const [points, setPoints] = useState<PointsByCompany[]>([]);
  const [rewards, setRewards] = useState<RewardStatus[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Função centralizada para buscar todos os dados do dashboard
  const fetchDashboardData = async () => {
    setLoadingData(true);
    try {
      // Busca os pontos
      const pointsResponse = await fetch(`${API_BASE_URL}/points/my-points`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const pointsData = await pointsResponse.json();
      if (pointsResponse.ok) setPoints(pointsData);

      // Busca os prémios
      const rewardsResponse = await fetch(`${API_BASE_URL}/rewards/my-status`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const rewardsData = await rewardsResponse.json();
      if (rewardsResponse.ok) setRewards(rewardsData);

    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error);
      Alert.alert("Erro", "Não foi possível carregar os seus dados. Tente novamente.");
    } finally {
      setLoadingData(false);
    }
  };

  // Efeito para buscar os dados quando a tela é carregada
  useEffect(() => {
    fetchDashboardData();
  }, [authToken]);

  // Função para lidar com o resgate de um prémio
  const handleRedeem = async (rewardId: number, rewardName: string) => {
    Alert.alert(
      "Confirmar Resgate",
      `Tem a certeza que deseja resgatar o prémio "${rewardName}"? Os seus pontos serão deduzidos.`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Confirmar", 
          onPress: async () => {
            try {
              const response = await fetch(`${API_BASE_URL}/rewards/redeem`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${authToken}`,
                },
                body: JSON.stringify({ reward_id: rewardId }),
              });

              const data = await response.json();
              if (response.ok) {
                Alert.alert("Sucesso!", `Prémio "${rewardName}" resgatado com sucesso.`);
                // Atualiza os dados do dashboard para refletir a mudança nos pontos
                fetchDashboardData(); 
              } else {
                Alert.alert("Erro", data.detail || "Não foi possível resgatar o prémio.");
              }
            } catch (error) {
              Alert.alert("Erro", "Ocorreu um erro de conexão.");
              console.error(error);
            }
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    setAuthToken(null);
    setScreen('login');
  };
  
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView>
        <View style={styles.dashboardContainer}>
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Olá, {user.name}!</Text>
              <Text style={styles.headerSubtitle}>{user.email}</Text>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Sair</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.qrCard}>
            <Text style={styles.qrCardTitle}>Seu QR Code de Fidelidade</Text>
            <View style={styles.qrCodeWrapper}>
              {user.qr_code_base64 ? (
                <Image
                  source={{ uri: `data:image/png;base64,${user.qr_code_base64}` }}
                  style={{ width: 220, height: 220 }}
                />
              ) : (
                <Text>QR Code não disponível</Text>
              )}
            </View>
            <Text style={styles.qrCardSubtitle}>
              Apresente este código nas lojas parceiras para pontuar.
            </Text>
          </View>
          
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Meus Pontos</Text>
            {loadingData ? <ActivityIndicator /> : (
              points.length > 0 ? (
                points.map(p => (
                  <View key={p.company.id} style={styles.card}>
                    <Text style={styles.cardTitle}>{p.company.name}</Text>
                    <Text style={styles.pointsText}>{p.total_points} Pontos</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Você ainda não tem pontos.</Text>
              )
            )}
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Prémios Disponíveis</Text>
            {loadingData ? <ActivityIndicator /> : (
              rewards.length > 0 ? (
                rewards.map(r => (
                  <View key={r.id} style={[styles.card, !r.redeemable && styles.disabledCard]}>
                    <Text style={styles.cardTitle}>{r.name}</Text>
                    <Text style={styles.cardSubtitle}>{r.description}</Text>
                    <View style={styles.rewardFooter}>
                      <Text style={styles.pointsRequiredText}>{r.points_required} Pontos</Text>
                      {r.redeemable ? (
                        <TouchableOpacity style={styles.redeemButton} onPress={() => handleRedeem(r.id, r.name)}>
                          <Text style={styles.redeemButtonText}>Resgatar</Text>
                        </TouchableOpacity>
                      ) : (
                        <Text style={styles.pointsToRedeemText}>{r.points_to_redeem} pontos em falta</Text>
                      )}
                    </View>
                  </View>
                ))
              ) : (
                <Text style={styles.emptyText}>Nenhum prémio disponível.</Text>
              )
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// --- Folha de Estilos ---
const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f3f4f6' },
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f3f4f6' },
  authContainer: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', color: '#4f46e5', textAlign: 'center', marginBottom: 8 },
  subtitle: { fontSize: 18, color: '#4b5563', textAlign: 'center', marginBottom: 40 },
  input: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 16, fontSize: 16, borderWidth: 1, borderColor: '#e5e7eb' },
  button: { backgroundColor: '#4f46e5', padding: 16, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  switchContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 32 },
  switchButtonText: { color: '#4f46e5', fontWeight: 'bold' },
  errorText: { color: '#ef4444', textAlign: 'center', marginBottom: 16 },
  dashboardContainer: { padding: 24 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1f2937' },
  headerSubtitle: { color: '#6b7280' },
  logoutButton: { backgroundColor: '#fee2e2', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 99 },
  logoutButtonText: { color: '#dc2626', fontWeight: 'bold' },
  qrCard: { backgroundColor: '#4f46e5', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 5 },
  qrCardTitle: { color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  qrCodeWrapper: { backgroundColor: 'white', padding: 16, borderRadius: 12 },
  qrCardSubtitle: { color: '#c7d2fe', textAlign: 'center', marginTop: 16 },
  sectionContainer: { marginTop: 32 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#1f2937', marginBottom: 16 },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  disabledCard: { opacity: 0.6 },
  cardTitle: { fontSize: 18, fontWeight: 'bold', color: '#374151' },
  cardSubtitle: { fontSize: 14, color: '#6b7280', marginTop: 4 },
  pointsText: { fontSize: 24, fontWeight: 'bold', color: '#4f46e5', marginTop: 8 },
  rewardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  pointsRequiredText: { fontSize: 16, fontWeight: 'bold', color: '#374151' },
  redeemableText: { fontSize: 14, fontWeight: 'bold', color: '#16a34a' },
  pointsToRedeemText: { fontSize: 14, color: '#ef4444' },
  emptyText: { textAlign: 'center', color: '#6b7280', padding: 20 },
  redeemButton: { backgroundColor: '#10b981', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 99 },
  redeemButtonText: { color: 'white', fontWeight: 'bold' },
});
