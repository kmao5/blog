import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {format} from "date-fns"; // yarn lib
import { UserContext } from "../UserContext";
import {Link, Navigate} from "react-router-dom";

export default function PostPage() {
    const {id} = useParams();
    const [postInfo, setPostInfo] = useState(null);
    const [redirect, setRedirect] = useState(false);
    const {userInfo} = useContext(UserContext);
    const [posts, setPosts] = useState([]);

    // grab info about the post when PostPage component is mounted
    useEffect(() => {
        
        fetch(`https://blog-api-theta-blue.vercel.app/post/${id}`)
            .then(response => {
                response.json().then(postInfo => {
                    setPostInfo(postInfo);
            });
        });
    }, []);

    // delete post
    async function deletePost() {
        const confirmed = window.confirm('Are you sure you want to delete this post?');
        if (!confirmed) return;

        try {
            const response = await fetch(`https://blog-api-theta-blue.vercel.app/ost/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setPosts(posts.filter(post => post._id !== id)); // delete curr post from posts
                setRedirect(true); // go back to homepage
            } else {
                const errorData = await response.json();
                alert(`Failed to delete post: ${errorData.error}`);
            }
        } catch (error) {
            console.log(error);
            console.error('Error deleting post: ', error);
            alert('An error occurred');
        }
        
    }

    if (redirect) {
        return <Navigate to="/" />; // Redirect to homepage after deletion
    }

    if(!postInfo) return '';

    return (
        <div className="post-page">
            <h2>{postInfo.title}</h2>
            <time>{format(new Date(postInfo.createdAt), 'MMM d, yyyy HH:mm')}</time> 
            <div className="author">by @{postInfo.author.username}</div>
            {userInfo.id === postInfo.author._id && (
                <div className="edit-row">
                    <Link className="edit-button" to={`/edit/${postInfo._id}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Edit post
                    </Link>
                </div>
            )}

            <div className="image">
                <img src={`https://blog-api-theta-blue.vercel.app/${postInfo.cover}`} alt="image" />
            </div>

            <div className="content" dangerouslySetInnerHTML={{__html:postInfo.content}}/>

            {userInfo.id === postInfo.author._id && (
                <div className="delete-row">
                    <Link className="delete-button" onClick={deletePost}>
                        Delete post
                    </Link>
                </div>
            )}
        </div>
        
    );
}