/**
 * Supabase から page_content テーブルの内容を取得し、
 * data-content-key属性を持つ要素の中身を差し替えるスクリプト。
 */
(function () {
  const SUPABASE_URL = "https://cellbbkeykydmelpxnrd.supabase.co";
  const SUPABASE_KEY = "sb_publishable_cLEq5ppFdAfo-jPGyDgWtg_lk6yCt4T";

  async function loadContent() {
    const endpoint = `${SUPABASE_URL}/rest/v1/page_content?select=content_key,content_value`;

    let rows;
    try {
      const res = await fetch(endpoint, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      });
      if (!res.ok) throw new Error(`Supabase fetch failed: ${res.status}`);
      rows = await res.json();
    } catch (err) {
      console.error("[cms-loader] コンテンツの取得に失敗しました。ページ内のデフォルト文言を表示します。", err);
      return;
    }

    const contentMap = {};
    rows.forEach((row) => {
      contentMap[row.content_key] = row.content_value;
    });

    document.querySelectorAll("[data-content-key]").forEach((el) => {
      const key = el.getAttribute("data-content-key");
      if (Object.prototype.hasOwnProperty.call(contentMap, key)) {
        el.innerHTML = contentMap[key];
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadContent);
  } else {
    loadContent();
  }
})();
