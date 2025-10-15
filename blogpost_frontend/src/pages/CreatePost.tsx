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
import { ArrowLeft, Sparkles } from 'lucide-react';
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

  const handleGenerateContent = () => {
    const title = document.getElementById("title")?.value | "";
    const tags = document.getElementById("tags")?.value | "";
    if (!title) {
      toast({
        title: 'Add Field',
        description: 'Please add Title and Tags to generate content relative to the topic',
        toastType: 'warning',
      });
    }
    else if (!tags) {
      toast({
        title: 'Add Field',
        description: 'Please add Tags to generate content relative to the topic',
        toastType: 'warning',
      });
    }
  }

  const str = "# 1st speech at college annual celebration\n\nIt feels absolutely surreal to be standing here today, addressing all of you at our College Annual Celebration. My heart is a strange mix of exhilaration and a tiny flutter of nerves, knowing this is my **first** time speaking on such an esteemed platform. Looking out at all your familiar faces – friends, faculty, and family – it truly feels like a culmination of so much.\n\nJust a few years ago, I walked through these gates, a fresh-faced newcomer, full of dreams and a little uncertainty. This college has not just been an institution of learning; it has been a second home, a crucible where friendships were forged, ideas were challenged, and personalities blossomed. Every lecture, every project, every late-night study session, and yes, even those unforgettable moments of shared laughter and camaraderie, have shaped the person I am today. We've learned not just from books, but from each other, from our mentors, and from every experience, big or small.\n\nThis annual celebration isn't just a day to mark the passage of another year; it's a moment to pause, reflect, and appreciate the vibrant tapestry we've all woven together. It's about celebrating our achievements, acknowledging our growth, and cheering on the spirit of community that binds us. To my fellow students, especially those just beginning their journey, I urge you to embrace every opportunity, to be curious, to be resilient, and most importantly, to be *you*. Don't be afraid to make mistakes, for they are often our greatest teachers.\n\nI want to extend my deepest gratitude to our incredible faculty members and the college administration for their unwavering support, guidance, and patience. Your dedication to nurturing young minds goes far beyond the curriculum. And to our parents and guardians, thank you for being our constant pillars of strength and for believing in us every step of the way.\n\nAs we look forward, let's carry the lessons learned and the bonds formed within these walls. Let's continue to inspire, innovate, and make a positive impact wherever we go. This moment, right here, right now, is a memory I will cherish forever.\n\nThank you.\n\n#1st #me"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className='flex justify-between'>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="mb-6 bg-blue-200"
            onClick={() => handleGenerateContent()}
          >
            <Sparkles />
            Generate From AI
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create New Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} id='createPostForm' className="space-y-6">
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
                    value={str}
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
