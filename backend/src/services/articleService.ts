import { db } from '../config/firebase';
import { Article } from '../types';
import { SecurityUtils } from '../utils/security';

export class ArticleService {
  /**
   * Create a new article
   */
  static async createArticle(
    title: string,
    content: string,
    excerpt: string,
    authorId: string,
    authorName: string,
    authorAvatar: string | undefined,
    tags: string[] = [],
    featuredImage?: string,
    seoTitle?: string,
    seoDescription?: string
  ): Promise<Article> {
    const id = SecurityUtils.generateId();
    const slug = SecurityUtils.generateSlug(title);

    const article: Article = {
      id,
      title: SecurityUtils.sanitizeInput(title),
      slug,
      content: SecurityUtils.sanitizeInput(content),
      excerpt: SecurityUtils.sanitizeInput(excerpt),
      author: {
        uid: authorId,
        name: authorName,
        avatar: authorAvatar,
      },
      featured_image: featuredImage,
      status: 'draft',
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      tags: tags.map((tag) => SecurityUtils.sanitizeInput(tag)),
      seoTitle: seoTitle ? SecurityUtils.sanitizeInput(seoTitle) : title,
      seoDescription: seoDescription
        ? SecurityUtils.sanitizeInput(seoDescription)
        : excerpt,
    };

    await db.collection('articles').doc(id).set(article);
    return article;
  }

  /**
   * Get article by ID
   */
  static async getArticleById(id: string): Promise<Article | null> {
    const doc = await db.collection('articles').doc(id).get();
    return doc.exists ? (doc.data() as Article) : null;
  }

  /**
   * Get article by slug
   */
  static async getArticleBySlug(slug: string): Promise<Article | null> {
    const query = await db
      .collection('articles')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    return query.empty ? null : (query.docs[0].data() as Article);
  }

  /**
   * Get all published articles
   */
  static async getPublishedArticles(limit: number = 20, offset: number = 0): Promise<Article[]> {
    const results = await db
      .collection('articles')
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .offset(offset)
      .get();

    return results.docs.map((doc) => doc.data() as Article);
  }

  /**
   * Get articles by author
   */
  static async getArticlesByAuthor(authorId: string, limit: number = 20): Promise<Article[]> {
    const results = await db
      .collection('articles')
      .where('author.uid', '==', authorId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Article);
  }

  /**
   * Update article
   */
  static async updateArticle(
    id: string,
    updates: Partial<Article>
  ): Promise<Article> {
    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await db.collection('articles').doc(id).update(updatedData);

    const article = await this.getArticleById(id);
    if (!article) throw new Error('Article not found');

    return article;
  }

  /**
   * Publish article
   */
  static async publishArticle(id: string): Promise<void> {
    await db.collection('articles').doc(id).update({
      status: 'published',
      updatedAt: Date.now(),
    });
  }

  /**
   * Archive article
   */
  static async archiveArticle(id: string): Promise<void> {
    await db.collection('articles').doc(id).update({
      status: 'archived',
      updatedAt: Date.now(),
    });
  }

  /**
   * Increment article views
   */
  static async incrementViews(id: string): Promise<void> {
    const article = await this.getArticleById(id);
    if (article) {
      await db.collection('articles').doc(id).update({
        views: article.views + 1,
      });
    }
  }

  /**
   * Delete article
   */
  static async deleteArticle(id: string): Promise<void> {
    await db.collection('articles').doc(id).delete();

    // Delete associated comments
    const commentsQuery = await db
      .collection('comments')
      .where('articleId', '==', id)
      .get();
    for (const doc of commentsQuery.docs) {
      await doc.ref.delete();
    }
  }

  /**
   * Search articles
   */
  static async searchArticles(query: string, limit: number = 20): Promise<Article[]> {
    const results = await db
      .collection('articles')
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff')
      .where('status', '==', 'published')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Article);
  }

  /**
   * Get articles by tag
   */
  static async getArticlesByTag(tag: string, limit: number = 20): Promise<Article[]> {
    const results = await db
      .collection('articles')
      .where('tags', 'array-contains', tag)
      .where('status', '==', 'published')
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Article);
  }
}
