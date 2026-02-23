import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

const DEFAULT_QUERY = "最寄り駅";
const LOG_PREFIX = "[nearby]";

interface GroundingChunk {
  web?: { uri?: string; title?: string };
}

/**
 * ゴルフ場名 + 検索ワードで Gemini API（Google Search grounding）を使い周辺情報を返す
 * Query: courseName（必須）, q（任意・デフォルト「最寄り駅」）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const courseName = searchParams.get("courseName")?.trim();
  const q = searchParams.get("q")?.trim() || DEFAULT_QUERY;

  console.log(LOG_PREFIX, "request", { courseId, courseName, q });

  if (!courseName) {
    return Response.json(
      { error: "courseName を指定してください" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Gemini APIが設定されていません（GEMINI_API_KEY）" },
      { status: 503 }
    );
  }

  const fullQuery = `${courseName} ${q}`.trim();
  const prompt = `${courseName}（ゴルフ場）の「${q}」について日本語で教えてください。具体的な情報（アクセス方法・住所・詳細など）を含めて答えてください。`;

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
  console.log(LOG_PREFIX, "fetch", { fullQuery, model: "gemini-2.5-flash" });

  try {
    const res = await fetch(geminiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }], role: "user" }],
        tools: [{ google_search: {} }],
      }),
    });

    const data = await res.json();

    console.log(LOG_PREFIX, "response", {
      status: res.status,
      ok: res.ok,
      hasCandidates: !!(data as { candidates?: unknown[] }).candidates,
    });

    if (!res.ok) {
      const errMsg =
        (data as { error?: { message?: string } }).error?.message ??
        "検索に失敗しました";
      console.error(LOG_PREFIX, "Gemini API error", { status: res.status, body: data });
      return Response.json({ error: errMsg }, { status: 502 });
    }

    const candidate = (
      data as {
        candidates?: {
          content?: { parts?: { text?: string }[] };
          groundingMetadata?: { groundingChunks?: GroundingChunk[] };
        }[];
      }
    ).candidates?.[0];

    const text = candidate?.content?.parts?.[0]?.text ?? "";
    const groundingChunks = candidate?.groundingMetadata?.groundingChunks ?? [];

    const citations = groundingChunks
      .filter((c) => c.web?.uri)
      .map((c) => ({ uri: c.web?.uri, title: c.web?.title }));

    const summary = `検索: 「${fullQuery}」\n\n${text}`.trimEnd();

    console.log(LOG_PREFIX, "success", { citationsCount: citations.length });
    return Response.json({
      courseId,
      courseName,
      query: q,
      fullQuery,
      summary,
      citations,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "周辺情報の取得に失敗しました";
    console.error(LOG_PREFIX, "exception", { message });
    return Response.json({ error: message }, { status: 502 });
  }
}
