// /api/analyze.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "OPENAI_API_KEY is not configured." });
    return;
  }

  try {
    const requestBody =
      typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body || {};
    const product = String(requestBody.product || "").trim();

    if (!product) {
      res.status(400).json({ error: "product is required." });
      return;
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a Korean sustainability expert.\nAnalyze the exact product or brand the user provides.\nYour response MUST be specific to that product.\nDo NOT give generic eco advice.\nIf the exact product is unclear, infer the most likely category (e.g. detergent, shampoo, wet wipes, tumbler) and analyze cautiously.\nDifferent product types MUST produce clearly different reasoning and recommendations.\nReturn strict JSON only with these keys:\nproduct_name, product_category, score, reason, alternative_name, alternative_reason, impact_of_switch, coupang_search_keyword."
          },
          {
            role: "user",
            content:
              `제품 또는 브랜드명: ${product}\n` +
              "반드시 JSON만 반환해 주세요.\n" +
              '{' +
              '"product_name":"사용자가 입력한 제품 또는 해석한 구체적 제품명", ' +
              '"product_category":"제품 카테고리", ' +
              '"score":"5점 만점 중 점수", ' +
              '"reason":"짧고 실용적인 이유", ' +
              '"alternative_name":"더 나은 대안 제품명", ' +
              '"alternative_reason":"대안이 더 좋은 이유", ' +
              '"impact_of_switch":"바꾸었을 때 기대할 수 있는 현실적인 환경적 차이", ' +
              '"coupang_search_keyword":"추천 제품을 찾기 위한 검색 키워드"' +
              "}"
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      res.status(response.status).json({ error: errorText });
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      res.status(502).json({ error: "No content returned from OpenAI." });
      return;
    }

    const parsed = JSON.parse(content);

    res.status(200).json({
      product_name: parsed.product_name || product,
      product_category: parsed.product_category || "기타",
      score: parsed.score || "정보 없음",
      reason:
        parsed.reason || "공개된 정보와 일반적인 지속가능성 기준을 바탕으로 판단된 결과입니다.",
      alternative_name: parsed.alternative_name || "대안 제품 정보 없음",
      alternative_reason:
        parsed.alternative_reason || "더 나은 선택에 대한 구체적인 설명을 불러오지 못했습니다.",
      impact_of_switch:
        parsed.impact_of_switch || "포장 폐기물을 줄이거나 재사용 가능한 선택으로 이어질 수 있습니다.",
      coupang_search_keyword:
        parsed.coupang_search_keyword || parsed.alternative_name || `${product} 친환경`
    });
  } catch (error) {
    console.error("[GreenRocket API] Error:", error);
    res.status(500).json({ error: "분석 중 오류가 발생했습니다." });
  }
}
