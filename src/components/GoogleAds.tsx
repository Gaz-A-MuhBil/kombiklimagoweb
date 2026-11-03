import { ConsentScript } from "@/components/ConsentScript";

// Google Ads etiketi (reklam dönüşüm ölçümü). Ziyaretçi pazarlama çerezlerine izin verdiyse yüklenir.
const ADS_ID = "AW-18493508210";

export function GoogleAds() {
  return (
    <>
      <ConsentScript category="marketing" src={`https://www.googletagmanager.com/gtag/js?id=${ADS_ID}`} />
      <ConsentScript category="marketing" id="google-ads">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${ADS_ID}');`}
      </ConsentScript>
    </>
  );
}
