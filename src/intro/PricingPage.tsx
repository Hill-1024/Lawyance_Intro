/*
 * 模块描述：定价页。套餐目录来自后端 /api/plans（不在前端硬编码价格），
 * 支付未开放：每张卡底部「订阅」打开客服二维码弹窗，由客服一对一开通。
 * 视觉沿用介绍页语言（.section / .download-card / .highlight-card）。
 */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, MessageCircle, X } from "lucide-react";
import { apiUrl } from "../services/api";
import "./intro-pricing.css";

interface AccountProfile {
  username: string;
  plan: string;
  pending_plan: string | null;
  pending_effective_at: string | null;
}

/** 自服务只放行降级与切回按量；升级仍走客服（与后端 PLAN_RANK 口径一致）。 */
const PLAN_RANK: Record<string, number> = { metered: 0, go: 1, pro: 2, max: 3 };

const formatDate = (iso: string | null) => {
  if (!iso) return "";
  const day = new Date(iso);
  return `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
};

interface Plan {
  id: string;
  name: string;
  tagline: string;
  price_month: number | null;
  price_year: number | null;
  monthly_credits: number | null;
  multiplier: number;
  max_online: number | null;
  recommended?: boolean;
  highlights: string[];
}

/** 客服群二维码：占位阶段用内联渲染，拿到真实二维码后把 KEFU_QR_IMAGE 指向图片即可。 */
const KEFU_QR_IMAGE: string | null = null;

const FALLBACK_PLANS: Plan[] = [
  {
    id: "metered",
    name: "按量充值",
    tagline: "不订阅，用多少付多少",
    price_month: 0,
    price_year: 0,
    monthly_credits: null,
    multiplier: 1,
    max_online: 1,
    highlights: ["按实际用量扣费，无月费", "余额不过期", "可随时升级到订阅套餐"],
  },
];

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>(FALLBACK_PLANS);
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  const [billing, setBilling] = useState<"month" | "year">("month");
  const [account, setAccount] = useState<AccountProfile | null>(null);
  // 降级/切换确认弹窗的目标档位；null = 不显示。
  const [scheduleTarget, setScheduleTarget] = useState<Plan | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(apiUrl("/api/plans"))
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.plans?.length) setPlans(data.plans);
      })
      .catch(() => undefined);
    // 登录用户才有的档位状态（当前订阅/降级/切换）；未登录全部按「订阅」渲染。
    fetch(apiUrl("/api/profile"), { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.username) setAccount(data as AccountProfile);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const currentPlan = account?.plan ?? null;
  const pendingPlan = account?.pending_plan ?? null;
  const pendingDate = account?.pending_effective_at ?? null;
  const currentRank = currentPlan ? PLAN_RANK[currentPlan] ?? 0 : null;

  return (
    <main id="top" className="page">
      <section className="hero hero--pricing">
        <div className="hero__content">
          <div className="hero__tag">定价</div>
          <h1>
            按你的办案强度
            <br />
            选一档
          </h1>
          <p className="hero__lead">
            credits 是 Lawver 的用量单位：模型调用按 token、工具调用按次数扣费。
            订阅档位自带每月的 credits 额度，并按档位享受用量折扣。支付尚未开放，开通与充值请联系客服。
          </p>
        </div>
      </section>

      <section className="section section--pricing">
        <div className="section__heading">
          <p>套餐</p>
          <h2>从个人到团队，随时可换</h2>
        </div>

        <div className="pricing-toggle" role="group" aria-label="计费周期">
          <button
            type="button"
            className={billing === "month" ? "is-on" : ""}
            aria-pressed={billing === "month"}
            onClick={() => setBilling("month")}
          >
            按月
          </button>
          <button
            type="button"
            className={billing === "year" ? "is-on" : ""}
            aria-pressed={billing === "year"}
            onClick={() => setBilling("year")}
          >
            按年
            <small>省两个月</small>
          </button>
        </div>

        {/* 列数跟随后端目录：--plan-count 由 intro-pricing.css 消费，窄屏断点仍折叠为 2/1 列。 */}
        <div
          className="pricing-grid"
          style={{ "--plan-count": plans.length } as React.CSSProperties}
        >
          {plans.map((plan, index) => (
            <article
              key={plan.id}
              className={"pricing-card" + (plan.recommended ? " pricing-card--featured" : "")}
              style={{ "--delay": `${index * 60}ms` } as React.CSSProperties}
            >
              {plan.recommended && <span className="pricing-card__flag">最受欢迎</span>}
              <h3>{plan.name}</h3>
              <p className="pricing-card__tagline">{plan.tagline}</p>
              <div className="pricing-card__price" key={billing}>
                {plan.price_month === null ? (
                  <span className="pricing-card__consult">咨询客服</span>
                ) : plan.price_month === 0 ? (
                  <>
                    <strong>按量计费</strong>
                    <small>无月费</small>
                  </>
                ) : (
                  <>
                    <strong>¥{billing === "month" ? plan.price_month : plan.price_year}</strong>
                    <small>/ {billing === "month" ? "月" : "年"}</small>
                  </>
                )}
              </div>
              <ul className="pricing-card__features">
                {plan.highlights.map((item) => (
                  <li key={item}>
                    <Check size={15} strokeWidth={2.4} aria-hidden="true" />
                    {item}
                  </li>
                ))}
              </ul>
              {(() => {
                const isCurrent = currentPlan === plan.id;
                const isPendingTarget = pendingPlan === plan.id;
                // 降级/切回按量：需要确认的预约变更
                const isDowngrade =
                  currentRank !== null &&
                  (PLAN_RANK[plan.id] ?? 99) < currentRank;
                if (isCurrent || isPendingTarget) {
                  return (
                    <button type="button" className="pricing-card__cta" disabled>
                      {isPendingTarget || (pendingPlan && isCurrent)
                        ? `已预约 · ${formatDate(pendingDate)} 生效`
                        : "当前订阅"}
                    </button>
                  );
                }
                if (isDowngrade) {
                  return (
                    <button
                      type="button"
                      className="pricing-card__cta"
                      onClick={() => setScheduleTarget(plan)}
                    >
                      {plan.id === "metered" ? "切换" : "降级"}
                    </button>
                  );
                }
                return (
                  <button
                    type="button"
                    className="pricing-card__cta"
                    onClick={() => setCheckoutPlan(plan)}
                  >
                    <MessageCircle size={16} strokeWidth={2} aria-hidden="true" />
                    订阅
                  </button>
                );
              })()}
            </article>
          ))}
        </div>
      </section>

      <section className="final">
        <h2>不确定选哪一档？</h2>
        <p>先按量充值试用，用量到一定规模再换订阅更划算。客服可以按你的实际用量给出建议。</p>
        <div className="final__cta-group">
          <Link className="primary-cta" to="/download">
            下载客户端
          </Link>
          <Link className="secondary-cta" to="/">
            回到首页
          </Link>
        </div>
      </section>

      {checkoutPlan && (
        <CheckoutDialog plan={checkoutPlan} onClose={() => setCheckoutPlan(null)} />
      )}

      {scheduleTarget && account && (
        <SchedulePlanDialog
          target={scheduleTarget}
          effectiveDate={formatDate(account.pending_effective_at || nextSettlementISO())}
          onClose={() => setScheduleTarget(null)}
          onScheduled={(updated) => {
            setAccount(updated);
            setScheduleTarget(null);
          }}
        />
      )}
    </main>
  );
}

/** 与服务端 schedule_plan_change 的兜底口径一致：无周期到期日按下个自然月 1 号。 */
function nextSettlementISO(): string {
  const now = new Date();
  const next = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return next.toISOString();
}

/**
 * 预约变更确认弹窗：降级/切回按量共用——下一结算周期生效、生效前保留当前权益、
 * 可随时在用量控制台取消。确认后本地直接采用服务端返回的最新 profile。
 */
function SchedulePlanDialog({
  target,
  effectiveDate,
  onClose,
  onScheduled,
}: {
  target: Plan;
  effectiveDate: string;
  onClose: () => void;
  onScheduled: (profile: AccountProfile) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const isSwitch = target.id === "metered";

  const confirm = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(apiUrl("/api/subscription/change"), {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target_plan: target.id }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(data.detail || "操作失败，请稍后重试。");
        return;
      }
      onScheduled(data.profile);
    } catch {
      setError("网络不可用，请稍后重试。");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="pricing-checkout"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-schedule-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pricing-checkout__panel pricing-checkout__panel--narrow">
        <span className="pricing-checkout__plan">{target.name}</span>
        <h2 id="pricing-schedule-title">
          {isSwitch ? "切换为按量计费？" : `降级到「${target.name}」？`}
        </h2>
        <p className="pricing-checkout__lead">
          将于 <strong className="pricing-checkout__date">{effectiveDate}</strong>
          （下一结算周期）生效。在此之前你仍保有当前档位的全部权益；
          这项变更可随时在「用量控制台」里取消。
        </p>
        {error && (
          <p className="pricing-checkout__error" role="alert">
            {error}
          </p>
        )}
        <div className="pricing-checkout__actions">
          <button type="button" className="pricing-checkout__cancel" onClick={onClose}>
            取消
          </button>
          <button type="button" className="pricing-checkout__confirm" disabled={busy} onClick={confirm}>
            {busy ? "正在提交…" : isSwitch ? "确认切换" : "确认降级"}
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * 开通弹窗：二维码是占位图，真实群码换上后把 KEFU_QR_IMAGE 指过去即可。
 * 每张卡的「订阅」都走这里——支付回调尚未接入，销售由客服一对一完成。
 */
function CheckoutDialog({ plan, onClose }: { plan: Plan; onClose: () => void }) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        onClose();
      }
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose]);

  return (
    <div
      className="pricing-checkout"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-checkout-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="pricing-checkout__panel">
        <button
          type="button"
          className="pricing-checkout__close"
          aria-label="关闭"
          ref={closeRef}
          onClick={onClose}
        >
          <X size={18} strokeWidth={2} />
        </button>
        <span className="pricing-checkout__plan">{plan.name}</span>
        <h2 id="pricing-checkout-title">扫码联系客服开通</h2>
        <p className="pricing-checkout__lead">
          支付通道尚未开放。添加客服后说明需要的档位，由我们为你开通并充值。
        </p>
        <div className="pricing-checkout__qr">
          {KEFU_QR_IMAGE ? (
            <img src={KEFU_QR_IMAGE} alt="客服群二维码" />
          ) : (
            <div className="pricing-checkout__qr-placeholder" role="img" aria-label="客服群二维码尚未发布">
              <span>暂未发售</span>
              <small>客服群二维码<br />上线后在此展示</small>
            </div>
          )}
        </div>
        <p className="pricing-checkout__note">
          开通后 credits 与账号绑定，可在「设置 → 用量」随时查看余额与流水。
        </p>
      </div>
    </div>
  );
}
