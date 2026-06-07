const MINI_MODEL = "gpt-4o-mini";
const HIGH_QUALITY_MODEL = "gpt-4o";

const SYSTEM_PROMPT =
  "You are GreenRocket, a conscious-consumption advisor.\n" +
  "Your role is not to sell products. Your role is to help the user pause, judge the purchase, and see the bigger consumption pattern behind it.\n\n" +
  "Brand direction:\n" +
  "- thoughtful\n" +
  "- direct\n" +
  "- human\n" +
  "- decision-focused\n" +
  "- slightly activist\n" +
  "- not corporate\n" +
  "- not school-report-like\n" +
  "- not vague eco-helper language\n\n" +
  "Core decision order:\n" +
  "1. Should the user avoid buying this?\n" +
  "2. Is the current option already okay?\n" +
  "3. Is refill, repair, reuse, borrowing, or using what they already have better?\n" +
  "4. Only if truly useful, recommend one better alternative.\n\n" +
  "Important rules:\n" +
  "- Do not automatically recommend a product.\n" +
  "- Do not use numeric scores or ratings.\n" +
  "- Do not sound like an environmental database.\n" +
  "- Do not use generic lines like 환경에 좋습니다 or 친환경적입니다.\n" +
  "- Do not use fake precision.\n" +
  "- If no purchase is needed, do not recommend a product.\n" +
  "- If the current option is already decent, do not recommend replacement.\n" +
  "- If refill, repair, or reuse is better, prioritize that.\n" +
  "- If you recommend something, recommend only one thing.\n\n" +
  "How to think about input:\n" +
  "- If the input is broad, like 샴푸, 물티슈, 세제, bottled water, fast fashion, treat it as category analysis.\n" +
  "- For category analysis, explain the consumption pattern, not just the material.\n" +
  "- Focus on disposability, refillability, repairability, replacement culture, hidden waste, and buy-use-throw-away habits.\n" +
  "- If the input is a specific branded product, treat it as product-level analysis but stay cautious about unverifiable claims.\n\n" +
  "Tone examples:\n" +
  "- 물티슈는 단순한 제품이 아닙니다. 한 번 쓰고 버리는 것이 너무 자연스러워진 소비 문화와 연결되어 있습니다.\n" +
  "- 편리하지만, 그 편리함은 반복적인 폐기물을 전제로 합니다.\n\n" +
  "Field instructions:\n" +
  "- verdict: one clear purchase judgment in Korean. Short and strong.\n" +
  "- why: plain-language explanation of why that verdict was made.\n" +
  "- system_insight: reveal the bigger pattern behind the product or category.\n" +
  "- action_step: give one practical next step.\n" +
  "- alternative_reason: explain why the alternative is meaningfully better only if needed.\n" +
  "- impact_of_switch: explain what realistically changes if they switch.\n\n" +
  "Return strict JSON only with exactly these keys:\n" +
  "{\n" +
  '  "product_name": "...",\n' +
  '  "outcome_type": "dont_buy | already_good | reuse_refill | better_alternative",\n' +
  '  "verdict": "...",\n' +
  '  "why": "...",\n' +
  '  "system_insight": "...",\n' +
  '  "action_step": "...",\n' +
  '  "is_already_good": true,\n' +
  '  "alternative_name": "...",\n' +
  '  "alternative_reason": "...",\n' +
  '  "impact_of_switch": "...",\n' +
  '  "coupang_search_keyword": "..."\n' +
  "}";

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

    if (shouldEscalate(finalResult, product)) {
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
      temperature: 0.4,
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
            "Think like a conscious-consumption advisor, not a recommendation engine.\n" +
            "Judge whether this purchase should be avoided, accepted, delayed, or replaced with one better option only if necessary.\n" +
            "Explain the consumption pattern in Korean.\n" +
            "Return JSON only.\n" +
            "{\n" +
            '"product_name":"입력값을 바탕으로 해석한 제품명",\n' +
            '"outcome_type":"dont_buy | already_good | reuse_refill | better_alternative",\n' +
            '"verdict":"짧고 분명한 판단",\n' +
            '"why":"왜 이런 판단이 나왔는지 plain language 설명",\n' +
            '"system_insight":"더 큰 소비 구조나 패턴 설명",\n' +
            '"action_step":"지금 할 수 있는 한 가지 practical next step",\n' +
            '"is_already_good":false,\n' +
            '"alternative_name":"정말 필요할 때만 한 가지 대안, 아니면 빈 문자열",\n' +
            '"alternative_reason":"왜 그 대안이 더 나은지, 필요 없으면 빈 문자열",\n' +
            '"impact_of_switch":"바꾸면 현실적으로 무엇이 달라지는지, 필요 없으면 빈 문자열",\n' +
            '"coupang_search_keyword":"대안 검색 키워드, 필요 없으면 빈 문자열"\n' +
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
  const outcomeType = normalizeOutcomeType(parsed.outcome_type, parsed, product);
  const productName = parsed.product_name || product;
  const alternativeName =
    outcomeType === "better_alternative" || outcomeType === "reuse_refill"
      ? parsed.alternative_name || ""
      : "";
  const alternativeReason =
    outcomeType === "better_alternative" || outcomeType === "reuse_refill"
      ? parsed.alternative_reason || ""
      : "";
  const impactOfSwitch =
    outcomeType === "better_alternative" || outcomeType === "reuse_refill"
      ? parsed.impact_of_switch || ""
      : "";
  const searchKeyword =
    outcomeType === "better_alternative" || outcomeType === "reuse_refill"
      ? parsed.coupang_search_keyword || alternativeName || product
      : "";

  return {
    product_name: productName,
    outcome_type: outcomeType,
    verdict: parsed.verdict || getVerdictFallback(outcomeType),
    why: parsed.why || getWhyFallback(outcomeType, productName),
    system_insight: parsed.system_insight || getSystemInsightFallback(outcomeType, productName),
    action_step: parsed.action_step || getActionStepFallback(outcomeType),
    is_already_good: outcomeType === "already_good" ? true : normalizeBoolean(parsed.is_already_good),
    alternative_name: alternativeName,
    alternative_reason: alternativeReason,
    impact_of_switch: impactOfSwitch,
    coupang_search_keyword: searchKeyword
  };
}

function shouldEscalate(result, product) {
  return (
    inferSpecificity(product) === "specific_product" ||
    !result.verdict ||
    !result.why ||
    !result.system_insight ||
    !result.action_step
  );
}

function inferSpecificity(product) {
  const text = String(product || "").trim();

  if (!text) {
    return "category";
  }

  const hasMultipleWords = text.split(/\s+/).length >= 2;
  const hasLatin = /[a-zA-Z]/.test(text);
  const hasDigits = /\d/.test(text);

  if (hasMultipleWords || hasLatin || hasDigits) {
    return "specific_product";
  }

  return "category";
}

function normalizeOutcomeType(value, parsed, product) {
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
    parsed.alternative_reason,
    parsed.alternative_name,
    product
  ]
    .join(" ")
    .toLowerCase();

  if (normalizeBoolean(parsed.is_already_good)) {
    return "already_good";
  }

  if (["리필", "수리", "재사용", "빌려", "refill", "repair", "reuse", "borrow"].some((signal) => text.includes(signal))) {
    return "reuse_refill";
  }

  if (["사지 않는", "사지 않아", "구매를 미루", "지금 있는 것을", "avoid buying"].some((signal) => text.includes(signal))) {
    return "dont_buy";
  }

  return "better_alternative";
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
      return "새 제품보다 리필·수리·재사용을 먼저 고려해볼 수 있어요.";
    case "better_alternative":
      return "정말 필요하다면 더 나은 대안이 있을 수 있어요.";
    default:
      return "지금은 사지 않는 쪽이 더 나을 수 있어요.";
  }
}

function getWhyFallback(outcomeType, productName) {
  switch (outcomeType) {
    case "already_good":
      return `${productName} 자체가 지금 당장 바꿔야 할 종류는 아닐 수 있어요. 새 제품을 고르는 것보다, 이미 쓰고 있는 선택을 더 오래 유지하는 편이 더 의미 있을 수 있습니다.`;
    case "reuse_refill":
      return `${productName}은 새로 사는 것보다 먼저 리필, 수리, 재사용 같은 방식이 가능한지 보는 편이 더 현실적일 수 있어요. 구매를 줄이는 방향이 곧 더 나은 선택이 되기도 합니다.`;
    case "better_alternative":
      return `${productName}은 지금 방식 그대로 반복해서 소비할수록 폐기와 교체가 함께 쌓일 수 있어요. 정말 필요한 구매라면 조금 덜 버리고 조금 더 오래 가는 방향을 보는 편이 낫습니다.`;
    default:
      return `${productName}은 지금 꼭 새로 사야 하는 물건이 아닐 수도 있어요. 이미 가진 것을 더 오래 쓰거나 구매를 잠깐 미루는 쪽이 더 좋은 판단일 수 있습니다.`;
  }
}

function getSystemInsightFallback(outcomeType, productName) {
  switch (outcomeType) {
    case "already_good":
      return `문제는 늘 제품 하나가 아니라, 아직 쓸 수 있는 것을 너무 빨리 교체하게 만드는 소비 문화일 때가 많습니다. ${productName}도 새로 바꾸는 순간보다 얼마나 오래 쓰는지가 더 중요할 수 있어요.`;
    case "reuse_refill":
      return `${productName} 같은 물건은 종종 새로 사는 흐름이 너무 자연스럽게 느껴지도록 설계된 소비 습관과 연결되어 있습니다. 하지만 반복 구매 대신 리필과 재사용으로 방향을 바꾸면 그 흐름을 조금 끊을 수 있어요.`;
    case "better_alternative":
      return `${productName}은 단순한 제품 선택이 아니라, 사서 쓰고 버리고 다시 사는 흐름에 얼마나 자주 들어가게 되는지의 문제이기도 합니다. 더 나은 대안은 제품보다 소비 패턴을 조금 덜 낭비적으로 바꾸는 데 의미가 있어요.`;
    default:
      return `${productName}은 제품 자체보다도, 필요하지 않은 구매가 너무 쉽게 일어나도록 만드는 환경과 연결되어 있을 수 있어요. 충동, 편의, 빠른 소비가 만나면 불필요한 구매는 아주 자연스러워집니다.`;
  }
}

function getActionStepFallback(outcomeType) {
  switch (outcomeType) {
    case "already_good":
      return "지금 쓰는 것을 더 오래 사용하고, 괜히 더 새롭거나 더 나아 보인다는 이유만으로 교체하지 않아도 괜찮습니다.";
    case "reuse_refill":
      return "새 제품을 찾기 전에 리필, 수리, 재사용, 빌려 쓰기, 혹은 지금 있는 것을 더 오래 쓰는 방법부터 먼저 확인해보세요.";
    case "better_alternative":
      return "정말 필요한 구매라면, 반복 폐기와 교체 주기를 조금 줄일 수 있는 한 가지 대안만 신중하게 비교해보세요.";
    default:
      return "비슷한 물건이 이미 있다면, 지금 있는 것을 먼저 쓰고 이 구매가 정말 필요한지 하루 정도만 더 생각해보는 것도 좋습니다.";
  }
}
