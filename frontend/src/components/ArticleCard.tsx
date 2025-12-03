import React from 'react';
import '../styles/articleCard.css';

interface ArticleCardProps {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  featured_image?: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: number;
  views: number;
  tags: string[];
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  slug,
  title,
  excerpt,
  featured_image,
  author,
  createdAt,
  views,
  tags,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('tr-TR');

  return (
    <div className="article-card">
      {featured_image && (
        <div className="article-card-image">
          <img src={featured_image} alt={title} />
        </div>
      )}

      <div className="article-card-content">
        <div className="article-meta">
          <div className="author-info">
            {author.avatar && (
              <img src={author.avatar} alt={author.name} className="author-avatar" />
            )}
            <div>
              <p className="author-name">{author.name}</p>
              <p className="article-date">{formattedDate}</p>
            </div>
          </div>
          <p className="article-views">{views} görüntüleme</p>
        </div>

        <h2 className="article-title">
          <a href={`/article/${slug}`}>{title}</a>
        </h2>

        <p className="article-excerpt">{excerpt}</p>

        {tags.length > 0 && (
          <div className="article-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <a href={`/article/${slug}`} className="read-more">
          Devamını Oku →
        </a>
      </div>
    </div>
  );
};
