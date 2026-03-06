import React from 'react';
import { useGameStore } from '../../../store/useGameStore';
import './Phone.css';

export const WsbForum: React.FC = () => {
  const forumPosts = useGameStore((state) => state.forumPosts);

  return (
    <div className="phone-app-content">
      {forumPosts.map((post) => (
        <div key={post.id} className="forum-post">
          <div className="forum-post-header">
            <span className="pixel-bold">u/{post.user}</span>
          </div>
          <div className="forum-post-title pixel-bold">{post.title}</div>
          <div className="forum-post-footer">
            <span className="upvotes">▲ {post.upvotes.toLocaleString()}</span>
            <span>💬 Reply</span>
            <span>🎁 Give Award</span>
          </div>
        </div>
      ))}
    </div>
  );
};
