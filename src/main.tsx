/*
 * 模块描述：介绍页启动入口。挂载 React、接入浏览器路由、加载设计 token 底座。
 * 这里不注册 Service Worker：介绍页不需要离线壳，而 SW 的缓存回放会在功能页维护时
 * 把用户留在旧页面上。
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/tokens.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
