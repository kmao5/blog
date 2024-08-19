import {Link} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import { UserContext } from "./UserContext";

export default function Header() {
    const {userInfo, setUserInfo} = useContext(UserContext);

    // empty dependency array means only renders one time when component is first mounted to DOM
    useEffect(() => {
        fetch('https://blog-api-theta-blue.vercel.app/profile', {
            credentials: 'include',
        }).then(response => {
            response.json().then(userInfo => {
                setUserInfo(userInfo);
            });
        });
    }, []); 

    function logout() {
        // invalidate cookie / token and reset username
        fetch('https://blog-api-theta-blue.vercel.app/logout', {
            credentials: 'include',
            method: 'POST',
        });
        setUserInfo(null);
    }

    const username = userInfo?.username;

    return (
        <header>
            <Link to="/" className="logo">Living Poet's Society</Link>
            <nav>
                {/* logged in */}
                {username && (
                    <>
                        <span className="nav-headings">Hello, {username}!</span>
                        <Link to="/create" className="nav-headings">Create new post</Link>
                        <a className="nav-headings" onClick={logout}>Logout</a>
                    </>
                )}

                {/* not logged in */}
                {!username && (
                    <>
                        <Link to="/login" className="nav-headings">Login</Link>
                        <Link to="/register" className="nav-headings">Register</Link>
                    </>
                )}
            </nav>
      </header>
    );
}