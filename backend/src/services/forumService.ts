import { db } from '../config/firebase';
import { Project } from '../types';
import { SecurityUtils } from '../utils/security';

export class ForumService {
  /**
   * Create a new project/post
   */
  static async createProject(
    title: string,
    description: string,
    authorId: string,
    authorName: string,
    authorAvatar: string | undefined,
    tags: string[] = [],
    images: string[] = [],
    links: Array<{ title: string; url: string }> = []
  ): Promise<Project> {
    const id = SecurityUtils.generateId();

    const project: Project = {
      id,
      title: SecurityUtils.sanitizeInput(title),
      description: SecurityUtils.sanitizeInput(description),
      author: {
        uid: authorId,
        name: authorName,
        avatar: authorAvatar,
      },
      tags: tags.map((tag) => SecurityUtils.sanitizeInput(tag)),
      images,
      links: links.map((link) => ({
        title: SecurityUtils.sanitizeInput(link.title),
        url: link.url,
      })),
      likes: 0,
      dislikes: 0,
      views: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      isPopular: false,
    };

    await db.collection('projects').doc(id).set(project);
    return project;
  }

  /**
   * Get project by ID
   */
  static async getProjectById(id: string): Promise<Project | null> {
    const doc = await db.collection('projects').doc(id).get();
    return doc.exists ? (doc.data() as Project) : null;
  }

  /**
   * Get all projects (with pagination)
   */
  static async getAllProjects(
    limit: number = 20,
    offset: number = 0,
    sortBy: 'recent' | 'popular' | 'trending' = 'recent'
  ): Promise<Project[]> {
    let query = db.collection('projects');

    if (sortBy === 'popular') {
      query = query.orderBy('likes', 'desc');
    } else if (sortBy === 'trending') {
      query = query.where('isPopular', '==', true).orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }

    const results = await query.limit(limit).offset(offset).get();

    return results.docs.map((doc) => doc.data() as Project);
  }

  /**
   * Get projects by author
   */
  static async getProjectsByAuthor(authorId: string, limit: number = 20): Promise<Project[]> {
    const results = await db
      .collection('projects')
      .where('author.uid', '==', authorId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Project);
  }

  /**
   * Get projects by tag
   */
  static async getProjectsByTag(tag: string, limit: number = 20): Promise<Project[]> {
    const results = await db
      .collection('projects')
      .where('tags', 'array-contains', tag)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Project);
  }

  /**
   * Update project
   */
  static async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const updatedData = {
      ...updates,
      updatedAt: Date.now(),
    };

    await db.collection('projects').doc(id).update(updatedData);

    const project = await this.getProjectById(id);
    if (!project) throw new Error('Project not found');

    return project;
  }

  /**
   * Like/Unlike project
   */
  static async toggleLike(projectId: string, userId: string): Promise<void> {
    const likeRef = db.collection('likes').doc(`${projectId}-${userId}`);
    const likeDoc = await likeRef.get();

    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    if (likeDoc.exists) {
      // Unlike
      await likeRef.delete();
      await db.collection('projects').doc(projectId).update({
        likes: Math.max(0, project.likes - 1),
      });
    } else {
      // Like
      await likeRef.set({ projectId, userId, createdAt: Date.now() });
      await db.collection('projects').doc(projectId).update({
        likes: project.likes + 1,
      });
    }
  }

  /**
   * Dislike/Undislike project
   */
  static async toggleDislike(projectId: string, userId: string): Promise<void> {
    const dislikeRef = db.collection('dislikes').doc(`${projectId}-${userId}`);
    const dislikeDoc = await dislikeRef.get();

    const project = await this.getProjectById(projectId);
    if (!project) throw new Error('Project not found');

    if (dislikeDoc.exists) {
      // Undislike
      await dislikeRef.delete();
      await db.collection('projects').doc(projectId).update({
        dislikes: Math.max(0, project.dislikes - 1),
      });
    } else {
      // Dislike
      await dislikeRef.set({ projectId, userId, createdAt: Date.now() });
      await db.collection('projects').doc(projectId).update({
        dislikes: project.dislikes + 1,
      });
    }
  }

  /**
   * Increment project views
   */
  static async incrementViews(id: string): Promise<void> {
    const project = await this.getProjectById(id);
    if (project) {
      await db.collection('projects').doc(id).update({
        views: project.views + 1,
      });
    }
  }

  /**
   * Mark project as popular
   */
  static async markAsPopular(id: string): Promise<void> {
    await db.collection('projects').doc(id).update({
      isPopular: true,
    });
  }

  /**
   * Get popular projects
   */
  static async getPopularProjects(limit: number = 10): Promise<Project[]> {
    const results = await db
      .collection('projects')
      .where('isPopular', '==', true)
      .orderBy('likes', 'desc')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Project);
  }

  /**
   * Delete project
   */
  static async deleteProject(id: string): Promise<void> {
    await db.collection('projects').doc(id).delete();

    // Delete associated comments
    const commentsQuery = await db
      .collection('comments')
      .where('projectId', '==', id)
      .get();
    for (const doc of commentsQuery.docs) {
      await doc.ref.delete();
    }

    // Delete likes/dislikes
    const likesQuery = await db.collection('likes').where('projectId', '==', id).get();
    for (const doc of likesQuery.docs) {
      await doc.ref.delete();
    }

    const dislikesQuery = await db.collection('dislikes').where('projectId', '==', id).get();
    for (const doc of dislikesQuery.docs) {
      await doc.ref.delete();
    }
  }

  /**
   * Search projects
   */
  static async searchProjects(query: string, limit: number = 20): Promise<Project[]> {
    const results = await db
      .collection('projects')
      .where('title', '>=', query)
      .where('title', '<=', query + '\uf8ff')
      .limit(limit)
      .get();

    return results.docs.map((doc) => doc.data() as Project);
  }
}
