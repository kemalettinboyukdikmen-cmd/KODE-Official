import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { ArticleCard } from '../components/ArticleCard';
import '../styles/home.css';
import { apiClient } from '../services/api';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  author: {
    uid: string;
    name: string;
    avatar?: string;
  };
  createdAt: number;
  views: number;
  tags: string[];
}

export const HomePage: React.FC = () => {
  const [articles, setArticles] = React.useState<Article[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [selectedTag, setSelectedTag] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchArticles = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getArticles(20, 0, selectedTag || undefined);
        setArticles(response.data.articles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticles();
  }, [selectedTag]);

  return (
    <>
      <Header />

      <main className="main-container">
        <section className="hero-section">
          <div className="hero-content">
            <h1>Son Haberler</h1>
            <p>Öğrenci dünyasının en güncel haberleri</p>
          </div>
        </section>

        <div className="container">
          <section className="articles-section">
            {isLoading ? (
              <div className="loading">Haberler yükleniyor...</div>
            ) : articles.length > 0 ? (
              <div className="articles-grid">
                {articles.map((article) => (
                  <ArticleCard key={article.id} {...article} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Henüz haber yok.</p>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
};
