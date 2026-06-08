const MINI_MODEL = "gpt-4o-mini";
const HIGH_QUALITY_MODEL = "gpt-4o";

const SYSTEM_PROMPT =
  "You are GreenRocket, a conscious-consumption advisor.\n" +
  "GreenRocket is not a shopping assistant. It is a decision-support tool.\n" +
  "Your job is to help the user buy less thoughtlessly, not to help them shop faster.\n\n" +
  "Core philosophy:\n" +
  "- Perspective is primary. Products are secondary.\n" +
  "- Recommend directions, not products.\n" +
  "- The best answer is often: use what you already own, refill, repair, reuse, borrow, or buy secondhand.\n" +
  "- Only if the user genuinely still needs something should you suggest one better search direction.\n\n" +
  "Decision order:\n" +
  "1. Should the user avoid buying this?\n" +
  "2. Is the current option already acceptable?\n" +
  "3. Is refill, repair, reuse, borrowing, or secondhand better?\n" +
  "4. Only if necessary, what is one better search direction?\n\n" +
  "How to analyze:\n" +
  "- Distinguish broad category input from specific product-like input.\n" +
  "- If broad (샴푸, 물티슈, 세제, 생수, 패스트패션), treat it as category-level analysis.\n" +
  "- If specific (브랜드명 + 제품명), treat it as product-level analysis, but stay cautious about unverifiable details.\n" +
  "- Reveal the consumption pattern, not just the material or packaging.\n" +
  "- Focus on convenience culture, disposability, replacement culture, refillability, repairability, habitual use, hidden waste, and repeated consumption.\n\n" +
  "Tone rules:\n" +
  "- Return Korean for all user-facing fields.\n" +
  "- Thoughtful, useful, practical, confident, slightly activist, human.\n" +
  "- Not preachy. Not corporate. Not textbook. Not generic sustainability copy.\n" +
  "- Every answer should contain at least one insight that makes the user think, 'I never thought about it that way.'\n" +
  "- Avoid obvious lines such as '물티슈는 사용 후 버려집니다', '환경에 영향을 줍니다', '플라스틱을 사용합니다'.\n" +
  "- Avoid vague claims like '친환경적입니다' or '환경에 좋습니다'.\n" +
  "- Do not use numeric scores, ratings, or fake precision.\n\n" +
  "Search-direction rule:\n" +
  "- If the user still may need something, suggest a direction like '리필 샴푸', '생분해성 물티슈', '중고 의류', '재사용 물병', '수리 가능한 스마트폰'.\n" +
  "- Do not suggest a branded product unless there is no better way to express the direction.\n" +
  "- Prefer search-friendly direction phrases over product names.\n\n" +
  "Output rules:\n" +
  "- verdict: one clear judgment sentence.\n" +
  "- why: explain why this judgment was made in plain language.\n" +
  "- system_insight: reveal the bigger pattern behind this consumption.\n" +
  "- action_step: give the best next action, usually lower-consumption first.\n" +
  "- alternative_name: one search direction only, or empty string.\n" +
  "- alternative_reason: why that direction is better, or empty string.\n" +
  "- impact_of_switch: what changes realistically if they follow that direction, or empty string.\n" +
  "- coupang_search_keyword: a search phrase, not a product name, or empty string.\n\n" +
  "Return strict JSON only with exactly these keys:\n" +
  "product_name, outcome_type, verdict, why, system_insight, action_step, is_already_good, alternative_name, alternative_reason, impact_of_switch, coupang_search_keyword.";

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

    console.log(`[GreenRocket] Using MINI model: ${MINI_MODEL}`);
    const miniResult = await analyzeWithModel(apiKey, product, MINI_MODEL);
    let finalResult = normalizeResponse(miniResult, product);

    if (shouldEscalate(finalResult)) {
      console.log(`[GreenRocket] Escalating to HIGH-QUALITY model: ${HIGH_QUALITY_MODEL}`);
      const highQualityResult = await analyzeWithModel(apiKey, product, HIGH_QUALITY_MODEL);
      finalResult = normalizeResponse(highQualityResult, product);
    }

    res.status(200).json(finalResult);
  } catch (error) {
    console.error("[GreenRocket API] Error:", error);
    res.status(500).json({ error: "분석 중 오류가 발생했습니다." });
  }
}

async function analyzeWithModel(apiKey, product, model) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model,
      temperature: 0.45,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT
        },
        {
          role: "user",
          content:
            `제품 또는 브랜드명: ${product}\n` +
            "Return JSON only.\n" +
            "Think in this order:\n" +
            "1. Is buying unnecessary?\n" +
            "2. Is the current option already okay?\n" +
            "3. Would refill, repair, reuse, borrowing, or secondhand be better?\n" +
            "4. Only if still needed, what is one better search direction?\n\n" +
            "Make the answer specific to the actual consumption pattern of this product or category.\n" +
            "Do not sound like an environmental database.\n" +
            "Do not recommend a product unless absolutely necessary.\n" +
            "Prefer direction-based alternatives such as 리필 샴푸, 생분해성 물티슈, 중고 의류, 재사용 물병.\n\n" +
            "{\n" +
            '"product_name":"입력값을 바탕으로 해석한 제품명",\n' +
            '"outcome_type":"dont_buy | already_good | reuse_refill | better_alternative",\n' +
            '"verdict":"짧고 분명한 판단 문장",\n' +
            '"why":"왜 이런 판단이 나왔는지 plain language 설명",\n' +
            '"system_insight":"이 제품이나 카테고리가 연결된 더 큰 소비 패턴",\n' +
            '"action_step":"가장 좋은 다음 선택 한 가지",\n' +
            '"is_already_good":false,\n' +
            '"alternative_name":"정말 필요할 때만 한 가지 search direction, 아니면 빈 문자열",\n' +
            '"alternative_reason":"왜 그 방향이 더 나은지, 필요 없으면 빈 문자열",\n' +
            '"impact_of_switch":"바꾸면 현실적으로 달라지는 점, 필요 없으면 빈 문자열",\n' +
            '"coupang_search_keyword":"검색 키워드, 필요 없으면 빈 문자열"\n' +
            "}"
        }
      ]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI ${model} error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error(`No content returned from ${model}.`);
  }

  return JSON.parse(content);
}

function normalizeResponse(parsed, product) {
  const outcomeType = normalizeOutcomeType(parsed.outcome_type, parsed);

  return {
    product_name: parsed.product_name || product,
    outcome_type: outcomeType,
    verdict: parsed.verdict || getVerdictFallback(outcomeType),
    why: parsed.why || getWhyFallback(outcomeType, product),
    system_insight: parsed.system_insight || getSystemInsightFallback(outcomeType, product),
    action_step: parsed.action_step || getActionStepFallback(outcomeType, product),
    is_already_good: outcomeType === "already_good" ? true : normalizeBoolean(parsed.is_already_good),
    alternative_name: shouldKeepAlternative(outcomeType, parsed) ? String(parsed.alternative_name || "").trim() : "",
    alternative_reason: shouldKeepAlternative(outcomeType, parsed)
      ? String(parsed.alternative_reason || "").trim()
      : "",
    impact_of_switch: shouldKeepAlternative(outcomeType, parsed)
      ? String(parsed.impact_of_switch || "").trim()
      : "",
    coupang_search_keyword: shouldKeepAlternative(outcomeType, parsed)
      ? String(parsed.coupang_search_keyword || parsed.alternative_name || "").trim()
      : ""
  };
}

function shouldEscalate(result) {
  return (
    !result.verdict ||
    !result.why ||
    !result.system_insight ||
    !result.action_step
  );
}

function normalizeOutcomeType(value, parsed) {
  if (
    value === "dont_buy" ||
    value === "already_good" ||
    value === "reuse_refill" ||
    value === "better_alternative"
  ) {
    return value;
  }

  const text = [
    parsed.verdict,
    parsed.why,
    parsed.system_insight,
    parsed.action_step,
    parsed.alternative_name,
    parsed.alternative_reason
  ]
    .join(" ")
    .toLowerCase();

  if (normalizeBoolean(parsed.is_already_good)) {
    return "already_good";
  }

  if (["리필", "수리", "재사용", "빌려", "중고", "refill", "repair", "reuse", "borrow", "secondhand"].some((signal) => text.includes(signal))) {
    return "reuse_refill";
  }

  if (["사지 않는", "사지 않아", "구매할 필요가 낮", "지금은 사지", "미루", "avoid buying"].some((signal) => text.includes(signal))) {
    return "dont_buy";
  }

  return "better_alternative";
}

function shouldKeepAlternative(outcomeType, parsed) {
  const name = String(parsed.alternative_name || "").trim();
  const reason = String(parsed.alternative_reason || "").trim();
  const keyword = String(parsed.coupang_search_keyword || "").trim();

  if (outcomeType === "better_alternative") {
    return Boolean(name || keyword);
  }

  return Boolean(name && (reason || keyword));
}

function normalizeBoolean(value) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "y"].includes(value.trim().toLowerCase());
  }

  return false;
}

function getVerdictFallback(outcomeType) {
  switch (outcomeType) {
    case "already_good":
      return "이미 비교적 괜찮은 선택이에요.";
    case "reuse_refill":
      return "새로 사기보다 리필·수리·재사용을 먼저 생각해볼 수 있어요.";
    case "better_alternative":
      return "정말 필요하다면 더 나은 방향을 찾을 수 있어요.";
    default:
      return "지금은 새로 구매할 필요가 낮아 보여요.";
  }
}

function getWhyFallback(outcomeType, product) {
  switch (outcomeType) {
    case "already_good":
      return `${product}의 핵심 문제는 무조건 바꿔야 한다는 데 있지 않습니다. 아직 쓸 수 있는 것을 더 새롭고 더 나아 보인다는 이유로 교체하는 습관이 오히려 더 큰 소비를 만들 수 있어요.`;
    case "reuse_refill":
      return `${product}은 새 제품을 더 찾는 방향보다, 같은 기능을 덜 버리고 더 오래 쓰는 방향으로 바꾸는 편이 더 현실적일 수 있어요. 문제는 제품 하나보다 반복적으로 새것을 꺼내 쓰게 되는 방식에 있습니다.`;
    case "better_alternative":
      return `${product}은 지금 방식 그대로 반복해서 소비할수록 폐기와 교체가 함께 쌓이기 쉬운 종류일 수 있어요. 그래서 꼭 필요하다면, 같은 용도라도 덜 버리고 덜 자주 교체하게 만드는 방향을 보는 편이 낫습니다.`;
    default:
      return `${product}은 없어서는 안 되는 물건이라기보다, 편의와 습관 때문에 너무 쉽게 장바구니에 들어가기 쉬운 종류일 수 있어요. 그래서 먼저 이 구매가 정말 필요한지부터 다시 보는 편이 더 중요합니다.`;
  }
}

function getSystemInsightFallback(outcomeType, product) {
  switch (outcomeType) {
    case "already_good":
      return `${product}의 핵심 문제는 무조건 바꿔야 한다는 데 있지 않습니다. 아직 쓸 수 있는 것을 더 새롭고 더 나아 보인다는 이유로 교체하는 습관이 오히려 더 큰 소비를 만들 수 있어요.`;
    case "reuse_refill":
      return `${product} 같은 물건은 원래부터 자주 다시 사도록 설계된 소비 흐름 안에 들어가기 쉽습니다. 리필, 수리, 재사용 같은 선택은 제품을 바꾸는 것보다 그 흐름 자체를 끊는 데 더 가깝습니다.`;
    case "better_alternative":
      return `${product}의 문제는 단순히 소재 하나가 아니라, 사서 쓰고 버리고 다시 사는 흐름이 너무 자연스러워졌다는 데 있습니다. 더 나은 방향을 찾는다는 것은 제품을 업그레이드하는 일이 아니라, 소비 패턴을 조금 덜 낭비적으로 바꾸는 일에 가깝습니다.`;
    default:
      return `${product}은 단순한 물건이 아니라 '한 번 쓰고 치우는 편리함'이 너무 자연스러워진 소비 문화와 연결되어 있을 수 있어요. 편리함이 늘어날수록, 재사용 가능한 선택지를 떠올리는 기회는 오히려 줄어들 수 있습니다.`;
  }
}

function getActionStepFallback(outcomeType, product) {
  switch (outcomeType) {
    case "already_good":
      return `지금 쓰고 있는 ${product}이 아직 충분하다면, 새로 바꾸지 말고 더 오래 사용하는 쪽을 먼저 선택해보세요.`;
    case "reuse_refill":
      return `새 제품을 찾기 전에 리필, 수리, 재사용, 빌려 쓰기, 혹은 지금 있는 것을 더 오래 쓰는 방법부터 먼저 확인해보세요.`;
    case "better_alternative":
      return `정말 필요한 구매라면, 같은 용도를 더 적게 버리고 더 오래 유지할 수 있는 방향으로 검색해보세요.`;
    default:
      return `이미 집에 비슷한 것이 있다면 먼저 그것을 쓰고, 오늘 꼭 사야 하는지 하루 정도만 더 생각해보는 것도 좋은 선택입니다.`;
  }
}
