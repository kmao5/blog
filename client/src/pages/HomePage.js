import Post from "../Post";
import { useEffect, useState } from "react";

export default function HomePage() {
    const [posts, setPosts] = useState([]);

    // GET is default so don't need to define function
    useEffect(() => {
        fetch('https://blog-api-tdbm.onrender.com/post').then(response => {
            response.json().then(posts => {
                setPosts(posts);
            });
        });

    }, []); // when we mount HomePage, want to grab all the posts

    // function removePostFromState(postId) {
    //     setPosts(posts.filter(post => post._id !== postId));
    // }

    return (
        <>
            {posts.length > 0 && posts.map(post => (
                <Post key={post._id} {...post} /> // pass all properites from Post
            ))}

        </>
    );
}