import { NextRequest } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const dynamic = "force-dynamic";

/**
 * ゴルフ場名を元に、Gemini + Google検索で最寄り駅・ホテル・飲食店を調べて返す
 * Query: courseName（必須）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const { searchParams } = new URL(request.url);
  const courseName = searchParams.get("courseName")?.trim();

  if (!courseName) {
    return Response.json(
      { error: "courseName を指定してください" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Gemini API が設定されていません（GEMINI_API_KEY）" },
      { status: 503 }
    );
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const groundingTool = { googleSearch: {} };

    const prompt = `以下で指定したゴルフ場の「最寄り駅」「近くのホテル（2〜3件）」「近くの飲食店（2〜3件）」を、Google検索で調べて簡潔にまとめてください。
見出しは「最寄り駅」「近くのホテル」「近くの飲食店」とし、各項目は箇条書きで、施設名・住所やアクセスが分かる程度の情報を含めてください。

ゴルフ場名: ${courseName}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [groundingTool],
        temperature: 0.4,
      },
    });

    const text = response.text ?? "";
    const candidate = response.candidates?.[0];
    const groundingMetadata = candidate?.groundingMetadata;
    const citations =
      groundingMetadata?.groundingChunks?.map((chunk: { web?: { uri?: string; title?: string } }) => ({
        uri: chunk.web?.uri,
        title: chunk.web?.title,
      })).filter((c: { uri?: string }) => c.uri) ?? [];

    return Response.json({
      courseId,
      courseName,
      summary: text,
      citations,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "周辺情報の取得に失敗しました";
    return Response.json(
      { error: message },
      { status: 502 }
    );
  }
}
