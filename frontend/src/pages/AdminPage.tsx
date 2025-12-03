import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { useAuthStore } from '../hooks/useAuthStore';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../services/api';
import '../styles/admin.css';

interface User {
  uid: string;
  email: string;
  name: string;
  role: 'admin' | 'editor' | 'user' | 'banned';
  isFrozen: boolean;
  createdAt: number;
}

export const AdminPage: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = React.useState<User[]>([]);
  const [logs, setLogs] = React.useState([]);
  const [activeTab, setActiveTab] = React.useState<'users' | 'logs' | 'security'>('users');
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getUsers();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiClient.searchUsers(searchQuery);
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error searching users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    if (!confirm(`Kullanıcının rolünü ${newRole} olarak değiştirmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await apiClient.changeUserRole(userId, newRole);
      fetchUsers();
    } catch (error) {
      console.error('Error changing user role:', error);
      alert('Rol değiştirilirken bir hata oluştu.');
    }
  };

  const handleFreezeUser = async (userId: string) => {
    try {
      await apiClient.freezeUser(userId, 'Admin tarafından donduruldu');
      fetchUsers();
    } catch (error) {
      console.error('Error freezing user:', error);
      alert('Kullanıcı dondurulurken bir hata oluştu.');
    }
  };

  const handleUnfreezeUser = async (userId: string) => {
    try {
      await apiClient.unfreezeUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error unfreezing user:', error);
      alert('Kullanıcı çözülürken bir hata oluştu.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    try {
      await apiClient.deleteUser(userId);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Kullanıcı silinirken bir hata oluştu.');
    }
  };

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getRecentLogs(24);
      setLogs(response.data.logs);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'logs') {
      fetchLogs();
    }
  }, [activeTab]);

  return (
    <>
      <Header />

      <main className="admin-container">
        <div className="admin-sidebar">
          <h2>Admin Paneli</h2>
          <nav className="admin-nav">
            <button
              className={activeTab === 'users' ? 'active' : ''}
              onClick={() => setActiveTab('users')}
            >
              Kullanıcılar
            </button>
            <button
              className={activeTab === 'logs' ? 'active' : ''}
              onClick={() => setActiveTab('logs')}
            >
              Loglar
            </button>
            <button
              className={activeTab === 'security' ? 'active' : ''}
              onClick={() => setActiveTab('security')}
            >
              Güvenlik
            </button>
          </nav>
        </div>

        <div className="admin-content">
          {/* Kullanıcılar Tab */}
          {activeTab === 'users' && (
            <div className="admin-section">
              <h2>Kullanıcı Yönetimi</h2>

              <div className="search-box">
                <input
                  type="text"
                  placeholder="Kullanıcı ara (email)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchUsers()}
                />
                <button onClick={handleSearchUsers} className="btn-primary">
                  Ara
                </button>
              </div>

              {isLoading ? (
                <div className="loading">Yükleniyor...</div>
              ) : (
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Ad</th>
                        <th>Rol</th>
                        <th>Durum</th>
                        <th>Oluşturma Tarihi</th>
                        <th>İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u.uid}>
                          <td>{u.email}</td>
                          <td>{u.name}</td>
                          <td>
                            <select
                              value={u.role}
                              onChange={(e) => handleChangeRole(u.uid, e.target.value)}
                            >
                              <option value="user">Kullanıcı</option>
                              <option value="editor">Editör</option>
                              <option value="admin">Admin</option>
                              <option value="banned">Yasaklı</option>
                            </select>
                          </td>
                          <td className={u.isFrozen ? 'status-frozen' : 'status-active'}>
                            {u.isFrozen ? 'Dondurulmuş' : 'Aktif'}
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString('tr-TR')}</td>
                          <td className="actions">
                            {u.isFrozen ? (
                              <button
                                className="btn-small btn-success"
                                onClick={() => handleUnfreezeUser(u.uid)}
                              >
                                Çöz
                              </button>
                            ) : (
                              <button
                                className="btn-small btn-warning"
                                onClick={() => handleFreezeUser(u.uid)}
                              >
                                Dondur
                              </button>
                            )}
                            <button
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteUser(u.uid)}
                            >
                              Sil
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Loglar Tab */}
          {activeTab === 'logs' && (
            <div className="admin-section">
              <h2>Sistem Logları</h2>

              {isLoading ? (
                <div className="loading">Yükleniyor...</div>
              ) : (
                <div className="logs-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Zaman</th>
                        <th>Kullanıcı</th>
                        <th>İşlem</th>
                        <th>Kaynak</th>
                        <th>IP Adresi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {logs.map((log: any) => (
                        <tr key={log.id}>
                          <td>{new Date(log.timestamp).toLocaleString('tr-TR')}</td>
                          <td>{log.userId.substring(0, 8)}...</td>
                          <td>{log.action}</td>
                          <td>{log.resource}</td>
                          <td>{log.ipAddress}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Güvenlik Tab */}
          {activeTab === 'security' && (
            <div className="admin-section">
              <h2>Güvenlik Ayarları</h2>

              <div className="security-info">
                <div className="info-card">
                  <h3>IP Whitelist</h3>
                  <p>Yalnızca aşağıdaki IP adreslerinden admin paneline erişim mümkündür:</p>
                  <div className="ip-list">
                    {process.env.REACT_APP_ADMIN_IP_WHITELIST?.split(',').map((ip) => (
                      <span key={ip} className="ip-badge">
                        {ip.trim()}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="info-card">
                  <h3>Cihaz Parmak İzi</h3>
                  <p>Admin oturumları cihaz parmak izi ile korunmaktadır.</p>
                </div>

                <div className="info-card">
                  <h3>SSL/TLS</h3>
                  <p>Tüm bağlantılar SSL/TLS ile şifrelenmektedir.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </>
  );
};
