import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useBlog } from '@/contexts/BlogContext';
import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';
import MDEditor from '@uiw/react-md-editor';
import NotFound from './NotFound';

const CreatePost = () => {
  const { user } = useAuth();
  const { addPost, getPostById } = useBlog();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { id } = useParams();
  const post = getPostById(id || '');

  if (id && !post) {
    return (<NotFound />)
  }

  const [content, setContent] = useState(post?.content);

  if (!user) {
    navigate('/auth');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const tags = (formData.get('tags') as string).split(',').map(tag => tag.trim()).filter(Boolean);

    const excerpt = content.substring(0, 150).replace(/[#*`]/g, '') + '...';
    const wordCount = content.split(' ').length;
    const readTime = Math.max(1, Math.ceil(wordCount / 200));

    addPost({
      title,
      content,
      excerpt,
      author: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      readTime,
      tags,
    });

    toast({
      title: 'Post published!',
      description: 'Your blog post has been published successfully.',
    });

    navigate('/');
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your post title..."
                  required
                  className="text-lg"
                  value={post?.title}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  name="tags"
                  placeholder="React, JavaScript, Web Development"
                  value={post?.tags?.join(", ")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <div data-color-mode="auto">
                  <MDEditor
                    value={content}
                    onChange={(val) => setContent(val || '')}
                    height={500}
                    preview="edit"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting} className="flex-1">
                  {isSubmitting ? 'Publishing...' : id ? 'Edit Post' : 'Publish Post'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CreatePost;
