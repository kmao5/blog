import {useState} from "react";

export default function RegisterPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    async function register(e) {
        e.preventDefault(); // will not try to redirect from this page

        // send POST request
       const response = await fetch('https://blog-api-tdbm.onrender.com/register', {
            method: 'POST',
            body: JSON.stringify({username, password}),
            headers: {'Content-Type': 'application/json'},
        })
        if(response.status == 200) {
            alert('Registration successful!');
        } else {
            alert('Registration failed.');
        }
    }

    return (
        <form className="register" onSubmit={register}>
            <h1>Register</h1>
            <input type="text"
                placeholder="username"
                value={username}
                onChange={e => setUsername(e.target.value)}/>
            <input type="password" 
                placeholder="password"
                value={password}
                onChange={e => setPassword(e.target.value)}/>
            <button>Register</button>
        </form>
    );
}