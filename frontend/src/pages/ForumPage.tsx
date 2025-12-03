import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ProjectCard } from '../components/ProjectCard';
import '../styles/forum.css';
import { apiClient } from '../services/api';
import { useAuthStore } from '../hooks/useAuthStore';

interface Project {
  id: string;
  title: string;
  description: string;
  author: {
    uid: string;
    name: string;
    avatar?: string;
  };
  tags: string[];
  images: string[];
  likes: number;
  dislikes: number;
  views: number;
  createdAt: number;
  isPopular: boolean;
}

export const ForumPage: React.FC = () => {
  const { user } = useAuthStore();
  const [projects, setProjects] = React.useState<Project[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [sortBy, setSortBy] = React.useState<'recent' | 'popular' | 'trending'>('recent');
  const [showCreateForm, setShowCreateForm] = React.useState(false);

  React.useEffect(() => {
    fetchProjects();
  }, [sortBy]);

  const fetchProjects = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.getProjects(20, 0, sortBy);
      setProjects(response.data.projects);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateProject = async (formData: any) => {
    try {
      await apiClient.createProject(formData);
      setShowCreateForm(false);
      fetchProjects();
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Proje oluşturulamadı.');
    }
  };

  const handleLike = async (projectId: string) => {
    if (!user) {
      alert('Beğenmek için giriş yapmalısınız.');
      return;
    }

    try {
      await apiClient.likeProject(projectId);
      fetchProjects();
    } catch (error) {
      console.error('Error liking project:', error);
    }
  };

  const handleDislike = async (projectId: string) => {
    if (!user) {
      alert('Beğenmemek için giriş yapmalısınız.');
      return;
    }

    try {
      await apiClient.dislikeProject(projectId);
      fetchProjects();
    } catch (error) {
      console.error('Error disliking project:', error);
    }
  };

  return (
    <>
      <Header />

      <main className="main-container">
        <section className="forum-header">
          <div className="forum-header-content">
            <h1>Forum</h1>
            <p>Projelerinizi paylaşın ve topluluğla etkileşim kurun</p>

            {user && (
              <button
                className="btn-primary"
                onClick={() => setShowCreateForm(!showCreateForm)}
              >
                {showCreateForm ? 'İptal' : '+ Yeni Proje'}
              </button>
            )}
          </div>
        </section>

        <div className="container">
          {showCreateForm && user && (
            <section className="create-project-form">
              <h2>Yeni Proje Oluştur</h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleCreateProject({
                    title: formData.get('title'),
                    description: formData.get('description'),
                    tags: (formData.get('tags') as string).split(',').map((t) => t.trim()),
                    images: (formData.get('images') as string)
                      .split(',')
                      .map((url) => url.trim())
                      .filter(Boolean),
                    links: [],
                  });
                }}
              >
                <input
                  type="text"
                  name="title"
                  placeholder="Proje Başlığı"
                  required
                />
                <textarea
                  name="description"
                  placeholder="Proje Açıklaması"
                  required
                  rows={4}
                />
                <input
                  type="text"
                  name="tags"
                  placeholder="Etiketler (virgülle ayırın)"
                />
                <input
                  type="text"
                  name="images"
                  placeholder="Resim URL'leri (virgülle ayırın)"
                />
                <button type="submit" className="btn-primary">
                  Proje Oluştur
                </button>
              </form>
            </section>
          )}

          <section className="forum-section">
            <div className="forum-controls">
              <div className="sort-buttons">
                <button
                  className={sortBy === 'recent' ? 'active' : ''}
                  onClick={() => setSortBy('recent')}
                >
                  Son Eklenenler
                </button>
                <button
                  className={sortBy === 'popular' ? 'active' : ''}
                  onClick={() => setSortBy('popular')}
                >
                  En Beğenilenler
                </button>
                <button
                  className={sortBy === 'trending' ? 'active' : ''}
                  onClick={() => setSortBy('trending')}
                >
                  Trendler
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="loading">Projeler yükleniyor...</div>
            ) : projects.length > 0 ? (
              <div className="projects-grid">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    {...project}
                    onLike={() => handleLike(project.id)}
                    onDislike={() => handleDislike(project.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Henüz proje yok. Paylaşmaya başlayın!</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};
