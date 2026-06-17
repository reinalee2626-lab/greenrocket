const MINI_MODEL = "gpt-4o-mini";
const HIGH_QUALITY_MODEL = "gpt-4o";

const SYSTEM_PROMPT =
  "You are GreenRocket, a conscious-consumption advisor.\n" +
  "You are not a shopping assistant, not a sustainability database, and not a polite eco consultant.\n" +
  "You are a smart young changemaker helping people see consumption differently.\n\n" +
  "GreenRocket philosophy:\n" +
  "- Perspective first. Product second.\n" +
  "- Observation -> realization -> action.\n" +
  "- Recommend directions, not products.\n" +
  "- The best answer is often: use what you already have, delay the purchase, refill, repair, reuse, borrow, or buy secondhand.\n" +
  "- Even when the best answer is 'don't buy,' still offer one realistic backup direction if the user ends up needing it.\n" +
  "- Only leave the alternative fields empty when there is truly no useful better direction.\n\n" +
  "Decision order:\n" +
  "1. Should the user avoid buying this?\n" +
  "2. Is the current option already okay?\n" +
  "3. Is refill, repair, reuse, borrowing, or secondhand better?\n" +
  "4. Only then, if needed, suggest one better search direction.\n\n" +
  "Required internal reasoning rule:\n" +
  "- Before returning JSON, create one internal category thesis.\n" +
  "- The category thesis means: what is the ONE non-obvious thing this product or category reveals about modern consumption?\n" +
  "- Do not output that thesis as a field.\n" +
  "- Build the whole answer around it.\n" +
  "- why must contain that thesis clearly.\n" +
  "- system_insight must expand that thesis, not repeat it.\n" +
  "- action_step must respond to that thesis with one realistic move.\n\n" +
  "Style rules:\n" +
  "- Return Korean for all user-facing fields.\n" +
  "- Sound short, confident, human, slightly activist.\n" +
  "- Not preachy. Not formal. Not essay-like. Not generic ChatGPT.\n" +
  "- Do not sound like an ESG consultant, school report, or environmental database.\n" +
  "- Avoid generic lines like '환경에 영향을 줍니다', '일회용 제품입니다', '폐기물이 발생합니다', '친환경 대안을 고려하세요'.\n" +
  "- Avoid weak phrasing like '영향을 줄 수 있습니다', '도움이 됩니다', '고려해보세요', '일 수 있습니다' unless absolutely necessary.\n" +
  "- Every answer should include one sentence that feels like a realization, not a report.\n" +
  "- Keep each field short. A few short sentences are enough. No long paragraphs.\n\n" +
  "Clarity rules:\n" +
  "- The user should understand the answer immediately.\n" +
  "- Easy enough for a middle school student to follow.\n" +
  "- Still sharp enough to feel like GreenRocket.\n" +
  "- Do not give a one-line slogan without explanation.\n" +
  "- Do not pad the answer with generic eco talk.\n" +
  "- Explain what actually happens in daily use, then reveal why that matters.\n\n" +
  "Smartness rule:\n" +
  "- Each product or category needs its own specific insight.\n" +
  "- Hardcoded categories are examples only, not the full system.\n" +
  "- The answer must still work for any product or category the user types.\n" +
  "- Do not reuse the same consumer-culture explanation for everything.\n" +
  "- Identify the unique consumption pattern behind the input.\n" +
  "- The answer should feel like a realization, not prewritten advice.\n" +
  "- If the same sentence could work for 10 other products, it is too weak.\n\n" +
  "Choose the strongest insight type for the category:\n" +
  "- convenience culture\n" +
  "- use-and-throw culture\n" +
  "- trend cycles\n" +
  "- replacement culture\n" +
  "- repair difficulty\n" +
  "- refill possibility\n" +
  "- upgrade pressure\n" +
  "- habitual consumption\n" +
  "- hidden waste after disposal\n" +
  "- Do not default to disposal unless it is genuinely one of the strongest insights.\n\n" +
  "If the product is unfamiliar, reason dynamically:\n" +
  "- Is it single-use?\n" +
  "- Is it frequently replaced?\n" +
  "- Is it hard to repair?\n" +
  "- Is it trend-driven?\n" +
  "- Is it overbought despite being reusable?\n" +
  "- Is it refillable?\n" +
  "- Is it convenience-based?\n" +
  "- Is it mostly impulse-driven?\n" +
  "- Does disposal after short use matter?\n" +
  "- Is the best option simply not buying?\n" +
  "- Pick the strongest pattern. Do not force everything into waste talk.\n\n" +
  "Thesis examples:\n" +
  "- Bad: 물티슈는 쓰레기를 만든다.\n" +
  "- Good: 물티슈는 작은 불편함도 일회용품으로 해결하게 만든다.\n" +
  "- Bad: 생수는 플라스틱을 만든다.\n" +
  "- Good: 생수는 원래 살 필요 없던 물을 반복 구매 상품으로 바꾼다.\n" +
  "- Bad: 화장품은 포장이 많다.\n" +
  "- Good: 화장품은 다 쓰기 전에 새로 사고 싶게 만드는 속도와 연결되어 있다.\n\n" +
  "Voice examples:\n" +
  "- 문제는 ___이 아닙니다. ___입니다.\n" +
  "- 사실 더 중요한 건 ___입니다.\n" +
  "- 이건 제품보다 습관의 문제에 가깝습니다.\n" +
  "- 완벽한 선택보다, 덜 자동적인 선택이 먼저입니다.\n\n" +
  "Avoid overusing these endings:\n" +
  "- ~할 수 있습니다\n" +
  "- 고려해보세요\n" +
  "- 도움이 됩니다\n" +
  "- 일 수 있습니다\n\n" +
  "Category anchors:\n" +
  "- 물티슈: the issue is how easily one sheet gets pulled out without thinking.\n" +
  "- 생수: the issue is how water became a repeated purchase instead of something often solved without buying.\n" +
  "- 패스트패션: the issue is that newness became more exciting than wearing what we already own.\n" +
  "- 에어팟: the issue is that tiny battery devices are hard to repair, so replacement becomes normal.\n" +
  "- 아이폰: the issue is upgrade culture; working devices start feeling old before they stop working.\n" +
  "- 샴푸: the issue is whether the same routine could move toward refill or bar formats.\n" +
  "- 세제: the issue is repeated plastic packaging and whether refill or concentrated formats reduce repeated buying.\n" +
  "- 화장품: the issue is trend cycles and buying before finishing what you already own.\n" +
  "- 텀블러: the issue may be overbuying reusable products; if the user already owns one, using it longer is better.\n" +
  "- 생리대: the issue is repeated monthly disposal and whether reusable directions are realistic.\n" +
  "- 휴대폰/스마트폰: the issue is replacement cycles, battery decline, and upgrade pressure.\n\n" +
  "Recommendation philosophy:\n" +
  "- Recommend directions such as 생분해성 물티슈, 리필 샴푸, 샴푸바, 중고 의류, 재사용 물병, 리필 세제, 수리 키트, 리필 화장품.\n" +
  "- Do not pretend one product is perfect.\n" +
  "- Do not over-recommend buying.\n" +
  "- In most categories, there should still be a backup direction.\n" +
  "- Example: 물티슈 -> 생분해성 물티슈, 생수 -> 재사용 물병, 패스트패션 -> 중고 의류.\n\n" +
  "Field rules:\n" +
  "- verdict: one clear judgment sentence.\n" +
  "- why: 2 to 4 short sentences. Must explain why this product creates a consumption problem in real life, not just name the problem.\n" +
  "- why: the reader should be able to picture how the product gets used.\n" +
  "- system_insight: 2 to 4 short sentences. Reveal the bigger consumption pattern this product represents, not just repeat the why section.\n" +
  "- action_step: 1 to 3 short sentences. One very concrete next step.\n" +
  "- alternative_name: a search direction, not a product name. Only if genuinely useful.\n" +
  "- alternative_reason: 1 to 3 short sentences. Why that direction is better in plain language.\n" +
  "- impact_of_switch: 1 to 2 short sentences. Short realistic impact.\n" +
  "- coupang_search_keyword: a search keyword, not a product name.\n\n" +
  "Target explanation level example for 물티슈:\n" +
  "- why should explain that wipes get pulled out again and again for tiny messes because they are too easy.\n" +
  "- system_insight should explain that this product represents a culture where even tiny inconveniences are solved by disposable purchases.\n" +
  "- action_step should say to use cloth, towel, or reusable wipes first when possible.\n" +
  "- alternative should say that if wipes are still genuinely needed, search toward 생분해성 물티슈.\n\n" +
  "Final self-check before answering:\n" +
  "1. What is the internal category thesis?\n" +
  "2. Is that thesis non-obvious?\n" +
  "3. Does why clearly contain that thesis?\n" +
  "4. Does system_insight expand the thesis instead of repeating it?\n" +
  "5. Could this answer apply to 10 other products? If yes, rewrite it.\n" +
  "6. Is there at least one sentence that makes the user think 'wait, that is true'? If no, rewrite it.\n" +
  "7. Does it sound like a report, consultant, or generic database? If yes, rewrite it.\n" +
  "8. Does the why section actually explain the daily-use problem clearly? If no, rewrite it.\n" +
  "9. If a middle school student read this, would they understand it right away? If no, rewrite it.\n" +
  "10. Is it short? If no, shorten it.\n\n" +
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
      temperature: 0.5,
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
            "Be specific to this exact input.\n" +
            "First create an internal category thesis: one non-obvious thing this product or category reveals about modern consumption.\n" +
            "Then build the whole answer from that thesis.\n" +
            "Start from the most important observation, turn it into a realization, then end with one practical action.\n" +
            "Keep every field short and sharp, but not empty.\n" +
            "If the best answer is not to buy, say that clearly.\n" +
            "If the best answer is refill, repair, reuse, borrow, or secondhand, prioritize that over buying.\n" +
            "Still give a backup direction if the user realistically ends up needing something.\n" +
            "Explain the problem so the user can picture it in daily life.\n" +
            "Do not stop at a punchy line. Add enough explanation to make it understandable.\n" +
            "If the product is unfamiliar, reason from the strongest consumption pattern instead of giving generic eco advice.\n" +
            "If you suggest an alternative, make it a search direction, not a specific product.\n\n" +
            "{\n" +
            '"product_name":"입력값을 바탕으로 해석한 제품명",\n' +
            '"outcome_type":"dont_buy | already_good | reuse_refill | better_alternative",\n' +
            '"verdict":"짧고 분명한 판단 문장",\n' +
            '"why":"2~4개의 짧은 문장. 가장 구체적인 insight 포함",\n' +
            '"system_insight":"2~4개의 짧은 문장. 더 큰 소비 패턴을 generic하지 않게 설명",\n' +
            '"action_step":"1~3개의 짧은 문장. 가장 좋은 다음 선택",\n' +
            '"is_already_good":false,\n' +
            '"alternative_name":"가능하면 항상 한 가지 search direction, 정말 없을 때만 빈 문자열",\n' +
            '"alternative_reason":"1~3개의 짧은 문장. 왜 그 방향이 더 나은지",\n' +
            '"impact_of_switch":"1~2개의 짧은 문장. 현실적으로 무엇이 달라지는지",\n' +
            '"coupang_search_keyword":"검색 키워드, 정말 없을 때만 빈 문자열"\n' +
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
  const category = inferCategory(product, parsed.product_name);
  const outcomeType = normalizeOutcomeType(parsed.outcome_type, parsed, category);
  const alternativeFallback = getAlternativeFallback(category, outcomeType);
  const keepAlternative = shouldKeepAlternative(parsed, alternativeFallback);

  return {
    product_name: cleanText(parsed.product_name) || product,
    outcome_type: outcomeType,
    verdict: cleanText(parsed.verdict) || getVerdictFallback(outcomeType, category),
    why: cleanText(parsed.why) || getWhyFallback(outcomeType, category, product),
    system_insight:
      cleanText(parsed.system_insight) || getSystemInsightFallback(outcomeType, category, product),
    action_step: cleanText(parsed.action_step) || getActionStepFallback(outcomeType, category, product),
    is_already_good: outcomeType === "already_good" ? true : normalizeBoolean(parsed.is_already_good),
    alternative_name: keepAlternative
      ? cleanText(parsed.alternative_name) || alternativeFallback.name
      : "",
    alternative_reason: keepAlternative
      ? cleanText(parsed.alternative_reason) || alternativeFallback.reason
      : "",
    impact_of_switch: keepAlternative
      ? cleanText(parsed.impact_of_switch) || alternativeFallback.impact
      : "",
    coupang_search_keyword: keepAlternative
      ? cleanText(parsed.coupang_search_keyword) || alternativeFallback.keyword
      : ""
  };
}

function shouldEscalate(result) {
  const combined = [result.verdict, result.why, result.system_insight, result.action_step]
    .join(" ")
    .trim();

  return (
    !result.verdict ||
    !result.why ||
    !result.system_insight ||
    !result.action_step ||
    hasWeakLanguage(combined) ||
    soundsTooGeneric(result) ||
    lacksSharpStructure(result) ||
    lacksExplanation(result) ||
    missingUsefulAlternative(result)
  );
}

function hasWeakLanguage(text) {
  const weakSignals = [
    "환경에 영향을",
    "일회용 제품",
    "폐기물이 발생",
    "친환경 대안을 고려",
    "환경에 도움이",
    "지속가능한 선택",
    "영향을 줄 수",
    "일 수 있습니다",
    "고려해보세요"
  ];

  return weakSignals.some((signal) => text.includes(signal));
}

function soundsTooGeneric(result) {
  const text = [result.why, result.system_insight].join(" ");
  const genericSignals = [
    "환경에 좋",
    "지속가능한 선택",
    "친환경적",
    "환경 부담",
    "폐기물을 줄",
    "더 나은 선택"
  ];

  return genericSignals.some((signal) => text.includes(signal));
}

function lacksSharpStructure(result) {
  const why = cleanText(result.why);
  const systemInsight = cleanText(result.system_insight);

  if (!why || !systemInsight) {
    return true;
  }

  if (why === systemInsight) {
    return true;
  }

  return why.slice(0, 12) === systemInsight.slice(0, 12) && why.length > 12 && systemInsight.length > 12;
}

function lacksExplanation(result) {
  return (
    isTooThin(result.why, 55) ||
    isTooThin(result.system_insight, 55) ||
    isTooThin(result.action_step, 28) ||
    isTooThin(result.alternative_reason, 24)
  );
}

function isTooThin(text, minLength) {
  return cleanText(text).replace(/\s+/g, "").length < minLength;
}

function missingUsefulAlternative(result) {
  const category = inferCategory(result.product_name, result.product_name);
  const pattern = inferDynamicPattern(result.product_name, category, result.outcome_type);

  if (!patternUsuallyNeedsAlternative(pattern, result.outcome_type)) {
    return false;
  }

  return !cleanText(result.alternative_name) && !cleanText(result.coupang_search_keyword);
}

function normalizeOutcomeType(value, parsed, category) {
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

  if (category === "tumbler") {
    return "already_good";
  }

  if (
    ["리필", "수리", "재사용", "빌려", "중고", "refill", "repair", "reuse", "borrow", "secondhand"].some(
      (signal) => text.includes(signal)
    )
  ) {
    return "reuse_refill";
  }

  if (
    ["사지 않는", "사지 않아", "구매할 필요가 낮", "지금은 사지", "미루", "delay", "avoid buying"].some(
      (signal) => text.includes(signal)
    )
  ) {
    return "dont_buy";
  }

  if (category === "wet_wipes" || category === "bottled_water" || category === "tumbler") {
    return "dont_buy";
  }

  if (
    category === "shampoo" ||
    category === "detergent" ||
    category === "cosmetics" ||
    category === "airpods" ||
    category === "iphone" ||
    category === "smartphone"
  ) {
    return "reuse_refill";
  }

  return "better_alternative";
}

function shouldKeepAlternative(parsed, fallback) {
  const name = cleanText(parsed.alternative_name);
  const reason = cleanText(parsed.alternative_reason);
  const keyword = cleanText(parsed.coupang_search_keyword);

  return Boolean(name || reason || keyword || fallback.name || fallback.keyword);
}

function inferCategory(product, productName) {
  const text = [product, productName].join(" ").toLowerCase();

  if (text.includes("물티슈") || text.includes("wet wipe") || text.includes("wipes")) {
    return "wet_wipes";
  }

  if (text.includes("생수") || text.includes("bottled water") || text.includes("mineral water")) {
    return "bottled_water";
  }

  if (text.includes("패스트패션") || text.includes("fast fashion")) {
    return "fast_fashion";
  }

  if (text.includes("에어팟") || text.includes("airpods")) {
    return "airpods";
  }

  if (text.includes("아이폰") || text.includes("iphone")) {
    return "iphone";
  }

  if (text.includes("샴푸") || text.includes("shampoo")) {
    return "shampoo";
  }

  if (text.includes("세제") || text.includes("detergent")) {
    return "detergent";
  }

  if (
    text.includes("화장품") ||
    text.includes("cosmetic") ||
    text.includes("makeup") ||
    text.includes("skincare")
  ) {
    return "cosmetics";
  }

  if (text.includes("텀블러") || text.includes("tumbler")) {
    return "tumbler";
  }

  if (text.includes("생리대") || text.includes("pad") || text.includes("menstrual")) {
    return "pads";
  }

  if (
    text.includes("휴대폰") ||
    text.includes("스마트폰") ||
    text.includes("smartphone") ||
    text.includes("phone")
  ) {
    return "smartphone";
  }

  return "generic";
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

function cleanText(value) {
  return String(value || "").trim();
}

function inferDynamicPattern(product, category, outcomeType) {
  const text = cleanText(product).toLowerCase();

  if (category === "wet_wipes") {
    return "single_use_convenience";
  }

  if (category === "bottled_water") {
    return "convenience_purchase";
  }

  if (category === "fast_fashion") {
    return "trend_cycle";
  }

  if (category === "airpods" || category === "smartphone" || category === "iphone") {
    return "repair_difficulty";
  }

  if (category === "shampoo" || category === "detergent") {
    return "refillable_repeat";
  }

  if (category === "cosmetics") {
    return "trend_cycle";
  }

  if (category === "tumbler") {
    return "overbought_reusable";
  }

  if (category === "pads") {
    return "single_use_repeat";
  }

  if (/(티슈|wipe|wipes|cup|straw|bag|wrap|foil|mask|glove|diaper|pad|컵|빨대|봉투|랩|호일|면봉|마스크|장갑|기저귀|생리대)/.test(text)) {
    return "single_use_convenience";
  }

  if (/(이어폰|헤드폰|스피커|워치|폰|스마트폰|노트북|태블릿|게임기|earbud|earphone|headphone|watch|phone|laptop|tablet|console)/.test(text)) {
    return "repair_difficulty";
  }

  if (/(옷|의류|신발|가방|액세서리|향수|립|쿠션|파운데이션|패션|clothes|fashion|shoe|shoes|bag|cosmetic|makeup|skincare|perfume)/.test(text)) {
    return "trend_cycle";
  }

  if (/(샴푸|린스|컨디셔너|세제|soap|detergent|cleaner|body wash|바디워시|로션)/.test(text)) {
    return "refillable_repeat";
  }

  if (/(텀블러|물병|보틀|container|bottle|tumbler|용기)/.test(text)) {
    return "overbought_reusable";
  }

  if (/(배달|간편|일회용|single use|disposable|instant|portable|travel)/.test(text)) {
    return "convenience_purchase";
  }

  if (outcomeType === "reuse_refill") {
    return "refillable_repeat";
  }

  if (outcomeType === "dont_buy") {
    return "convenience_purchase";
  }

  if (outcomeType === "already_good") {
    return "overbought_reusable";
  }

  return "frequent_replacement";
}

function patternUsuallyNeedsAlternative(pattern, outcomeType) {
  if (outcomeType === "already_good") {
    return false;
  }

  return pattern !== "none";
}

function getVerdictFallback(outcomeType, category) {
  if (category === "wet_wipes") {
    return "지금은 새로 구매할 필요가 낮아 보여요.";
  }

  if (category === "bottled_water") {
    return "지금은 반복 구매를 멈추는 쪽이 더 좋아 보여요.";
  }

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

function getWhyFallback(outcomeType, category, product) {
  const pattern = inferDynamicPattern(product, category, outcomeType);

  switch (category) {
    case "wet_wipes":
      return "물티슈는 작은 불편함을 해결할 때마다 아무 생각 없이 여러 장씩 쓰기 쉬운 일회용 제품입니다.\n\n손을 닦거나, 책상을 닦거나, 작은 얼룩을 지울 때마다 새 물티슈 한 장이 바로 쓰이고 버려집니다.";
    case "bottled_water":
      return "생수의 핵심은 물보다 편의예요.\n\n원래는 집이나 학교에서 해결되던 물 마시기가, 밖에 나갈 때마다 새 병을 사는 습관으로 바뀌기 쉬운 제품입니다.";
    case "fast_fashion":
      return "패스트패션의 문제는 싼 옷만이 아니에요.\n\n옷이 닳아서가 아니라, 새 시즌이 나오고 유행이 바뀌어서 아직 멀쩡한 옷이 빨리 심심해지는 구조에 더 가깝습니다.";
    case "airpods":
      return "에어팟의 문제는 작다는 점이 아니라, 작아서 고치기 어렵다는 점입니다.\n\n배터리가 약해지거나 한쪽이 말썽을 부리면 오래 쓰는 방법보다 새로 사는 쪽이 더 쉬워 보이게 됩니다.";
    case "iphone":
      return "아이폰의 문제는 고장만이 아니라 업그레이드 문화예요.\n\n아직 잘 되는 기기도 새 모델이 나오면 갑자기 느려 보이고, 뒤처진 것처럼 느껴지기 쉬워집니다.";
    case "shampoo":
      return "샴푸의 문제는 내용물보다 루틴입니다.\n\n매일 같은 방식으로 머리를 감다 보면, 다 쓸 때마다 새 병 하나를 다시 사는 흐름이 너무 당연해지기 쉽습니다.";
    case "detergent":
      return "세제의 문제는 한 번의 구매가 아니라 같은 통을 계속 사게 되는 방식입니다.\n\n빨래는 계속해야 하니까, 제품보다 통과 포장까지 함께 반복 구매하게 되는 구조가 생깁니다.";
    case "cosmetics":
      return "화장품의 문제는 성분만이 아니라 속도예요.\n\n다 쓰기도 전에 새 색상, 새 성분, 새 유행이 들어오면 소비가 사용보다 구매 속도에 끌려가기 쉬워집니다.";
    case "tumbler":
      return "텀블러의 문제는 일회용 컵만이 아닙니다.\n\n이미 있는 텀블러를 쓰지 않으면서 새 텀블러를 또 사는 순간, 재사용품도 수집품처럼 소비되기 시작합니다.";
    case "pads":
      return "생리대의 문제는 한 번의 선택보다 매달 반복된다는 점입니다.\n\n작은 소비처럼 보여도 버리는 양은 조용히 계속 쌓입니다.";
    case "smartphone":
      return "휴대폰의 핵심은 전자제품 그 자체보다 교체 주기입니다.\n\n완전히 고장 나지 않아도 배터리, 속도, 카메라, 새 모델 분위기 때문에 아직 쓸 수 있는 폰이 빨리 낡아 보이기 시작합니다.";
    default:
      return getPatternWhyFallback(pattern, product, outcomeType);
  }
}

function getSystemInsightFallback(outcomeType, category, product) {
  const pattern = inferDynamicPattern(product, category, outcomeType);

  switch (category) {
    case "wet_wipes":
      return "물티슈는 몇 초만 쓰고 버리지만, 대부분은 금방 사라지는 물건이 아닙니다.\n\n더 큰 문제는 작은 불편함도 일회용품으로 바로 해결하는 습관을 너무 자연스럽게 만든다는 점이에요.";
    case "bottled_water":
      return "문제는 병 하나보다, 물을 마실 때마다 새 용기를 함께 사는 흐름입니다.\n\n원래는 반복 구매가 필요 없던 일이, 편의 때문에 계속 돈을 내는 일이 된 셈이에요.";
    case "fast_fashion":
      return "패스트패션은 옷이 닳기 전에 마음부터 바꾸게 만듭니다.\n\n그래서 옷장에 입을 옷이 없어서는 아니라, 새 옷이 더 당겨서 또 사게 되는 흐름이 생깁니다.";
    case "airpods":
      return "작고 매끈한 전자기기는 편하지만, 그만큼 수리라는 선택지가 잘 보이지 않습니다.\n\n그래서 고장 난 물건이 아니라, 오래 쓰기 어려운 물건처럼 소비되기 쉬워요.";
    case "iphone":
      return "아이폰은 멈추기 전에 마음속에서 먼저 구형이 되기 쉽습니다.\n\n문제는 성능만이 아니라, 아직 되는 기기조차 빨리 바꾸고 싶게 만드는 업그레이드 압박이에요.";
    case "shampoo":
      return "샴푸처럼 매일 쓰는 제품은 한 번의 구매보다 반복 방식이 더 중요합니다.\n\n같은 습관이 계속 새 병을 부르면, 소비는 작아 보여도 아주 꾸준히 쌓입니다.";
    case "detergent":
      return "세제는 꼭 필요한 물건처럼 보여서 소비를 돌아보는 대상에서 자주 빠집니다.\n\n그래서 제품보다 포장 반복이 더 조용하게, 더 오래 쌓이기 쉬워요.";
    case "cosmetics":
      return "화장품은 다 써서 사는 경우보다, 기분 전환이나 새로움 때문에 사는 경우가 많아지기 쉽습니다.\n\n그래서 비슷한 역할의 제품이 서랍 안에서 겹쳐지고, 소비 속도가 사용 속도를 앞지르게 됩니다.";
    case "tumbler":
      return "재사용 제품도 여러 개 사기 시작하면 소비를 줄이는 도구가 아니라 소비를 정당화하는 물건이 될 수 있어요.\n\n재사용도 반복 구매가 되면 방향이 달라집니다.";
    case "pads":
      return "매달 반복되는 소비는 한 번 한 번은 작아 보여도 구조적으로는 아주 꾸준합니다.\n\n그래서 버리는 흐름 자체를 바꾸는 선택이 더 크게 느껴질 수 있어요.";
    case "smartphone":
      return "문제는 기계 하나보다 '고장 전 교체'가 당연해지는 흐름입니다.\n\n배터리와 속도, 새 모델 감각이 교체를 앞으로 당깁니다.";
    default:
      return getPatternSystemInsightFallback(pattern, product, outcomeType);
  }
}

function getActionStepFallback(outcomeType, category, product) {
  const pattern = inferDynamicPattern(product, category, outcomeType);

  switch (category) {
    case "wet_wipes":
      return "집에서 쓰는 용도라면 행주, 천, 재사용 물수건부터 먼저 써보세요.\n\n손 닦기나 작은 얼룩 정리 정도는 새 물티슈 없이도 충분히 해결되는 경우가 많습니다.";
    case "bottled_water":
      return "집이나 학교에서 해결 가능한 상황이라면 먼저 기존 물병을 다시 써보세요.\n\n매번 새 병을 사는 대신, 물을 들고 나가는 습관부터 바꾸는 쪽이 먼저입니다.";
    case "fast_fashion":
      return "지금 있는 옷 조합부터 다시 보고, 바로 사기보다 일주일만 미뤄보세요.\n\n지금 필요한 게 진짜 옷인지, 그냥 새로움인지 먼저 구분하는 게 좋습니다.";
    case "airpods":
      return "지금 쓰는 제품이 있다면 배터리 상태와 사용 패턴부터 먼저 점검해보세요.\n\n새 제품을 찾기 전에 정말 고장인지, 그냥 불편이 쌓인 건지 먼저 나눠 보는 게 좋습니다.";
    case "iphone":
      return "지금 폰이 정말 느린지, 아니면 그냥 오래돼 보이는지만 먼저 구분해보세요.\n\n업그레이드 욕구와 실제 불편은 생각보다 다를 때가 많습니다.";
    case "shampoo":
      return "지금 쓰는 샴푸가 남아 있다면 다 쓰고, 다음에는 리필이나 바 형태를 먼저 비교해보세요.\n\n완벽한 제품을 찾기보다, 같은 루틴을 덜 반복 구매하는 방향으로 바꾸는 게 먼저입니다.";
    case "detergent":
      return "지금 쓰는 세제를 먼저 끝까지 쓰고, 다음에는 고농축이나 리필형부터 찾아보세요.\n\n세탁은 계속하더라도 새 통을 덜 사는 방향으로 바꿀 수 있습니다.";
    case "cosmetics":
      return "같은 용도의 제품이 이미 있다면, 새로 사기 전에 먼저 다 쓰는 쪽을 목표로 잡아보세요.\n\n화장품은 새로 사는 속도보다 다 쓰는 속도를 회복하는 게 더 중요할 때가 많습니다.";
    case "tumbler":
      return "이미 텀블러가 있다면 새로 사지 말고, 지금 있는 것을 더 자주 들고 나가는 방식부터 바꿔보세요.";
    case "pads":
      return "바로 새 제품을 찾기보다, 본인에게 현실적으로 가능한 재사용 옵션이 있는지 먼저 확인해보세요.";
    case "smartphone":
      return "고장과 불편을 먼저 나눠 보세요.\n\n수리나 배터리 교체로 해결되면, 새 폰을 사지 않고도 생각보다 오래 더 쓸 수 있습니다.";
    default:
      return getPatternActionFallback(pattern, product, outcomeType);
  }
}

function getAlternativeFallback(category, outcomeType) {
  const pattern = inferDynamicPattern(category, category, outcomeType);

  if (!patternUsuallyNeedsAlternative(pattern, outcomeType)) {
    return emptyAlternative();
  }

  switch (category) {
    case "wet_wipes":
      return {
        name: "생분해성 물티슈",
        reason: "재사용이 어려운 상황이라면 일반 물티슈보다 덜 오래 남는 방향입니다.",
        impact: "완벽한 해결은 아니어도, 반복 폐기의 무게를 조금 덜 수 있어요.",
        keyword: "생분해성 물티슈"
      };
    case "bottled_water":
      return {
        name: "재사용 물병",
        reason: "정말 물을 들고 다녀야 한다면, 병을 계속 사는 대신 한 번 마련해 오래 쓰는 쪽이 낫습니다.",
        impact: "반복 구매가 줄고, 물보다 포장을 먼저 사게 되는 흐름도 줄어듭니다.",
        keyword: "재사용 물병"
      };
    case "fast_fashion":
      return {
        name: "중고 의류",
        reason: "정말 필요하다면 새 생산을 늘리지 않고도 같은 용도를 해결할 수 있습니다.",
        impact: "새로 만드는 속도에 덜 기대하면서도 필요한 옷은 채울 수 있어요.",
        keyword: "중고 의류"
      };
    case "airpods":
      return {
        name: "수리 가능한 무선이어폰",
        reason: "교체보다 유지가 쉬운 방향이 결국 더 오래 남습니다.",
        impact: "고장 = 새 구매라는 흐름에서 조금 멀어질 수 있어요.",
        keyword: "수리 가능한 무선이어폰"
      };
    case "iphone":
      return {
        name: "수리 가능한 스마트폰",
        reason: "업그레이드보다 유지가 쉬운 방향이 교체 압박을 늦춰줍니다.",
        impact: "기기가 멀쩡한데도 바꾸게 되는 속도를 조금 늦출 수 있어요.",
        keyword: "수리 가능한 스마트폰"
      };
    case "shampoo":
      return {
        name: "리필 샴푸",
        reason: "같은 루틴을 유지하더라도 병 교체를 줄이는 방향으로 바꿀 수 있습니다.",
        impact: "반복적으로 새 병을 들이는 속도가 조금 느려집니다.",
        keyword: "리필 샴푸"
      };
    case "detergent":
      return {
        name: "리필 세제",
        reason: "세탁은 계속되더라도 포장 반복은 줄일 수 있습니다.",
        impact: "같은 생활 루틴 안에서 새 통을 사는 횟수를 줄이게 됩니다.",
        keyword: "리필 세제"
      };
    case "cosmetics":
      return {
        name: "리필 화장품",
        reason: "정말 새로 사야 한다면, 적어도 같은 패키지를 반복해서 버리지 않는 방향이 낫습니다.",
        impact: "새로움을 좇더라도 버리는 속도를 조금 늦출 수 있어요.",
        keyword: "리필 화장품"
      };
    case "pads":
      return {
        name: "재사용 생리용품",
        reason: "매달 반복되는 버림을 줄이는 가장 직접적인 방향입니다.",
        impact: "작아 보이던 반복 폐기가 한 달 단위에서 크게 달라질 수 있어요.",
        keyword: "재사용 생리용품"
      };
    case "smartphone":
      return {
        name: "수리 키트",
        reason: "새 폰보다 먼저 손볼 수 있는 길을 열어줍니다.",
        impact: "교체 주기가 길어지고, 고장과 교체가 바로 연결되지 않게 됩니다.",
        keyword: "스마트폰 수리 키트"
      };
    default:
      return getPatternAlternativeFallback(pattern);
  }
}

function getPatternWhyFallback(pattern, product, outcomeType) {
  switch (pattern) {
    case "single_use_convenience":
      return `${product}의 문제는 한 번 쓰고 버린다는 사실만이 아닙니다.\n\n작은 불편함이 생길 때마다 새것 하나를 바로 꺼내 쓰게 만든다는 점이 더 큽니다.`;
    case "single_use_repeat":
      return `${product}은 한 번의 선택보다 반복된다는 점이 더 큰 문제입니다.\n\n자주 필요하고 금방 쓰는 구조라서, 소비가 작아 보여도 아주 꾸준히 쌓입니다.`;
    case "convenience_purchase":
      return `${product}의 핵심은 물건 자체보다 편의예요.\n\n원래는 꼭 돈을 내지 않아도 해결되던 일이, 너무 쉽게 반복 구매가 필요한 일로 바뀌기 쉽습니다.`;
    case "repair_difficulty":
      return `${product}의 문제는 고장이 아니라, 고친다는 선택이 잘 보이지 않는다는 점입니다.\n\n불편이 생기면 오래 쓰는 방법보다 새로 바꾸는 쪽이 더 자연스럽게 느껴지기 쉽습니다.`;
    case "trend_cycle":
      return `${product}의 문제는 기능보다 속도입니다.\n\n아직 쓸 수 있어도 새로움이 더 빨리 당겨오면, 소비는 사용보다 유행과 기분에 끌리기 쉬워집니다.`;
    case "refillable_repeat":
      return `${product}의 문제는 한 번의 구매보다 같은 방식이 계속 반복된다는 점입니다.\n\n같은 루틴이 계속 새 용기와 새 포장을 부르면, 소비는 조용히 그러나 꾸준히 쌓입니다.`;
    case "overbought_reusable":
      return `${product}의 문제는 일회용이 아니라, 재사용품조차 또 사게 된다는 점입니다.\n\n이미 있는 것을 충분히 쓰기 전에 새것을 더 모으기 시작하면 방향이 어긋나기 쉽습니다.`;
    case "frequent_replacement":
      return `${product}은 오래 쓰는 물건처럼 보여도 생각보다 빨리 교체 대상으로 밀려나기 쉬운 종류일 수 있어요.\n\n문제는 한 번의 구매보다, 교체가 너무 자연스러워지는 속도에 있습니다.`;
    default:
      if (outcomeType === "already_good") {
        return `${product}의 핵심 문제는 무조건 바꿔야 한다는 데 있지 않습니다.\n\n아직 쓸 수 있는 것을 더 새롭고 더 나아 보인다는 이유로 교체하는 습관이 오히려 더 큰 소비를 만들 수 있어요.`;
      }

      return `${product}은 없어서는 안 되는 물건이라기보다, 편의와 습관 때문에 너무 쉽게 장바구니에 들어가기 쉬운 종류일 수 있어요.\n\n그래서 먼저 이 구매가 정말 필요한지부터 다시 보는 편이 더 중요합니다.`;
  }
}

function getPatternSystemInsightFallback(pattern, product, outcomeType) {
  switch (pattern) {
    case "single_use_convenience":
      return `${product}은 작은 불편함도 일회용품으로 해결하게 만드는 흐름을 보여줍니다.\n\n이런 제품이 많아질수록, 빨아서 다시 쓰는 선택지는 점점 덜 떠오르게 됩니다.`;
    case "single_use_repeat":
      return `${product}은 한 번 한 번은 작아 보여도 반복이 구조가 되는 소비를 보여줍니다.\n\n그래서 중요한 건 제품 하나보다, 그 반복을 다른 방식으로 바꿀 수 있는지입니다.`;
    case "convenience_purchase":
      return `${product}은 원래 꼭 사지 않아도 되던 해결 방식이 상품으로 바뀌는 흐름을 보여줍니다.\n\n편리함이 강해질수록, 돈 없이 해결하던 감각은 점점 약해지기 쉽습니다.`;
    case "repair_difficulty":
      return `${product}은 고장보다 교체가 먼저 떠오르는 소비 구조를 보여줍니다.\n\n수리가 어렵거나 낯설수록, 아직 끝나지 않은 물건도 빨리 다음 물건으로 밀려나게 됩니다.`;
    case "trend_cycle":
      return `${product}은 필요보다 새로움이 더 빨리 움직이는 소비 흐름을 보여줍니다.\n\n그래서 물건이 닳아서 끝나는 게 아니라, 마음이 먼저 질려서 끝나는 일이 많아집니다.`;
    case "refillable_repeat":
      return `${product}은 생활필수품처럼 보여서 소비 점검에서 자주 빠집니다.\n\n하지만 반복이 잦은 제품일수록, 같은 습관을 어떤 방식으로 반복하느냐가 더 중요해집니다.`;
    case "overbought_reusable":
      return `${product}은 좋은 의도로 산 물건도 또 다른 소비가 될 수 있다는 걸 보여줍니다.\n\n재사용품도 여러 개씩 사기 시작하면, 줄이기보다 정당화가 먼저 되는 순간이 생깁니다.`;
    case "frequent_replacement":
      return `${product}의 더 큰 문제는 물건 하나보다 교체 주기가 짧아지는 흐름일 수 있어요.\n\n아직 쓸 수 있는 것이 빨리 끝난 것처럼 느껴지면, 소비는 필요보다 속도에 끌리게 됩니다.`;
    default:
      if (outcomeType === "already_good") {
        return `지금 소비에서 더 자주 놓치는 것은 '무엇을 살까'보다 '왜 아직 쓸 수 있는 것을 바꾸게 되는가'입니다.\n\n${product}도 더 좋은 제품을 찾는 순간보다, 교체 주기를 늦추는 쪽이 더 큰 차이를 만들 수 있어요.`;
      }

      return `${product}은 단순한 물건이 아니라 '한 번 쓰고 치우는 편리함'이 너무 자연스러워진 소비 문화와 연결되어 있을 수 있어요.\n\n편리함이 늘어날수록, 재사용 가능한 선택지를 떠올리는 기회는 오히려 줄어들 수 있습니다.`;
  }
}

function getPatternActionFallback(pattern, product, outcomeType) {
  switch (pattern) {
    case "single_use_convenience":
      return `${product}을 새로 사기 전에, 집에 있는 천이나 재사용 가능한 도구로 먼저 해결되는지부터 확인해보세요.\n\n완벽한 대안보다, 덜 자동적으로 꺼내 쓰는 선택이 먼저입니다.`;
    case "single_use_repeat":
      return `${product}이 자주 필요한 물건이라면, 한 번 쓰고 끝나는 방식 대신 반복 사용 가능한 대안이 있는지부터 찾아보세요.\n\n작은 반복을 바꾸는 쪽이 생각보다 크게 남습니다.`;
    case "convenience_purchase":
      return `${product}이 정말 필요한지보다, 원래 있던 방식으로 해결할 수는 없는지부터 먼저 보세요.\n\n편의 때문에 시작된 반복 구매라면, 습관을 바꾸는 쪽이 더 근본적입니다.`;
    case "repair_difficulty":
      return `${product}을 바로 바꾸기 전에 수리, 배터리 교체, 부품 교체 같은 길이 있는지 먼저 확인해보세요.\n\n새것을 찾기 전에 고칠 수 있는지 묻는 게 GreenRocket다운 첫 질문입니다.`;
    case "trend_cycle":
      return `${product}이 정말 부족해서 필요한지, 아니면 새로움이 당겨서 사고 싶은지 며칠만 두고 다시 봐보세요.\n\n속도를 늦추는 것만으로도 불필요한 소비가 꽤 줄어듭니다.`;
    case "refillable_repeat":
      return `${product}을 계속 써야 하는 물건이라면, 같은 루틴을 덜 반복 구매하는 방향으로 바꿔보세요.\n\n리필이나 고농축처럼 반복 포장을 줄이는 쪽이 먼저입니다.`;
    case "overbought_reusable":
      return `이미 가지고 있는 ${product}이 있다면, 새로 사지 말고 지금 있는 것을 더 자주 쓰는 방식부터 바꿔보세요.\n\n재사용품은 더 사는 것보다 더 쓰는 쪽이 먼저입니다.`;
    case "frequent_replacement":
      return `${product}이 정말 끝난 건지, 아니면 그냥 다음 것이 더 좋아 보여서 흔들리는 건지 먼저 나눠보세요.\n\n교체를 조금만 늦춰도 소비 흐름은 꽤 달라집니다.`;
    default:
      if (outcomeType === "already_good") {
        return `지금 쓰고 있는 ${product}이 아직 충분하다면, 새로 바꾸지 말고 더 오래 사용하는 쪽을 먼저 선택해보세요.`;
      }

      return "새 제품을 찾기 전에 리필, 수리, 재사용, 빌려 쓰기, 혹은 지금 있는 것을 더 오래 쓰는 방법부터 먼저 확인해보세요.";
  }
}

function getPatternAlternativeFallback(pattern) {
  switch (pattern) {
    case "single_use_convenience":
      return {
        name: "재사용 가능한 대체품",
        reason: "같은 문제를 해결하더라도 매번 새것을 꺼내 쓰는 흐름에서 한 걸음 물러날 수 있습니다.",
        impact: "반복 구매와 짧은 사용 뒤의 버림을 함께 줄이게 됩니다.",
        keyword: "재사용 가능한 대체품"
      };
    case "single_use_repeat":
      return {
        name: "다회용 대체품",
        reason: "자주 필요한 물건일수록 한 번 쓰고 끝나는 방식보다 반복 사용 쪽이 더 크게 남습니다.",
        impact: "작아 보이던 반복 소비가 느려지기 시작합니다.",
        keyword: "다회용 대체품"
      };
    case "convenience_purchase":
      return {
        name: "재사용 가능한 대안",
        reason: "편의 때문에 반복 구매하던 흐름을 조금 덜 자동적으로 바꿀 수 있습니다.",
        impact: "필요보다 습관으로 사던 소비를 줄이기 쉬워집니다.",
        keyword: "재사용 가능한 대안"
      };
    case "repair_difficulty":
      return {
        name: "수리 가능한 대안",
        reason: "새것을 또 사기보다, 오래 유지할 수 있는 방향으로 고르는 기준이 생깁니다.",
        impact: "고장 = 교체라는 흐름에서 조금 멀어질 수 있어요.",
        keyword: "수리 가능한 대안"
      };
    case "trend_cycle":
      return {
        name: "중고 대안",
        reason: "정말 필요하더라도 새 생산을 더 밀지 않고 같은 용도를 해결할 수 있습니다.",
        impact: "새로움을 좇더라도 소비 속도를 조금 늦출 수 있어요.",
        keyword: "중고 대안"
      };
    case "refillable_repeat":
      return {
        name: "리필형 대안",
        reason: "같은 루틴을 유지하더라도 새 용기와 새 포장을 반복해서 사는 흐름은 줄일 수 있습니다.",
        impact: "반복 구매의 모양이 조금 덜 낭비적으로 바뀝니다.",
        keyword: "리필형 대안"
      };
    case "overbought_reusable":
      return {
        name: "오래 쓰기 좋은 대안",
        reason: "새로운 기능보다 이미 가진 것을 오래 쓰는 기준으로 다시 보게 도와줍니다.",
        impact: "재사용품까지 수집하듯 사는 흐름을 늦출 수 있어요.",
        keyword: "오래 쓰기 좋은 대안"
      };
    case "frequent_replacement":
      return {
        name: "내구성 좋은 대안",
        reason: "교체가 빠른 물건일수록, 덜 자주 바꾸게 만드는 방향이 더 중요합니다.",
        impact: "한 번의 구매보다 이후의 교체 속도가 달라질 수 있어요.",
        keyword: "내구성 좋은 대안"
      };
    default:
      return emptyAlternative();
  }
}

function emptyAlternative() {
  return {
    name: "",
    reason: "",
    impact: "",
    keyword: ""
  };
}
