import React from 'react';
import '../styles/projectCard.css';

interface ProjectCardProps {
  id: string;
  title: string;
  description: string;
  author: {
    name: string;
    avatar?: string;
  };
  tags: string[];
  images: string[];
  likes: number;
  dislikes: number;
  views: number;
  createdAt: number;
  onLike?: () => void;
  onDislike?: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  id,
  title,
  description,
  author,
  tags,
  images,
  likes,
  dislikes,
  views,
  createdAt,
  onLike,
  onDislike,
}) => {
  const formattedDate = new Date(createdAt).toLocaleDateString('tr-TR');

  return (
    <div className="project-card">
      {images.length > 0 && (
        <div className="project-card-image">
          <img src={images[0]} alt={title} />
        </div>
      )}

      <div className="project-card-content">
        <div className="project-meta">
          <div className="author-info">
            {author.avatar && (
              <img src={author.avatar} alt={author.name} className="author-avatar" />
            )}
            <div>
              <p className="author-name">{author.name}</p>
              <p className="project-date">{formattedDate}</p>
            </div>
          </div>
        </div>

        <h2 className="project-title">
          <a href={`/project/${id}`}>{title}</a>
        </h2>

        <p className="project-description">{description}</p>

        {tags.length > 0 && (
          <div className="project-tags">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="project-footer">
          <div className="project-stats">
            <button className="stat-btn like" onClick={onLike}>
              👍 {likes}
            </button>
            <button className="stat-btn dislike" onClick={onDislike}>
              👎 {dislikes}
            </button>
            <span className="stat-views">👁️ {views}</span>
          </div>

          <a href={`/project/${id}`} className="view-project">
            Projeyi Gör →
          </a>
        </div>
      </div>
    </div>
  );
};
