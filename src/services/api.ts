/*
 * 模块描述：介绍页的 API 访问层。
 * 介绍页与功能页同域（同一台机器上的两个进程，由分流核心按路径分派），所以 /api/* 直接
 * 用相对路径即可；VITE_LAWVER_API_BASE 只在需要把介绍页指向另一个后端时使用。
 */

const API_BASE = (import.meta.env.VITE_LAWVER_API_BASE || '').replace(/\/+$/, '');

export const apiUrl = (path: string) => `${API_BASE}${path}`;

/** /api/session 里与介绍页账户卡片相关的形状；其余字段（role 等）这里不需要。 */
export interface AccountSession {
  authenticated: boolean;
  username?: string;
  uid?: string;
  custom_id?: string | null;
  plan?: string;
  avatar_version?: number;
}

/**
 * 读取登录态与账户概要：介绍页据此渲染头像/订阅徽标，并把 CTA 指向工作台或登录。
 * 接口不可用（功能页维护中）时按未登录处理，页面照常渲染。
 */
export async function fetchSession(): Promise<AccountSession> {
  try {
    const response = await fetch(apiUrl('/api/session'), { credentials: 'include' });
    if (!response.ok) return { authenticated: false };
    return (await response.json()) as AccountSession;
  } catch {
    return { authenticated: false };
  }
}

export async function loginWithPassword(
  username: string,
  password: string,
): Promise<{ session: AccountSession | null; message: string | null }> {
  try {
    const response = await fetch(apiUrl('/api/login'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { detail?: string };
      return { session: null, message: data.detail || '登录失败，请检查账号与密码。' };
    }
    return { session: await fetchSession(), message: null };
  } catch {
    return { session: null, message: '网络不可用，请稍后重试。' };
  }
}

export async function logout(): Promise<void> {
  try {
    await fetch(apiUrl('/api/logout'), { method: 'POST', credentials: 'include' });
  } catch {
    // 会话 Cookie 清不掉也无妨：下次 /api/session 仍按服务端状态说话。
  }
}

/** 头像地址：avatar_version 参与缓存失效，v=0 表示没有自定义头像。 */
export function avatarUrlOf(session: AccountSession): string | null {
  if (!session.uid || !session.avatar_version) return null;
  return `${apiUrl(`/api/avatars/${session.uid}`)}?v=${session.avatar_version}`;
}
