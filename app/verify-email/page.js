'use client';

import { useEffect, useMemo, useState } from 'react';
import apiFetch, { setAccessToken } from '../services/apiFetchService'; // <-- make sure apiFetch default export + named setAccessToken
import { useAuth } from '../context/AuthContext';
import { getCookie, deleteCookie } from '../utils/cookies';
import './verify-email.css';

export default function VerifyEmail() {
  const { isAuthenticated } = useAuth();

  const qp = useMemo(
    () => new URLSearchParams(typeof window !== 'undefined' ? window.location.search : ''),
    []
  );

  const id = qp.get('id');
  const hash = qp.get('hash');
  const expires = qp.get('expires');
  const signature = qp.get('signature');

  const hasSignedParams = !!(id && hash && expires && signature);

  const [status, setStatus] = useState('loading'); // loading | info | success | error
  const [title, setTitle] = useState('جاري التحميل…');
  const [desc, setDesc] = useState('');
  const [hint, setHint] = useState('');
  const [copied, setCopied] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [redirectIn, setRedirectIn] = useState(null);

  const goHomeOrLogin = () => {
    window.location.href = isAuthenticated ? '/' : '/login';
  };

  const forceRelogin = () => {
    // ✅ remove cookies used by middleware and api
    deleteCookie('accessToken');
    deleteCookie('refreshToken'); // safe even if you don't use it

    // ✅ clear in-memory token for apiFetchService
    setAccessToken(null);

    window.location.href = '/login';
  };

  // ✅ Auto redirect after success (optional)
  useEffect(() => {
    if (status !== 'success') return;

    let t = 3;
    setRedirectIn(t);

    const interval = setInterval(() => {
      t -= 1;
      setRedirectIn(t);

      if (t <= 0) {
        clearInterval(interval);

        // If we verified via signed link, token might be old.
        // We will NOT auto logout here, because we already handled it right after verification.
        goHomeOrLogin();
      }
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // ✅ Main flow
  useEffect(() => {
    const run = async () => {
      // ------------------------------
      // A) No signed params -> just show status using /me if possible
      // ------------------------------
      if (!hasSignedParams) {
        // If logged in -> ask backend for real truth
        if (isAuthenticated) {
          try {
            const me = await apiFetch('/me'); // ✅ you added this route
            const verified = !!me?.user?.email_verified_at;

            if (verified) {
              setStatus('success');
              setTitle('البريد مُفعل ✅');
              setDesc('بريدك الإلكتروني مفعل بالفعل ويمكنك استخدام التطبيق.');
              setHint('');
              return;
            }

            // not verified
            setStatus('info');
            setTitle('تحقق من بريدك الإلكتروني');
            setDesc('بريدك غير مُفعل بعد. افتح بريدك واضغط على رابط التفعيل.');
            setHint('إذا لم تصلك الرسالة، يمكنك إعادة الإرسال من الزر بالأسفل.');
            return;
          } catch (err) {
            // If /me fails for any reason, fallback message
            setStatus('info');
            setTitle('تحقق من بريدك الإلكتروني');
            setDesc('افتح بريدك الإلكتروني واضغط على رابط التفعيل.');
            setHint('إذا لم تصلك الرسالة، سجّل دخولك ثم أعد الإرسال.');
            return;
          }
        }

        // Not authenticated (can't call /me)
        setStatus('info');
        setTitle('تحقق من بريدك الإلكتروني');
        setDesc('افتح بريدك الإلكتروني واضغط على رابط التفعيل الذي أرسلناه لك.');
        setHint('إذا كنت تريد إعادة الإرسال، سجّل دخولك أولاً.');
        return;
      }

      // ------------------------------
      // B) Signed params exist -> verify now
      // ------------------------------
      try {
        setStatus('loading');
        setTitle('جاري التحقق من البريد…');
        setDesc('يتم التأكيد الآن. قد يستغرق ذلك ثوانٍ قليلة.');
        setHint('');

        const res = await apiFetch(
          `/email/verify/${id}/${hash}?expires=${expires}&signature=${signature}`
        );

        const msg =
          typeof res === 'string'
            ? res
            : res?.message || 'تم تأكيد بريدك الإلكتروني بنجاح.';

        setStatus('success');
        setTitle('تم التحقق بنجاح ✅');
        setDesc(msg);

        // ✅ If user is logged in, their JWT in cookie may still say isVerified=false
        // Force re-login to get a fresh JWT with isVerified=true
        if (isAuthenticated) {
          setHint('للتأكد من تحديث صلاحياتك، سيتم تحويلك لتسجيل الدخول مرة أخرى.');
          forceRelogin();
        } else {
          setHint('يمكنك الآن تسجيل الدخول.');
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          'تعذر تأكيد البريد. قد يكون الرابط منتهي أو تم استخدامه مسبقًا.';

        const lower = String(msg).toLowerCase();
        let h = '';
        if (lower.includes('expired')) h = 'الرابط منتهي. اطلب رابط جديد.';
        if (lower.includes('signature') || lower.includes('signed')) h = 'الرابط غير صالح أو تم تعديله. اطلب رابط جديد.';

        setStatus('error');
        setTitle('فشل التحقق');
        setDesc(msg);
        setHint(h);
      }
    };

    run();
  }, [hasSignedParams, id, hash, expires, signature, isAuthenticated]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const resend = async () => {
    if (!isAuthenticated) {
      setHint('لا يمكنك إعادة الإرسال إلا بعد تسجيل الدخول.');
      return;
    }

    try {
      setResendLoading(true);
      const res = await apiFetch('/email/resend', { method: 'POST' });
      const msg = typeof res === 'string' ? res : res?.message || 'تم إرسال رسالة تحقق جديدة.';
      setHint(msg);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'فشل إعادة الإرسال.';
      setHint(msg);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="ve-wrap">
      <div className={`ve-card ve-${status}`}>
        <div className="ve-header">
          <div className="ve-badge">
            {status === 'loading' && <Spinner />}
            {status === 'success' && <Check />}
            {status === 'error' && <X />}
            {status === 'info' && <Info />}
          </div>

          <div className="ve-headtext">
            <h1 className="ve-title">{title}</h1>
            <p className="ve-desc">{desc}</p>

            {status === 'success' && redirectIn !== null && (
              <p className="ve-subtle">
                سيتم تحويلك خلال <b>{redirectIn}</b> ث…
              </p>
            )}
          </div>
        </div>

        {hint && (
          <div className="ve-note">
            <span className="ve-note-dot" />
            <span>{hint}</span>
          </div>
        )}

        <div className="ve-actions">
          {/* INFO */}
          {status === 'info' && (
            <>
              {isAuthenticated ? (
                <button className="ve-btn ve-outline" onClick={resend} disabled={resendLoading}>
                  {resendLoading ? 'جاري الإرسال…' : 'إعادة إرسال رسالة التحقق'}
                </button>
              ) : (
                <button className="ve-btn ve-outline" onClick={() => (window.location.href = '/login')}>
                  سجّل دخولك لإعادة الإرسال
                </button>
              )}

              <button className="ve-btn ve-primary" onClick={goHomeOrLogin}>
                {isAuthenticated ? 'الذهاب للرئيسية' : 'تسجيل الدخول'}
              </button>
            </>
          )}

          {/* SUCCESS */}
          {status === 'success' && (
            <>
              <button className="ve-btn ve-primary" onClick={goHomeOrLogin}>
                {isAuthenticated ? 'الذهاب للرئيسية' : 'تسجيل الدخول'}
              </button>
              <a className="ve-btn ve-ghost" href="/">
                العودة للرئيسية
              </a>
            </>
          )}

          {/* ERROR */}
          {status === 'error' && (
            <>
              <button className="ve-btn ve-primary" onClick={() => window.location.reload()}>
                إعادة المحاولة
              </button>

              <button className="ve-btn ve-ghost" onClick={copyLink}>
                {copied ? 'تم النسخ ✅' : 'نسخ الرابط'}
              </button>

              {isAuthenticated ? (
                <button className="ve-btn ve-outline" onClick={resend} disabled={resendLoading}>
                  {resendLoading ? 'جاري الإرسال…' : 'إعادة إرسال رسالة التحقق'}
                </button>
              ) : (
                <button className="ve-btn ve-outline" onClick={() => (window.location.href = '/login')}>
                  سجّل دخولك لإعادة الإرسال
                </button>
              )}
            </>
          )}
        </div>

        {/* Meta only if signed params exist */}
        {hasSignedParams && (
          <div className="ve-meta">
            <div className="ve-row">
              <span className="k">ID</span>
              <span className="v">{id ?? '-'}</span>
            </div>
            <div className="ve-row">
              <span className="k">HASH</span>
              <span className="v mono">{hash ? short(hash) : '-'}</span>
            </div>
            <div className="ve-row">
              <span className="k">EXPIRES</span>
              <span className="v mono">{expires ?? '-'}</span>
            </div>
            <div className="ve-row">
              <span className="k">SIGNATURE</span>
              <span className="v mono">{signature ? short(signature) : '-'}</span>
            </div>
          </div>
        )}

        <div className="ve-foot">
          <span className="ve-lock">🔒</span>
          <span>التحقق محمي بتوقيع Signed URL.</span>
        </div>
      </div>
    </div>
  );
}

/* helpers */
function short(s) {
  if (!s) return '';
  return s.length <= 18 ? s : `${s.slice(0, 10)}…${s.slice(-6)}`;
}

function Spinner() {
  return (
    <div className="ve-spin" aria-label="loading">
      <span />
      <span />
    </div>
  );
}

function Check() {
  return (
    <svg className="ve-ic" viewBox="0 0 24 24" fill="none">
      <path
        d="M20 6L9 17l-5-5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function X() {
  return (
    <svg className="ve-ic" viewBox="0 0 24 24" fill="none">
      <path
        d="M18 6L6 18M6 6l12 12"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function Info() {
  return (
    <svg className="ve-ic" viewBox="0 0 24 24" fill="none">
      <path
        d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z"
        stroke="currentColor"
        strokeWidth="2.2"
      />
      <path
        d="M12 10.5v6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <path
        d="M12 7.2h.01"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
