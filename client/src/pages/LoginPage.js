import {useContext, useState} from "react";
import {Navigate} from "react-router-dom";
import {UserContext} from "../UserContext";

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [redirect, setRedirect] = useState(false);
    const {setUserInfo} = useContext(UserContext);

    async function login(e) {
        e.preventDefault();
        const response = await fetch('https://blog-api-tdbm.onrender.com/login', {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: {'Content-Type': 'application/json'},
            credentials: 'include', // save cookie, included to browser and next request
        });

        if(response.ok) {
            // once logged in, pass down context and redirect to homepage
            response.json().then(userInfo => {
                setUserInfo(userInfo);
                setRedirect(true);
            });
        } else {
            alert('Wrong credentials.');
        }
    }

    // redirect to homepage
    if(redirect) {
        return <Navigate to={'/'} />
    }

    return (
        <form className="login" onSubmit={login}>
            <h1>Login</h1>
            <input type="text" 
                    placeholder="username" 
                    value={username} 
                    onChange={e => setUsername(e.target.value)}/>
            <input type="text" 
                    placeholder="password" 
                    value={password} 
                    onChange={e => setPassword(e.target.value)}/>
            <button>Login</button>
        </form>
    );
}