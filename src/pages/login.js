import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const submit = (event) => {
    event.preventDefault();
    navigate("/dashboard");
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f7f4] p-5">
      <section className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-xl sm:p-10">
        <Link className="mb-10 block w-fit" to="/login">
          <Brand />
        </Link>
        <p className="mb-2 text-xs font-bold tracking-[0.15em] text-gray-500">
          ADMINISTRATOR PORTAL
        </p>
        <h1 className="mb-2 font-['Manrope',sans-serif] text-3xl font-bold text-gray-900">
          Welcome back
        </h1>
        <p className="mb-7 text-base leading-relaxed text-gray-600">
          Sign in to manage community environmental reports.
        </p>
        <form className="space-y-4" onSubmit={submit}>
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-gray-700"
              htmlFor="email"
            >
              Email address
            </label>
            <input
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base outline-green-700 focus:border-green-700"
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@cegct.org"
              required
            />
          </div>
          <div>
            <label
              className="mb-2 block text-sm font-semibold text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <input
              className="h-12 w-full rounded-lg border border-gray-300 px-3 text-base outline-green-700 focus:border-green-700"
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <br/>
          <button
            className="mt-2 h-12 w-full rounded-lg bg-[#185835] text-base font-semibold text-white transition hover:bg-[#12472a]"
            type="submit"
          >
            Sign in
          </button>

        </form>
      </section>
    </main>
  );
};

export default Login;
