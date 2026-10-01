"use client";

import Link from "next/link";
import { LogOut, UserRound, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";

import { authChanging, authChanged, hasGuestData, importGuestData, selectOwner } from "@/lib/sync/storage";

type AuthStatus = {
  configured: boolean;
  authenticated: boolean;
  hasAccounts: boolean;
  user: { id: string; username: string } | null;
};
type AuthMode = "login" | "register";

export function CloudSyncControl() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<AuthStatus | null>(null);
  const [mode, setMode] = useState<AuthMode>("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const refresh = async () => {
    try {
      const response = await fetch("/api/auth/status", { cache: "no-store" });
      if (response.ok) {
        const nextStatus = await response.json() as AuthStatus;
        setStatus(nextStatus);
        if (!nextStatus.authenticated && !nextStatus.hasAccounts) setMode("register");
      } else {
        setStatus(null);
      }
    } catch {
      setStatus(null);
    }
  };

  useEffect(() => { void refresh(); }, []);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    if (mode === "register" && password !== confirmPassword) {
      setMessage("两次输入的密码不一致。");
      return;
    }
    authChanging();
    try {
      const response = await fetch(`/api/auth/${mode}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string } | null;
        setMessage(body?.error ?? "无法连接账号服务。");
        return;
      }
      const result = await response.json() as { user: { id: string } };
      selectOwner(result.user.id);
      setPassword(""); setConfirmPassword("");
      setMessage(mode === "register" ? "注册成功，已登录并启用私有同步。" : "登录成功，已启用私有同步。");
      await refresh();
    } catch { setMessage("无法连接账号服务，请重试。"); }
    finally { authChanged(); }
  };

  const logout = async () => {
    authChanging();
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) { setMessage("退出失败，请重试。"); return; }
      selectOwner(null);
      setMessage("已退出；账号数据独立保留在当前浏览器。");
      await refresh();
    } catch { setMessage("退出失败，请重试。"); }
    finally { authChanged(); }
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="rounded-lg p-2 text-lofi-cream/70 hover:bg-white/10 hover:text-lofi-cream"
        title={status?.authenticated ? `账号：${status.user?.username ?? ""}` : "账号登录"}
        aria-label="账号登录"
      >
        <UserRound className="h-5 w-5" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-lofi-brown/30 bg-lofi-dark/95 p-4 text-sm text-lofi-cream shadow-2xl backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{status?.authenticated ? "已登录账号" : mode === "register" ? "注册账号" : "账号登录"}</p>
              <p className="mt-1 text-xs text-lofi-cream/55">
                {status?.authenticated
                  ? `你好，${status.user?.username ?? ""}。Todo、日记、成就和设置每 10 秒同步。`
                  : "账号数据独立保存；未登录时只保留在当前浏览器。"}
              </p>
            </div>
            <button type="button" onClick={() => setOpen(false)} aria-label="关闭" className="p-1 text-lofi-cream/60 hover:text-lofi-cream"><X className="h-4 w-4" /></button>
          </div>
          {status?.configured && !status.authenticated && (
            <>
              {status.hasAccounts && (
                <div className="mt-4 grid grid-cols-2 rounded-lg border border-lofi-brown/30 p-1 text-xs">
                  <button type="button" onClick={() => setMode("login")} className={`rounded-md px-2 py-1.5 ${mode === "login" ? "bg-lofi-accent/80 text-lofi-dark" : "text-lofi-cream/65"}`}>登录</button>
                  <button type="button" onClick={() => setMode("register")} className={`rounded-md px-2 py-1.5 ${mode === "register" ? "bg-lofi-accent/80 text-lofi-dark" : "text-lofi-cream/65"}`}>注册</button>
                </div>
              )}
              <form className="mt-4 space-y-2" onSubmit={submit}>
                <label className="block text-xs text-lofi-cream/70" htmlFor="account-name">账号</label>
                <input id="account-name" autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={32} className="w-full rounded-lg border border-lofi-brown/40 bg-black/20 px-3 py-2 text-lofi-cream outline-none focus:border-lofi-accent" />
                <label className="block text-xs text-lofi-cream/70" htmlFor="account-password">密码</label>
                <input id="account-password" type="password" autoComplete={mode === "register" ? "new-password" : "current-password"} value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} maxLength={128} className="w-full rounded-lg border border-lofi-brown/40 bg-black/20 px-3 py-2 text-lofi-cream outline-none focus:border-lofi-accent" />
                {mode === "register" && (
                  <>
                    <label className="block text-xs text-lofi-cream/70" htmlFor="account-password-confirm">确认密码</label>
                    <input id="account-password-confirm" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} maxLength={128} className="w-full rounded-lg border border-lofi-brown/40 bg-black/20 px-3 py-2 text-lofi-cream outline-none focus:border-lofi-accent" />
                  </>
                )}
                <button type="submit" className="w-full rounded-lg bg-lofi-accent/80 px-3 py-2 font-medium text-lofi-dark hover:bg-lofi-accent">{mode === "register" ? "注册并登录" : "登录"}</button>
              </form>
            </>
          )}
          {status?.configured && status.authenticated && (
            <div className="mt-4 flex items-center justify-between gap-2">
              <Link href="/passport" className="rounded-lg border border-lofi-accent/60 px-3 py-2 text-lofi-accent hover:bg-lofi-accent/15">Passport</Link>
              <button type="button" onClick={logout} className="inline-flex items-center gap-2 rounded-lg border border-lofi-brown/40 px-3 py-2 text-lofi-cream/80 hover:bg-white/10"><LogOut className="h-4 w-4" />退出</button>
            </div>
          )}
          {status?.authenticated && hasGuestData() && (
            <button type="button" onClick={async () => {
              if (window.confirm("将未登录时的本地数据导入当前账号？仅填充缺失项目，不覆盖账号记录；原本地副本会保留。")) {
                try { await importGuestData(); } catch { setMessage("无法读取账号数据，请稍后重试导入。"); }
              }
            }} className="mt-3 text-xs text-lofi-accent">导入未登录时的本地数据</button>
          )}
          {status && !status.configured && <p className="mt-4 text-xs text-lofi-cream/55">此本机静态预览尚未配置服务器同步。</p>}
          {message && <p className="mt-3 text-xs text-lofi-accent">{message}</p>}
        </div>
      )}
    </div>
  );
}
