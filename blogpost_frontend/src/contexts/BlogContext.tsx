import { CommonApiCall, fastapi_backend_url } from '@/commonFunctions';
import { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  user: {
    username: string;
    email: string;
  };
  post_time?: string;
  post_date?: string;
  hashtags: string;
}

interface BlogContextType {
  posts: BlogPost[];
  setPosts: Dispatch<SetStateAction<BlogPost[]>>;
  addBlog: (post: Omit<BlogPost, 'id' | 'post_time'>) => Promise<boolean>;
  editBlog: (updatedData: Partial<BlogPost>) => Promise<boolean>;
  getBlogById: (id: string) => Promise<BlogPost>;
  getBlogsByUser: () => Promise<BlogPost[]>;
  generateBlog: (updatedData: Partial<BlogPost>) => Promise<BlogPost>;
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
  const response = await CommonApiCall({
    url: `${fastapi_backend_url}/get/all/blogs`,
    type: 'get',
    publicPage: true,
  });
  return response;
};

export const BlogProvider = ({ children }: { children: ReactNode }) => {

  const [posts, setPosts] = useState<BlogPost[]>([]);

  const addBlog = async (post: Omit<BlogPost, 'id' | 'post_time'>) => {
    try {
      const response = await CommonApiCall({
        url: `${fastapi_backend_url}/create/blog`,
        type: 'post',
        payload: post,
      });

      if (response) {
        const newPost: BlogPost = response;
        setPosts(prev => [...prev, newPost]);
        return true
      }
    } catch (error) {
      console.error('Error adding blog:', error);
    }
  };

  const generateBlog = async (updatedData: Partial<BlogPost>) => {
    try {
      const response = await CommonApiCall({
        url: `${fastapi_backend_url}/generate/blog`,
        type: 'post',
        payload: updatedData,
      });

      if (response) {
        return response
      }
    } catch (error) {
      console.error('Error editing blog:', error);
    }
  };

  const editBlog = async (updatedData: Partial<BlogPost>) => {
    try {
      const response = await CommonApiCall({
        url: `${fastapi_backend_url}/edit/blog`,
        type: 'put',
        payload: updatedData,
      });

      if (response) {
        setPosts((posts) => posts.map((data) => data.id === updatedData.id ? response : data))
        return true
      }
    } catch (error) {
      console.error('Error editing blog:', error);
    }
  };

  const getBlogById = async (id: string) => {
    const response = await CommonApiCall({
      url: `${fastapi_backend_url}/get/blog/${id}`,
      type: 'get',
      publicPage: true,
    });
    return response;
  };

  const getBlogsByUser = async () => {
    const response = await CommonApiCall({
      url: `${fastapi_backend_url}/get/user/blogs`,
      type: 'get',
    });
    return response;
  };

  return (
    <BlogContext.Provider
      value={{ posts, setPosts, addBlog, editBlog, getBlogById, getBlogsByUser, generateBlog }}
    >
      {children}
    </BlogContext.Provider>
  );
};
