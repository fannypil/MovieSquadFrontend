"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import PostForm from "./PostForm"
import PostLikes from "./PostLikes"
import PostComments from "./PostComments"
import ConditionalRender from "../auth/ConditionalRender"
import AuthorizedButton from "../auth/AuthorizedButton"
import { useAuth } from "@/app/hooks/useAuth"

export default function PostCard({ post, currentUser, isGroupAdmin, onPostDeleted, onPostUpdated }) {
    const [isEditing, setIsEditing] = useState(false);
    const [editContent, setEditContent] = useState(post.content);
    const [isLoading, setIsLoading] = useState(false);
    const { user, token } = useAuth();

     // Create context for RBAC
    const postContext = {
        authorId: post.author?._id || post.author?.id,
        groupId: post.groupId,
        postAuthorId: post.author?._id || post.author?.id
    };
  
    const handleDeletePost = async () => {
        if (!window.confirm('Are you sure you want to delete this post?')) {
            return;
        }
        
        setIsLoading(true);
        try {
            await axios.delete(`http://localhost:3001/api/posts/${post._id}`, {
                headers: {
                    'x-auth-token': token
                }
            });
            
            // Call the parent component to update the posts list
            if (onPostDeleted) {
                onPostDeleted(post._id);
            }
            
            alert('Post deleted successfully!');
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEditPost = async () => {
        if (!editContent.trim()) {
            alert('Post content cannot be empty');
            return;
        }
        
        setIsLoading(true);
        try {
            const response = await axios.put(`http://localhost:3001/api/posts/${post._id}`, {
                content: editContent.trim()
            }, {
                headers: {
                    'x-auth-token': token,
                    'Content-Type': 'application/json'
                }
            });
            // Update the post in the parent component
            if (onPostUpdated) {
                onPostUpdated(response.data);
            }
            
            setIsEditing(false);
            alert('Post updated successfully!');
        } catch (error) {
            console.error('Error updating post:', error);
            alert('Failed to update post. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };
   

    return (
        
        <div className="card mb-3 post-card shadow-sm">
            <div className="card-body">
                {/* Action Buttons */}
                  <div className="d-flex justify-content-end mb-2">
                    <ConditionalRender
                        permission="EDIT_POST"
                        context={postContext}
                    >
                        <AuthorizedButton
                            permission="EDIT_POST"
                            context={postContext}
                            className="btn btn-outline-primary btn-sm me-2"
                            onClick={() => setIsEditing(!isEditing)}
                            disabled={isLoading}
                        >
                            {isEditing ? (
                                <>
                                    <i className="bi bi-x-circle me-1"></i>
                                    Cancel
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-pencil me-1"></i>
                                    Edit
                                </>
                            )}                        
                            </AuthorizedButton>
                    </ConditionalRender>
                    
                    <ConditionalRender
                        permission="DELETE_POST"
                        context={postContext}
                    >
                        <AuthorizedButton
                            permission="DELETE_POST"
                            context={postContext}
                            className="btn btn-outline-danger btn-sm"
                            onClick={handleDeletePost}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-trash me-1"></i>
                                    Delete
                                </>
                            )}
                        </AuthorizedButton>
                    </ConditionalRender>
                </div>

                   {/* Post Content */}
                {isEditing ? (
                    <div className="mb-3">
                        <textarea
                            className="form-control"
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows="3"
                            style={{ backgroundColor: '#3c3c3c', border: '1px solid #555', color: 'white' }}
                            disabled={isLoading}
                        />
                        <div className="mt-2">
                            <button
                                className="btn btn-primary btn-sm me-2"
                                onClick={handleEditPost}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check-circle me-1"></i>
                                        Save Changes
                                    </>
                                )}                            </button>
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditContent(post.content);
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <PostForm post={post} />
                )}

                <hr />
                <PostLikes postId={post._id} likes={post.likes} />
                <PostComments postId={post._id} comments={post.comments} />
            </div>
        </div>
    );
}