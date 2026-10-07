import React, { useState } from 'react';

interface LoginProps {
  onSuccess: () => void;
}

// Usuários/senhas permitidos
const allowed = [
  { user: 'jean', pass: '123' },
  { user: 'keep', pass: '2025' },
  { user: 'demo', pass: 'demo' },
];

const Login: React.FC<LoginProps> = ({ onSuccess }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const ok = allowed.some((u) => u.user === user.trim() && u.pass === pass.trim());
    if (!ok) {
      setError('Usuário ou senha incorretos.');
      return;
    }
    setError('');
    onSuccess();
  };

  return (
    <div className="min-h-dvh grid lg:grid-cols-2 bg-white">
      <div className="hidden lg:flex flex-col justify-between bg-zinc-950 text-white p-12">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white text-zinc-950 font-black">K</span>
          <span className="font-semibold tracking-wide">Keep Gestão Contábil</span>
        </div>
        <div>
          <p className="text-4xl font-semibold leading-tight tracking-tight max-w-md">
            Demonstrações financeiras prontas para o cliente, em minutos.
          </p>
          <p className="mt-4 text-white/60 max-w-md">
            Balanço patrimonial, DRE e análise com IA em português ou inglês, com PDF no padrão Keep.
          </p>
        </div>
        <p className="text-xs text-white/40">© {new Date().getFullYear()} Keep Gestão Contábil</p>
      </div>

      <div className="flex items-center justify-center p-6 bg-zinc-50 lg:bg-white">
        <div className="w-full max-w-sm">
          <div className="lg:hidden flex flex-col items-center mb-8">
            <span className="flex size-12 items-center justify-center rounded-xl bg-zinc-950 text-white text-lg font-black">K</span>
            <p className="mt-3 font-semibold text-zinc-900">Keep Gestão Contábil</p>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Entrar</h1>
          <p className="mt-1 text-sm text-zinc-500">Acesso restrito à equipe Keep.</p>

          <form className="mt-8 space-y-4" onSubmit={handleLogin} noValidate>
            {error && (
              <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-200">
                {error}
              </p>
            )}
            <label className="block">
              <span className="field-label">Usuário</span>
              <input
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                placeholder="Usuário"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                className="field-input h-11"
                autoFocus
              />
            </label>
            <label className="block">
              <span className="field-label">Senha</span>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="Senha"
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className="field-input h-11"
              />
            </label>
            <button type="submit" className="btn btn-primary w-full h-11 text-[15px]">
              Entrar
            </button>
          </form>

          <p className="lg:hidden text-center text-xs text-zinc-400 mt-10">© {new Date().getFullYear()} Keep Gestão Contábil</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
