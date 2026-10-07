import React, { useState } from 'react';
import Brand from '../components/Brand';

function Login({
  onLogin,
  notify,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    if (onLogin) {
      onLogin();
    }

    if (notify) {
      notify('Demo mode: welcome to CEGCT');
    }
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <Brand />

        <div className="eyebrow">
          ADMINISTRATOR PORTAL
        </div>

        <h1>Welcome back</h1>

        <p>
          Sign in to manage community environmental reports.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="email">
            Email address
          </label>

          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            placeholder="you@cegct.org"
          />

          <label htmlFor="password">
            Password
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            placeholder="Enter your password"
          />

          <button
            className="primary full"
            type="submit"
          >
            Sign in
            <span>→</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;