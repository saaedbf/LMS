"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function TestAuthPage() {
  const [result, setResult] = useState("");

  async function register() {
    const res = await authClient.signUp.email({
      email: "master@lms.local",
      password: "12345678",
      name: "مدیر کل",
    });

    console.log(res);

    setResult(JSON.stringify(res, null, 2));
  }

  async function login() {
    const res = await authClient.signIn.email({
      email: "master@lms.local",
      password: "12345678",
    });

    console.log(res);

    setResult(JSON.stringify(res, null, 2));
  }

  return (
    <div className="p-10 space-y-5">
      <button
        onClick={register}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        ساخت کاربر
      </button>

      <button
        onClick={login}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        ورود
      </button>

      <pre dir="ltr">{result}</pre>
    </div>
  );
}
