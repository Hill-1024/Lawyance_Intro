/*
 * 模块描述：介绍页右上角的账户入口。
 *
 * 未登录：一颗安静的「登录」药丸，悬停浮现「登录即刻开始体验」；点击弹出登录弹窗。
 * 已登录：头像 + 订阅徽标（Go/Pro/Max/Business，按量不发徽标），悬停浮现三行——
 *   靠头像的一行是用户 ID（非交互），下面是「个人资料」「退出登录」两个真实动作。
 *
 * 交互约定与工作台菜单一致：悬停 120ms 意图延迟打开、离开 200ms 宽限关闭，
 * 触屏与键盘走点击/焦点；Escape 与外点关闭。弹层动效只动 transform/opacity，
 * 系统层面的 prefers-reduced-motion 会让浮层动画归零（见 intro-account.css）。
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { ChartColumn, LogOut, Sparkles, UserRound, X } from 'lucide-react';
import { BrandMark } from '../components/Brand';
import { avatarUrlOf, loginWithPassword, logout, type AccountSession } from '../services/api';

const PLAN_BADGES: Record<string, { label: string; className: string }> = {
  go: { label: 'Go', className: 'account-badge--go' },
  pro: { label: 'Pro', className: 'account-badge--pro' },
  max: { label: 'Max', className: 'account-badge--max' },
  business: { label: 'Business', className: 'account-badge--business' },
};

const PLAN_LABELS: Record<string, string> = {
  metered: '按量账户',
  go: 'Go 订阅',
  pro: 'Pro 订阅',
  max: 'Max 订阅',
  business: 'Business 团队',
};

type AccountState =
  | { phase: 'loading' }
  | { phase: 'anonymous' }
  | { phase: 'authed'; session: AccountSession };

export function AccountWidget({
  account,
  onAccountChange,
}: {
  account: AccountState;
  onAccountChange: (session: AccountSession | null) => void;
}) {
  const [open, setOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const hoverTimers = useRef<{ open?: number; close?: number }>({});

  // 外点关闭：只挂一次，menu 开着才生效。
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  // 卸载兜底：清掉悬停计时器，避免闭包里 setState 打到已卸载组件。
  useEffect(
    () => () => {
      window.clearTimeout(hoverTimers.current.open);
      window.clearTimeout(hoverTimers.current.close);
    },
    [],
  );

  const scheduleOpen = useCallback(() => {
    window.clearTimeout(hoverTimers.current.close);
    hoverTimers.current.open = window.setTimeout(() => setOpen(true), 120);
  }, []);

  const scheduleClose = useCallback(() => {
    window.clearTimeout(hoverTimers.current.open);
    hoverTimers.current.close = window.setTimeout(() => setOpen(false), 200);
  }, []);

  const cancelClose = useCallback(() => {
    window.clearTimeout(hoverTimers.current.close);
  }, []);

  const doLogout = useCallback(async () => {
    setOpen(false);
    await logout();
    onAccountChange(null);
  }, [onAccountChange]);

  if (account.phase === 'loading') {
    // 骨架与最终头像同形（34px 圆），避免会话返回时跳一下。
    return (
      <div className="account-root account-root--loading" aria-hidden="true">
        <span className="account-avatar account-avatar--skeleton" />
      </div>
    );
  }

  if (account.phase === 'anonymous') {
    return (
      <div className="account-root" ref={rootRef}>
        <button
          type="button"
          className="account-login-pill"
          aria-haspopup="dialog"
          aria-expanded={loginOpen}
          onMouseEnter={scheduleOpen}
          onMouseLeave={scheduleClose}
          onFocus={scheduleOpen}
          onBlur={scheduleClose}
          onClick={() => {
            setOpen(false);
            setLoginOpen(true);
          }}
        >
          登录
        </button>
        {!loginOpen && (
          <div className="account-flyout account-flyout--hint" role="status">
            <span>登录即刻开始体验</span>
          </div>
        )}
        {loginOpen && (
          <LoginModal
            onClose={() => setLoginOpen(false)}
            onLoggedIn={(session) => {
              setLoginOpen(false);
              onAccountChange(session);
            }}
          />
        )}
      </div>
    );
  }

  const session = account.session;
  const badge = PLAN_BADGES[session.plan ?? 'metered'];
  const avatarSrc = avatarUrlOf(session);
  const handle = session.custom_id || session.username || '';
  const planLabel = PLAN_LABELS[session.plan ?? 'metered'] ?? PLAN_LABELS.metered;

  return (
    <div
      className="account-root"
      ref={rootRef}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
    >
      <button
        type="button"
        className="account-trigger"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onFocus={cancelClose}
      >
        <span className="account-avatar">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="account-avatar__img" />
          ) : (
            <span className="account-avatar__initial" aria-hidden="true">
              {(session.username || '?').slice(0, 1).toUpperCase()}
            </span>
          )}
        </span>
        {badge && (
          <span className={`account-badge ${badge.className}`} aria-hidden="true">
            {badge.label}
          </span>
        )}
      </button>

      {open && (
        <div className="account-flyout" role="menu" aria-label="账户">
          {/* 用户 ID 行：纯展示，不可点。自定义 ID 优先，回退用户名。 */}
          <div className="account-flyout__identity" role="presentation">
            <span className="account-avatar account-avatar--flyout">
              {avatarSrc ? (
                <img src={avatarSrc} alt="" className="account-avatar__img" />
              ) : (
                <span className="account-avatar__initial" aria-hidden="true">
                  {(session.username || '?').slice(0, 1).toUpperCase()}
                </span>
              )}
            </span>
            <span className="account-flyout__id-text">
              <span className="account-flyout__handle">@{handle}</span>
              <span className="account-flyout__plan">{planLabel}</span>
            </span>
          </div>
          <div className="account-flyout__divider" aria-hidden="true" />
          {session.plan !== "max" && session.plan !== "business" && (
            <a
              className="account-flyout__item account-flyout__item--upgrade"
              role="menuitem"
              href="/pricing"
              onClick={() => setOpen(false)}
            >
              <Sparkles size={15} strokeWidth={2} aria-hidden="true" />
              <span className="account-upgrade-text">升级订阅</span>
            </a>
          )}
          <a
            className="account-flyout__item"
            role="menuitem"
            href="/usage"
            onClick={() => setOpen(false)}
          >
            <ChartColumn size={15} strokeWidth={2} aria-hidden="true" />
            用量控制台
          </a>
          <a
            className="account-flyout__item"
            role="menuitem"
            href="/settings/account"
            onClick={() => setOpen(false)}
          >
            <UserRound size={15} strokeWidth={2} aria-hidden="true" />
            个人资料
          </a>
          <button
            type="button"
            className="account-flyout__item account-flyout__item--danger"
            role="menuitem"
            onClick={() => void doLogout()}
          >
            <LogOut size={15} strokeWidth={2} aria-hidden="true" />
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}

/** 登录弹窗：品牌一致的最小表单；Esc/遮罩关闭，成功后把新会话交回布局。 */
function LoginModal({
  onClose,
  onLoggedIn,
}: {
  onClose: () => void;
  onLoggedIn: (session: AccountSession) => void;
}) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const firstFieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstFieldRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy) return;
    setError('');
    setBusy(true);
    const result = await loginWithPassword(username.trim(), password);
    setBusy(false);
    if (!result.session) {
      setError(result.message ?? '登录失败，请稍后重试。');
      return;
    }
    onLoggedIn(result.session);
  };

  return (
    <div
      className="account-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="account-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-modal-title"
      >
        <header className="account-modal__head">
          <BrandMark className="account-modal__brand" />
          <h2 className="account-modal__title" id="account-modal-title">
            登录 Lawver
          </h2>
          <button
            type="button"
            className="account-modal__close"
            aria-label="关闭登录窗口"
            onClick={onClose}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </header>
        <form className="account-modal__form" onSubmit={submit}>
          <label className="account-modal__field">
            <span>账号</span>
            <input
              ref={firstFieldRef}
              name="username"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </label>
          <label className="account-modal__field">
            <span>密码</span>
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>
          {error && (
            <p className="account-modal__error" role="alert">
              {error}
            </p>
          )}
          <button type="submit" className="account-modal__submit" disabled={busy || !username || !password}>
            {busy ? '正在登录…' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}
