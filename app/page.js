"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

export default function LoginPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  function handleLogin() {
    if (!name && !pass) {
      setError("Please enter name and password");
      return;
    }

    if (name && !pass) {
      setError("Please enter password");
      return;
    }

    if (!name && pass) {
      setError("Please enter name");
      return;
    }

    if (name !== "AkoliyaNirmal") {
      setError("Name is wrong");
      return;
    }

    if (pass !== "0264") {
      setError("Password is wrong");
      return;
    }

    setError("");
    localStorage.setItem("isLoggedIn", "true");
    router.push("/dashboard");
  }

  return (
    <div className="login-bg">
      <div className="login-box">
        <h1>Login</h1>

        <input
          type="text"
          placeholder="Enter Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          type="password"
          placeholder="Enter Password"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
        />

        {error && <p className="error-text">{error}</p>}

        <button onClick={handleLogin}>Login</button>
      </div>
    </div>
  );
}
