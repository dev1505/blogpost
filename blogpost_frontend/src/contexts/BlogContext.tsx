import { CommonApiCall, fastapi_backend_url } from '@/commonFunctions';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface BlogPost {
  id: string,
  username: string;
  title: string;
  content: string;
  excerpt?: string;
  author: {
    username: string;
    email: string;
  };
  post_time: string;
  post_date: string;
  readTime?: number;
  tags: string[];
}

interface BlogContextType {
  posts: BlogPost[];
  setPosts: (post: BlogPost[]) => BlogPost[];
  addPost: (post: Omit<BlogPost, 'id' | 'post_time'>) => void;
  getPostById: (id: string) => BlogPost | undefined;
  getPostsByAuthor: (authorId: string) => BlogPost[];
}

const BlogContext = createContext<BlogContextType | undefined>(undefined);

export const useBlog = () => {
  const context = useContext(BlogContext);
  if (!context) {
    throw new Error('useBlog must be used within BlogProvider');
  }
  return context;
};

export const getAllBlogs = async () => {
  const response = await CommonApiCall({ url: fastapi_backend_url + "/get/all/blogs", type: "get" })
  console.log(response)
  return response;
}

export const BlogProvider = ({ children }: { children: ReactNode }) => {

  const [posts, setPosts] = useState<BlogPost[]>(function () {
    const stored = localStorage.getItem('blog_posts');
    return JSON.parse(stored)
  });


  const addPost = (post: Omit<BlogPost, 'id' | 'post_time'>) => {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      post_time: new Date().toISOString(),
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
  };

  const getPostById = (id: string) => {
    return posts.find(post => post.id === id);
  };

  const getPostsByAuthor = (authorId: string) => {
    return posts.filter(post => post.author.username === authorId);
  };

  return (
    <BlogContext.Provider value={{ posts, setPosts, addPost, getPostById, getPostsByAuthor }}>
      {children}
    </BlogContext.Provider>
  );
};
