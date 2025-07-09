"use client"

import { useEffect, useState } from "react"

export default function PostForm({post}) {
     return (
        <div>
            <div className="d-flex align-items-center mb-2">
                <strong className="me-2">{post?.author?.name || post?.author?.username}</strong>
                <small className="text-muted">
                    {new Date(post?.createdAt).toLocaleString()}
                </small>
            </div>
            <p className="mb-2">{post?.content}</p>
            {post?.movieTitle && (
                <div className="badge bg-secondary mb-2">
                    🎬 {post.movieTitle}
                </div>
            )}
        </div>
    )
}