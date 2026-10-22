import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Brand from "../components/Brand";
import { useDashboard } from "../lib/AppContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useDashboard();
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f7f4] p-5">
      <section className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-8 shadow-xl sm:p-11">
        <Link className="mb-10 block w-fit" to="/login">
          <Brand />
        </Link>
        <p className="mb-4 text-sm font-bold tracking-[0.15em] text-gray-500">
          ADMINISTRATOR PORTAL
        </p>
        <p className="mb-9 text-lg leading-relaxed text-gray-600">
          Sign in to manage community environmental reports.
        </p>
        <form className="space-y-5" onSubmit={submit}>
          {error && ( 
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800" role="alert">
              {error}
            </p>
          )}
          <div>
            <label
              className="mb-2 block text-base font-semibold text-gray-700"
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
              className="mb-2 block text-base font-semibold text-gray-700"
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
          <button
            className="mt-2 h-14 w-full rounded-lg bg-[#185835] text-lg font-semibold text-white transition hover:bg-[#12472a]"
            type="submit"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>

        </form>
      </section>
    </main>
  );
};

export default Login;
