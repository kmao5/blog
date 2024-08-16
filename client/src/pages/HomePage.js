import Post from "../Post";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [posts, setPosts] = useState([]);

    // GET is default so don't need to define function
    useEffect(() => {
        fetch('http://localhost:4000/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        });

    }, []); // when we mount HomePage, want to grab all the posts

    return (
        <>
            {posts.length > 0 && posts.map(post => (
                <Post {...post} /> // pass all properites from Post
            ))}
        </>
    );
}