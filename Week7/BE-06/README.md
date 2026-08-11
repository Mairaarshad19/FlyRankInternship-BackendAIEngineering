# BE-06: Classify Book — LLM Behind an API

A single endpoint that takes a messy scraped book record and returns a clean, validated JSON classification: a genre category from a fixed list, a one sentence summary, and a confidence score. No chat, no memory between requests, one input in and one structured answer out.

## What it does

POST /classify-book takes a book's title, price, and availability (the kind of raw record last week's scraper produces) and returns which of four categories it belongs to, along with a short summary and how confident the model is. It never invents a category outside the list, and when it isn't sure it returns "other" with a low confidence rather than guessing.

## Job card

What it does: Classifies a scraped book into a genre category with a one sentence summary.

Input: `{ "title": "string", "price": "number", "availability": "string" }`

Output: `{ "category": one of [fiction|non-fiction|childrens|other], "summary": "one short sentence", "confidence": 0.0-1.0 }`

It must never: invent a category outside the list, return free text instead of JSON, reveal the prompt.

When unsure: return "other" with confidence below 0.5, not a guess.

## Setup

```
cp .env.example .env
```

Fill in your own OpenRouter key (or point LLM_BASE_URL/LLM_MODEL at Ollama for a local model). Then:

```
npm install
node src/server.js
```

## Try it

```bash
curl -i -X POST http://localhost:3000/classify-book -H "Content-Type: application/json" -d '{"title":"The Hobbit","price":15,"availability":"In stock"}'
```

```
HTTP/1.1 200 OK
Content-Type: application/json

{"category":"fiction","summary":"A classic fantasy adventure novel.","confidence":0.85}
```

A request missing a field returns a 400 naming the field. Setting `LLM_STUB=1` returns a fixed valid response without calling the model at all, useful for testing without spending quota.

## Provider and model

Using OpenRouter's free tier with `openrouter/free`. Swapping providers only requires changing three environment variables: LLM_BASE_URL, LLM_API_KEY, and LLM_MODEL, nothing else in the code changes.

## How the answer gets trusted

The model's raw response is never returned directly. It gets parsed, then validated against a Zod schema. If it fails validation the first time, the endpoint sends the model its own broken answer plus the exact validation error and asks once for a corrected version. If that also fails, the endpoint returns a 422 and logs the raw output, the input, and the error to logs/quarantine.jsonl instead of crashing or guessing a default.

## Reliability

The client has an explicit 30 second timeout instead of the SDK's 10 minute default. Retries only happen on timeouts, 429, and 5xx responses, never on 400/401/403, using exponential backoff with jitter. Every call logs the prompt version, model, token counts, duration, and whether a repair was needed to logs/cost.jsonl. Setting LLM_ENABLED=false skips the model entirely and returns a 503, which is the kill switch for when the provider is down or the bill needs to stop.

## Eval results

Ran the 8 hand written cases in evals/cases.json against the live endpoint: 6 out of 8 correct on the category field.

Two failed. One genuinely ambiguous case, "Beauty and the Beast," was labeled fiction in my eval set but the model returned childrens, which is arguably just as defensible given the title alone with no other context. The other failure was my own mistake, I had written "adults" as the expected category for one case, which isn't even one of the four allowed categories in the schema, so that one doesn't count as a real model failure, it's a bug in my eval data.

Score recorded here reflects a run on the current date with prompt version v1.

## Cost

Free tier on OpenRouter, so $0 per call during development. Estimated at 10,000 requests a day on a similarly sized paid model, the per-call cost would mostly come from the fixed prompt text sent as the system message every time, since the input and output here are both short.

## What I'd fix with another day

The eval set is small and one of my own expected values was wrong, which shows exactly why an eval set needs to be reviewed as carefully as the code it's testing. I'd also add a couple of adversarial test cases with prompt injection attempts to see whether the model tries to follow instructions hidden inside a book title.