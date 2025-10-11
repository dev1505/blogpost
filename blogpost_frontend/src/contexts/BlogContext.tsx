import { createContext, useContext, useState, ReactNode } from 'react';

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  readTime: number;
  tags: string[];
}

interface BlogContextType {
  posts: BlogPost[];
  addPost: (post: Omit<BlogPost, 'id' | 'createdAt'>) => void;
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

const DUMMY_POSTS: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with React and TypeScript',
    excerpt: 'Learn how to set up a modern React application with TypeScript for better type safety and developer experience.',
    content: `# Getting Started with React and TypeScript

TypeScript has become an essential tool for modern React development. In this guide, we'll explore how to set up and use TypeScript effectively in your React projects.

## Why TypeScript?

TypeScript provides static type checking, which helps catch errors during development rather than at runtime. This leads to more robust and maintainable code.

## Setting Up

To create a new React project with TypeScript, you can use Vite:

\`\`\`bash
npm create vite@latest my-app -- --template react-ts
\`\`\`

## Benefits

- **Better IDE support**: Autocomplete and IntelliSense
- **Early error detection**: Catch bugs before runtime
- **Improved refactoring**: Safer code changes
- **Better documentation**: Types serve as inline documentation

Start using TypeScript today and experience the difference!`,
    author: {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
    },
    createdAt: '2024-01-15T10:00:00Z',
    readTime: 5,
    tags: ['React', 'TypeScript', 'Web Development'],
  },
  {
    id: '2',
    title: 'Modern CSS Techniques for 2024',
    excerpt: 'Discover the latest CSS features and techniques that will make your web designs stand out.',
    content: `# Modern CSS Techniques for 2024

CSS has evolved dramatically over the years. Let's explore some modern techniques that every developer should know.

## Container Queries

Container queries allow you to style elements based on their container's size, not just the viewport.

## CSS Grid and Flexbox

These layout systems have revolutionized how we build responsive designs.

## Custom Properties

CSS custom properties (variables) enable dynamic theming and maintainable stylesheets.

Stay ahead of the curve with these modern CSS techniques!`,
    author: {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@example.com',
    },
    createdAt: '2024-01-14T14:30:00Z',
    readTime: 7,
    tags: ['CSS', 'Web Design', 'Frontend'],
  },
  {
    id: '3',
    title: 'Building Scalable APIs with Node.js',
    excerpt: 'Best practices for creating robust and scalable REST APIs using Node.js and Express.',
    content: `# Building Scalable APIs with Node.js

Creating scalable APIs requires careful planning and following best practices. Here's what you need to know.

## Architecture Patterns

- **MVC Pattern**: Separating concerns for better organization
- **Middleware**: Handling cross-cutting concerns
- **Error Handling**: Consistent error responses

## Performance Optimization

- Caching strategies
- Database query optimization
- Load balancing

## Security Best Practices

Always validate input, use HTTPS, and implement proper authentication.

Build better APIs with these proven techniques!`,
    author: {
      id: '2',
      name: 'Sarah Chen',
      email: 'sarah@example.com',
    },
    createdAt: '2024-01-13T09:15:00Z',
    readTime: 8,
    tags: ['Node.js', 'API', 'Backend'],
  },
];

export const BlogProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<BlogPost[]>(() => {
    const stored = localStorage.getItem('blog_posts');
    return stored ? JSON.parse(stored) : DUMMY_POSTS;
  });

  const addPost = (post: Omit<BlogPost, 'id' | 'createdAt'>) => {
    const newPost: BlogPost = {
      ...post,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem('blog_posts', JSON.stringify(updatedPosts));
  };

  const getPostById = (id: string) => {
    return posts.find(post => post.id === id);
  };

  const getPostsByAuthor = (authorId: string) => {
    return posts.filter(post => post.author.id === authorId);
  };

  return (
    <BlogContext.Provider value={{ posts, addPost, getPostById, getPostsByAuthor }}>
      {children}
    </BlogContext.Provider>
  );
};
