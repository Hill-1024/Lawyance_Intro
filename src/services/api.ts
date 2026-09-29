/*
 * 模块描述：介绍页的 API 访问层。
 * 介绍页与功能页同域（同一台机器上的两个进程，由分流核心按路径分派），所以 /api/* 直接
 * 用相对路径即可；VITE_LAWVER_API_BASE 只在需要把介绍页指向另一个后端时使用。
 */

const API_BASE = (import.meta.env.VITE_LAWVER_API_BASE || '').replace(/\/+$/, '');

export const apiUrl = (path: string) => `${API_BASE}${path}`;

/**
 * 读取登录态：介绍页据此把 CTA 指向工作台或登录页。
 * 接口不可用（功能页维护中）时按未登录处理，页面照常渲染。
 */
export async function fetchSession(): Promise<boolean> {
  try {
    const response = await fetch(apiUrl('/api/verify_auth'), { credentials: 'include' });
    return response.ok;
  } catch {
    return false;
  }
}
