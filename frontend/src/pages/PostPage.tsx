import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { api } from '../services/api';

interface Comment {
  id: string;
  content: string;
  author: { id: string; username: string; name?: string; image?: string };
  upvotes: number;
  downvotes: number;
  children?: Comment[];
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  content?: string;
  url?: string;
  type: string;
  category?: string;
  isNsfw: boolean;
  isSpoiler: boolean;
  upvotes: number;
  downvotes: number;
  commentCount: number;
  author: { id: string; username: string; name?: string; image?: string };
  community: { id: string; name: string; slug: string };
  createdAt: string;
  myVote?: number;
}

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [commentLoading, setCommentLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    if (socket && user) {
      socket.emit('join_post', { postId: id });

      socket.on('new_comment', (data: any) => {
        if (data.postId === id) {
          fetchPost(); // Refresh comment count
        }
      });

      return () => {
        socket.off('new_comment');
      };
    }
  }, [socket, user, id]);

  const fetchPost = async () => {
    if (!id) return;
    try {
      const response = await api.get<{ post: Post }>(`/posts/${id}`);
      setPost(response.data.post);

      // Fetch comments (simplified - would need separate endpoint)
      // For now, mock
    } catch (error) {
      console.error('Failed to fetch post:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value: number) => {
    if (!id || !user) return;
    try {
      await api.post(`/posts/${id}/vote`, { value });
      fetchPost();
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    setCommentLoading(true);
    try {
      await api.post(`/posts/${id}/comments`, { content: newComment });
      setNewComment('');
      fetchPost();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setCommentLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold mb-4">Post not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-600">
        <Link to="/">Home</Link>
        <span className="mx-2">/</span>
        <Link to={`/c/${post.community.slug}`}>c/{post.community.name}</Link>
        <span className="mx-2">/</span>
        <span>{post.title.substring(0, 30)}...</span>
      </nav>

      {/* Post */}
      <div className="card">
        <div className="card-body">
          <div className="flex items-start space-x-4">
            {/* Vote Column */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={() => handleVote(1)}
                className={`p-1 ${post.myVote === 1 ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                title="Upvote"
              >
                ▲
              </button>
              <span className="font-semibold w-8 text-center">
                {post.upvotes - post.downvotes}
              </span>
              <button
                onClick={() => handleVote(-1)}
                className={`p-1 ${post.myVote === -1 ? 'text-primary' : 'text-gray-400 hover:text-primary'}`}
                title="Downvote"
              >
                ▼
              </button>
            </div>

            {/* Content */}
            <div className="flex-1">
              <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
                <Link to={`/c/${post.community.slug}`} className="hover:text-primary">
                  c/{post.community.name}
                </Link>
                <span>•</span>
                <Link to={`/u/${post.author.username}`} className="hover:text-primary">
                  u/{post.author.username}
                </Link>
                <span>•</span>
                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              </div>

              <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

              {post.isNsfw && (
                <div className="bg-yellow-100 border border-yellow-300 p-4 rounded mb-4">
                  <strong>NSFW Content</strong>
                </div>
              )}

              {post.isSpoiler && (
                <div className="bg-red-100 border border-red-300 p-4 rounded mb-4">
                  <strong>Spoiler Warning</strong>
                </div>
              )}

              {post.type === 'TEXT' && post.content && (
                <div className="prose max-w-none mb-4">
                  <pre className="whitespace-pre-wrap font-sans">{post.content}</pre>
                </div>
              )}

              {(post.type === 'LINK' || post.type === 'IMAGE') && post.url && (
                <a
                  href={post.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mb-4"
                >
                  {post.type === 'IMAGE' && (
                    <img
                      src={post.url}
                      alt={post.title}
                      className="max-w-lg rounded"
                    />
                  )}
                  {post.type === 'LINK' && (
                    <span className="text-primary break-all">{post.url}</span>
                  )}
                </a>
              )}

              {post.category && (
                <span className="badge badge-secondary mb-4 inline-block">
                  {post.category}
                </span>
              )}

              <div className="text-sm text-gray-600">
                {post.commentCount} comments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="card">
        <div className="card-body">
          <h2 className="text-lg font-semibold mb-4">Comments</h2>

          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                className="form-textarea"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="What are your thoughts?"
                rows={3}
                required
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={commentLoading || !newComment.trim()}
                >
                  {commentLoading ? <span className="spinner"></span> : 'Comment'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-gray-50 p-4 rounded mb-6 text-center">
              <p className="mb-2">Log in or sign up to leave a comment.</p>
              <Link to="/login" className="btn btn-primary">Sign In</Link>
            </div>
          )}

          <div className="space-y-4">
            {/* Comments would be rendered here */}
            {comments.length === 0 && (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Be the first to share your thoughts!
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostPage;
