// Tarayıcıda: WhatsApp açılırken hazır mesajı admin paneli için kaydeder. Kayıt başarısız olsa da WhatsApp açılmaya devam eder.
export function logWhatsApp(text: string) {
  try {
    if (!text) return;
    const url = "/api/app/whatsapp-log";
    const data = JSON.stringify({ text, source: "web", page: location.pathname });
    if (!navigator.sendBeacon?.(url, new Blob([data], { type: "application/json" }))) {
      fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: data, keepalive: true }).catch(() => {});
    }
  } catch {
    // kayıt ikincil iş; müşteriyi etkilemesin
  }
}
