import React from 'react';
import '../styles/commentSection.css';
import { useAuthStore } from '../hooks/useAuthStore';
import { apiClient } from '../services/api';

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

interface CommentSectionProps {
  articleId?: string;
  projectId?: string;
  initialComments?: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  articleId,
  projectId,
  initialComments = [],
}) => {
  const { user } = useAuthStore();
  const [comments, setComments] = React.useState<Comment[]>(initialComments);
  const [content, setContent] = React.useState('');
  const [isAnonymous, setIsAnonymous] = React.useState(false);
  const [anonName, setAnonName] = React.useState('');
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert('Yorum yapabilmek için giriş yapmalısınız.');
      return;
    }

    if (!content.trim()) {
      alert('Yorum boş olamaz.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiClient.createComment({
        content,
        isAnonymous,
        anonName: isAnonymous ? anonName || 'Anonim' : undefined,
        articleId,
        projectId,
      });

      setComments([response.data.comment, ...comments]);
      setContent('');
      setIsAnonymous(false);
      setAnonName('');
    } catch (error) {
      console.error('Yorum oluşturma hatası:', error);
      alert('Yorum oluşturulamadı.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      await apiClient.deleteComment(commentId);
      setComments(comments.filter((c) => c.id !== commentId));
    } catch (error) {
      console.error('Yorum silme hatası:', error);
      alert('Yorum silinemedi.');
    }
  };

  return (
    <div className="comment-section">
      <h3 className="comment-section-title">Yorumlar ({comments.length})</h3>

      {user ? (
        <form className="comment-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Yorumunuzu yazın..."
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="form-options">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
              />
              Anonim olarak yorum yap
            </label>

            {isAnonymous && (
              <input
                type="text"
                value={anonName}
                onChange={(e) => setAnonName(e.target.value)}
                placeholder="Anonim adı (isteğe bağlı)"
                className="anon-name-input"
              />
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Gönderiliyor...' : 'Yorum Gönder'}
          </button>
        </form>
      ) : (
        <div className="auth-required">
          <p>Yorum yapabilmek için <a href="/login">giriş yapmanız</a> gerekiyor.</p>
        </div>
      )}

      <div className="comments-list">
        {comments.map((comment) => (
          <div key={comment.id} className="comment-item">
            <div className="comment-header">
              {comment.author.avatar && (
                <img
                  src={comment.author.avatar}
                  alt={comment.author.name}
                  className="comment-avatar"
                />
              )}
              <div className="comment-meta">
                <p className="comment-author">
                  {comment.author.name}
                  {comment.author.isAnonymous && ' (Anonim)'}
                </p>
                <p className="comment-date">
                  {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                </p>
              </div>

              {user && (user.uid === comment.author.uid || user.role === 'admin' || user.role === 'editor') && (
                <button
                  className="delete-btn"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  Sil
                </button>
              )}
            </div>

            <p className="comment-content">{comment.content}</p>

            <div className="comment-actions">
              <button className="action-btn">👍 {comment.likes}</button>
              <button className="action-btn">👎 {comment.dislikes}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
