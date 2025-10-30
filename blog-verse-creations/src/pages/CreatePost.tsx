import { Navbar } from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { BlogPost, useBlog } from '@/contexts/BlogContext';
import { useToast } from '@/hooks/use-toast';
import MDEditor from '@uiw/react-md-editor';
import { ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const CreatePost = () => {
  const { addBlog, editBlog, generateBlog, posts } = useBlog();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  const { id } = useParams();
  const [post, setPost] = useState<BlogPost>();

  useEffect(() => {
    (async () => {
      setIsLoadingPost(true);
      if (id) {
        setPost(posts?.find((blog) => blog?.id === id))
      } else {
        setPost({
          title: '',
          content: '',
          hashtags: '',
          user: {
            username: user?.username || '',
            email: user?.email || ''
          }
        } as BlogPost);
      }
      setIsLoadingPost(false);
    })();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const hashtags = formData.get('hashtags') as string
    const content = post.content
    const excerpt = post.content.substring(0, 150).replace(/[#*`]/g, '') + '...';

    if (!id) {
      (async () => {
        const response = await addBlog({
          title,
          content,
          excerpt,
          user: {
            username: post.user.username,
            email: post.user.email,
          },
          hashtags,
          generated_by_ai: post?.generated_by_ai,
          user_cost: post?.user_cost,
        })
        if (response) {
          toast({
            toastType: "success",
            title: 'Post published!',
            description: 'Your blog post has been published successfully.',
          });
          navigate('/');
          setIsSubmitting(false);
        }
        else {
          toast({
            toastType: "error",
            title: 'Some error occured !',
            description: 'There was some error while publishing your post',
          });
          setIsSubmitting(false);
        }
      }
      )()
    }
    else {
      (async () => {
        const response = await editBlog({
          title,
          content,
          excerpt,
          id,
          user: {
            username: post.user.username,
            email: post.user.email,
          },
          hashtags,
          generated_by_ai: post?.generated_by_ai,
          user_cost: post?.user_cost,
        })
        if (response) {
          toast({
            toastType: "success",
            title: 'Post edited!',
            description: 'Your blog post has been edited successfully.',
          });
          navigate('/');
          setIsSubmitting(false);
        }
        else {
          toast({
            toastType: "error",
            title: 'Some error occured !',
            description: 'There was some error while editing your post',
          });
          setIsSubmitting(false);
        }
      })()
    }
  };

  const handleGenerateContent = async () => {
    const title = (document.getElementById("title") as HTMLInputElement)?.value;
    const hashtags = (document.getElementById("hashtags") as HTMLInputElement)?.value;

    if (!title) {
      toast({
        title: 'Add Field',
        description: 'Please add Title and Tags to generate content relative to the topic',
        toastType: 'warning',
      });
      return;
    }
    if (!hashtags) {
      toast({
        title: 'Add Field',
        description: 'Please add Tags to generate content relative to the topic',
        toastType: 'warning',
      });
      return;
    }

    try {
      setIsGenerating(true);
      toast({
        title: 'Generating content...',
        description: 'AI is crafting your blog post',
        toastType: 'info',
      });
      const response = await generateBlog({ title, hashtags, user: post.user });
      setPost({ ...response });
      toast({
        title: 'Content generated!',
        description: 'Your AI-generated blog is ready to review',
        toastType: 'success',
      });
    } catch (error) {
      toast({
        title: 'Generation failed',
        description: 'Failed to generate content. Please try again.',
        toastType: 'error',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoadingPost) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-10 w-24 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

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
            className="mb-6 bg-primary/10 hover:bg-primary/20 animate-pulse-glow"
            onClick={handleGenerateContent}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate From AI
              </>
            )}
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
                  onChange={(e) => { setPost({ ...post, title: e.target.value }) }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="hashtags">Hashtags (comma-separated)</Label>
                <Input
                  id="hashtags"
                  name="hashtags"
                  placeholder="React, JavaScript, Web Development"
                  value={post?.hashtags}
                  onChange={(e) => { setPost({ ...post, hashtags: e.target.value }) }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <div data-color-mode="auto" className={isGenerating ? 'animate-pulse-glow' : ''}>
                  <MDEditor
                    value={post?.content}
                    onChange={(val) => setPost({ ...post, content: val || '' })}
                    height={500}
                    preview="edit"
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <Button type="submit"
                  disabled={isSubmitting}
                  className="flex-1">
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
