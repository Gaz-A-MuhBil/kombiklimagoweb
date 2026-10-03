#!/usr/bin/env bash
# Kullanım: npm run package  → ../kombiklimago-web-build.zip (hosting'e yüklenecek paket)
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
OUT="$(cd .. && pwd)/kombiklimago-web-build.zip"
ST="$(mktemp -d)"
cp -R .next/standalone/. "$ST/"
mkdir -p "$ST/.next" && cp -R .next/static "$ST/.next/static"
cp -R public "$ST/public"
# node_modules pakete girmez: cPanel Node.js App paketleri kendi sanal ortamına kurar ("Run NPM Install")
# ve uygulama klasöründe gerçek bir node_modules klasörü olursa uygulama çalışmaz.
rm -rf "$ST/node_modules"
# Katalog düzeltme betiği bu pakette YOK: veritabanı gazamuhendislik.com.tr ile ortaktır ve o paket zaten çalıştırır.
cat > "$ST/app.js" <<'JS'
// Başlangıç dosyası: .env dosyasını okuyup Next.js sunucusunu çalıştırır.
const path = require("path");
try {
  process.loadEnvFile(path.join(__dirname, ".env"));
} catch {
  // .env yoksa ortam değişkenleri panelden verilmiş olmalı
}
require("./server.js");
JS
# .env pakete girmez: sunucudaki .env dosyası olduğu gibi kalır
rm -f "$OUT"
# zip yoksa (Windows Git Bash) Python ile paketlenir
if command -v zip >/dev/null; then
  (cd "$ST" && zip -rq "$OUT" . -x ".DS_Store")
else
  python -c "import shutil,sys; shutil.make_archive(sys.argv[1][:-4], 'zip', sys.argv[2])" "$(cygpath -w "$OUT" 2>/dev/null || echo "$OUT")" "$(cygpath -w "$ST" 2>/dev/null || echo "$ST")"
fi
rm -rf "$ST"
echo "Hazır: $OUT ($(du -h "$OUT" | cut -f1))"
