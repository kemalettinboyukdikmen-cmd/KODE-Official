import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { CommentSection } from '../components/CommentSection';
import '../styles/articleDetail.css';
import { useParams } from 'react-router-dom';
import { apiClient } from '../services/api';

interface Article {
  id: string;
  slug: string;
  title: string;
  content: string;
  excerpt: string;
  featured_image?: string;
  author: {
    uid: string;
    name: string;
    avatar?: string;
  };
  createdAt: number;
  updatedAt: number;
  views: number;
  tags: string[];
  seoTitle?: string;
  seoDescription?: string;
}

interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    uid: string;
    avatar?: string;
    isAnonymous?: boolean;
  };
  createdAt: number;
  likes: number;
  dislikes: number;
  isReported: boolean;
}

export const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = React.useState<Article | null>(null);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.getArticle(slug || '');
        setArticle(response.data.article);
        setComments(response.data.comments || []);
      } catch (error) {
        console.error('Error fetching article:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  if (isLoading) return <div>Yükleniyor...</div>;
  if (!article) return <div>Haber bulunamadı.</div>;

  return (
    <>
      <Header />

      <main className="main-container">
        <article className="article-detail">
          <div className="container">
            <header className="article-header">
              <h1>{article.title}</h1>

              <div className="article-metadata">
                <div className="author-section">
                  {article.author.avatar && (
                    <img
                      src={article.author.avatar}
                      alt={article.author.name}
                      className="author-avatar-large"
                    />
                  )}
                  <div>
                    <p className="author-name">{article.author.name}</p>
                    <p className="article-dates">
                      {new Date(article.createdAt).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>

                <div className="article-stats">
                  <span>👁️ {article.views} görüntüleme</span>
                  <span>💬 {comments.length} yorum</span>
                </div>
              </div>

              {article.featured_image && (
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="featured-image"
                />
              )}
            </header>

            <div className="article-content">
              {article.content.split('\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {article.tags.length > 0 && (
              <div className="article-tags-section">
                {article.tags.map((tag) => (
                  <a key={tag} href={`/?tag=${tag}`} className="tag">
                    #{tag}
                  </a>
                ))}
              </div>
            )}

            <CommentSection articleId={article.id} initialComments={comments} />
          </div>
        </article>
      </main>

      <Footer />
    </>
  );
};
