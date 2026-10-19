import { type ChatSession, getActiveThread } from "./chatStore";
import { stations } from "./stations";

// Helper: Convert session thread into clean Markdown text
export function generateSessionMarkdown(session: ChatSession): string {
  const thread = getActiveThread(session);
  const station = session.stationId ? stations.find((s) => s.id === session.stationId) : null;
  const dateStr = new Date(session.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  let md = `# ${session.title}\n`;
  md += `**تاريخ المحادثة:** ${dateStr}\n`;
  if (station) {
    md += `**سياق المحطة:** المحطة ${station.id} — ${station.title} (${station.year})\n`;
  }
  md += `**المصدر:** كتاب «السيرة النبوية» لابن هشام — موقع «رحلة في السيرة»\n\n`;
  md += `---\n\n`;

  thread.forEach((msg, idx) => {
    const isUser = msg.role === "user";
    const speaker = isUser ? "### 👤 المستخدم:" : "### ✨ المساعد الذكي:";
    md += `${speaker}\n\n${msg.content}\n\n`;
    if (idx < thread.length - 1) {
      md += `---\n\n`;
    }
  });

  return md;
}

// Download markdown file directly
export function downloadSessionMarkdown(session: ChatSession): void {
  const md = generateSessionMarkdown(session);
  const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const filename = `${session.title.replace(/[\/\\?%*:|"<>]/g, "_")}.md`;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Export session as PDF via styled native printable window/iframe
export function printSessionPdf(session: ChatSession): void {
  const thread = getActiveThread(session);
  const station = session.stationId ? stations.find((s) => s.id === session.stationId) : null;
  const dateStr = new Date(session.createdAt).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Convert basic markdown formatting into clean HTML for print
  const formatForPrint = (text: string) => {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n\n/g, "</p><p>")
      .replace(/\n/g, "<br/>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>")
      .replace(/`([^`]+)`/g, "<code style='background:#f4f4f4;padding:2px 4px;border-radius:4px;font-family:monospace;'>$1</code>");
  };

  const messagesHtml = thread
    .map((msg) => {
      const isUser = msg.role === "user";
      const badge = isUser
        ? "<span style='color:#b8860b;font-weight:bold;'>👤 سؤال المستخدم:</span>"
        : "<span style='color:#1a6b48;font-weight:bold;'>✨ جواب المساعد الذكي:</span>";

      return `
        <div style="margin-bottom: 24px; padding: 16px 20px; border-radius: 12px; background: ${
          isUser ? "#fcf9f2" : "#fdfdfd"
        }; border: 1px solid ${isUser ? "#eedcb5" : "#e0e0e0"}; page-break-inside: avoid;">
          <div style="font-size: 13px; margin-bottom: 8px;">${badge}</div>
          <div style="font-size: 14.5px; line-height: 2; color: #1c1c1c;">
            <p style="margin: 0;">${formatForPrint(msg.content)}</p>
          </div>
        </div>
      `;
    })
    .join("");

  const printHtml = `
    <!DOCTYPE html>
    <html lang="ar" dir="rtl">
    <head>
      <meta charset="utf-8" />
      <title>${session.title} — رحلة في السيرة</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;600;700&display=swap');
        
        body {
          font-family: 'IBM Plex Sans Arabic', 'Amiri', Tahoma, sans-serif;
          margin: 0;
          padding: 30px;
          color: #1a1a1a;
          background: #fff;
          direction: rtl;
        }

        .header {
          text-align: center;
          border-bottom: 2px solid #b8860b;
          padding-bottom: 18px;
          margin-bottom: 24px;
        }

        .site-title {
          font-family: 'Amiri', serif;
          font-size: 26px;
          font-weight: bold;
          color: #b8860b;
          margin: 0 0 6px 0;
        }

        .chat-title {
          font-size: 18px;
          font-weight: 700;
          margin: 6px 0;
          color: #222;
        }

        .meta {
          font-size: 12px;
          color: #666;
          margin-top: 4px;
        }

        .footer {
          text-align: center;
          font-size: 11px;
          color: #888;
          border-top: 1px solid #ddd;
          padding-top: 16px;
          margin-top: 36px;
        }

        @media print {
          body {
            padding: 15mm;
          }
          @page {
            size: A4;
            margin: 12mm;
          }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1 class="site-title">رحلة في السيرة النبوية</h1>
        <div class="chat-title">${session.title}</div>
        <div class="meta">
          <span>التاريخ: ${dateStr}</span>
          ${station ? ` &middot; <span>المحطة: ${station.id} — ${station.title}</span>` : ""}
        </div>
      </div>

      <div class="content">
        ${messagesHtml}
      </div>

      <div class="footer">
        <p>مأخوذ من كتاب «السيرة النبوية» لابن هشام — منصة «رحلة في السيرة»</p>
      </div>

      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        };
      </script>
    </body>
    </html>
  `;

  // Open clean printable window
  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(printHtml);
    printWindow.document.close();
  }
}
