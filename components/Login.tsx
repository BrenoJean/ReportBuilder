import React, { useState } from "react";

interface LoginProps {
  onSuccess: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  // Usuários/senhas permitidos
  const allowed = [
    { user: "jean", pass: "123" },
    { user: "keep", pass: "2025" },
    { user: "demo", pass: "demo" },
  ];

  function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const ok = allowed.some(
      (u) => u.user === user.trim() && u.pass === pass.trim()
    );

    if (!ok) {
      setError("Usuário ou senha incorretos.");
      return;
    }

    setError("");
    onSuccess();
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white shadow-xl border border-gray-200 rounded-xl p-8 w-80">
        {/* LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-black text-white w-12 h-12 flex items-center justify-center rounded-md text-lg font-bold">
            K
          </div>
          <h2 className="mt-3 text-lg font-semibold tracking-wide text-gray-800">
            Relatórios Keep
          </h2>
          <p className="text-xs text-gray-500 mt-1">Acesso Restrito</p>
        </div>

        {/* FORM */}
        <form className="space-y-4" onSubmit={handleLogin}>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-2 rounded">
              {error}
            </p>
          )}

          <input
            type="text"
            placeholder="Usuário"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />

          <input
            type="password"
            placeholder="Senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-black"
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Entrar
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          © {new Date().getFullYear()} Keep Gestão Contábil
        </p>
      </div>
    </div>
  );
};

export default Login;
