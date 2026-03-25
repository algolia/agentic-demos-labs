## Set up a guardrail agent \- conversation context

A guardrail agent is a dedicated Agent Studio agent that classifies user messages before they reach your main agent. Each user message is sent to the guardrail along with conversation context, and based on the returned label, your application decides whether to forward the message or block it.

Because the guardrail only performs single-label classification (no tools, no multi-turn), use a small, fast model to keep latency low and costs minimal.

**Why conversation context matters**

A guardrail cannot accurately classify messages in isolation. Consider these examples:

* "16" \- Could be age (flag as MINOR) or a product size (NO\_VIOLATION)  
* "green" \- Could be answering about product color (NO\_VIOLATION) or political party affiliation (POLITICAL)  
* "okay" \- Meaning depends entirely on what the assistant just asked

Without context, your guardrail will produce false positives and miss real violations.

**Create the guardrail agent**

1. Go to the Algolia dashboard and navigate to **Generative AI \> Agent Studio \> Agents**.  
2. Click **Create agent** and select **Start from scratch**.  
3. Name it descriptively, for example `Content Guardrail - EU Ecommerce`.  
4. Click **Change provider** and select the provider you configured in **Settings \> Providers**.  
5. Pick a small, fast model. Classification doesn't require deep reasoning, so prioritize speed (ex: for OpenAI use gpt-5-nano, gpt-5-mini, for Anthropic use haiku 4.5).  
6. Set temperature to `0` for consistent classification.  
7. Don't add any tools.  
8. Paste your guardrail prompt into the **Instructions** field (see next section).  
9. Test in the playground, then click **Publish**.

**Write the guardrail prompt**

A guardrail prompt has three parts:

* **Scope:** the agent's role, the domain it protects, and that it will receive conversation context.  
* **Categories:** every classification label with a precise description of what triggers it.  
* **Rules:** strict output format, context handling, and tie-breaking logic.

Below is a starter prompt for an EU ecommerce chatbot. Customize the categories to match your use case.

```
---
You are a guardrail classifier for an ecommerce chatbot serving customers in Europe.
Your task is to classify the LATEST USER MESSAGE based on the full conversation context provided.
Reply with ONLY the category label. No explanation, no punctuation, no extra text.

You will receive:
1. The conversation history (if any)
2. The new message to classify

CATEGORIES:

POLITICAL - Government, public policy, elections, political parties, political figures, geopolitical issues, or political ideologies, whether European or international.
MINOR - Any content involving a person under 18, including products for minors, parental supervision questions, or sensitive situations involving children.
VIOLENT - Violence, threats, abuse, self-harm, suicide, weapons, physical injury, or hateful conduct toward any group or individual.
SEXUAL - Sexual content, nudity, sexually suggestive requests, escort services, or explicit material.
MEDICAL - Health conditions, diagnoses, treatments, medications, mental health inquiries, or medical emergencies.
LEGAL - Legal advice, lawsuits, liability, immigration, regulatory compliance, or interpretation of laws.
NOT_IN_REGION - Requests for services, products, shipping, or payments outside of Europe.
OUT_OF_SCOPE - Content unrelated to ecommerce (for example: homework help, coding questions, general trivia).
NO_VIOLATION - The message is appropriate, Europe-based, ecommerce-related, and doesn't match any category above.

RULES:
- Consider the ENTIRE conversation when classifying. A message that seems innocent in isolation might violate policies in context.
- If the assistant asked a question and the user responds with a short answer (like "yes", "16", "green"), classify based on what the assistant was asking about.
- If multiple categories apply, choose the most safety-critical one. Priority order (highest first): VIOLENT, SEXUAL, MINOR, MEDICAL, LEGAL, POLITICAL, NOT_IN_REGION, OUT_OF_SCOPE.
- Output exactly one label from the list above. Nothing else.

---
```

**Add few-shot examples with context**

Few-shot examples improve classification accuracy. Include examples that show context-dependent classification:

```
---
EXAMPLES:

Context: Assistant: "What color would you prefer?"
User: "green"
Label: NO_VIOLATION

Context: Assistant: "What's your age for sizing recommendations?"
User: "16"
Label: MINOR

Context: Assistant: "Which political party do you support?"
User: "green"
Label: POLITICAL

Context: No prior messages
User: "Can you help me find running shoes under 100 euros?"
Label: NO_VIOLATION

Context: No prior messages
User: "Ship this to New York please"
Label: NOT_IN_REGION

Context: Assistant: "I can help you find products. What are you looking for?"
User: "I've been having chest pains, what should I do?"
Label: MEDICAL

---
```

**Tips for writing categories**

* Keep labels short, uppercase, and with underscores. They become programmatic constants in the code.  
* Include boundary cases. For example, MINOR explicitly mentions "products for minors" so "What's a good gift for a 10-year-old?" is correctly flagged.  
* Always include a NO\_VIOLATION catch-all category.

For more on this technique, see Tips for writing efficient prompts.

**Refine the prompt with an LLM**

Before deploying, run your prompt through an LLM to identify gaps. Use this meta-prompt with your preferred model:

```
---
You are a prompt engineering expert. Review the following guardrail classification prompt.
Identify weaknesses, ambiguities, or missing edge cases. Then output an improved version of the full prompt that addresses these issues while preserving the same
categories and output format.

[PASTE YOUR GUARDRAIL PROMPT HERE]

---
```

Review the suggested changes to make sure they match your guardrail goals. Optionally test this new version against a set of sample messages to confirm the revision performs better.

**Frontend integration**

Call the guardrail agent with the full conversation context before your main agent:**JavaScript**

````javascript
const ALGOLIA_APP_ID = "YOUR_APPLICATION_ID";
const ALGOLIA_API_KEY = "YOUR_SEARCH_API_KEY";
const GUARDRAIL_AGENT_ID = "YOUR_GUARDRAIL_AGENT_ID";
const BASE_URL = `https://${ALGOLIA_APP_ID}.algolia.net/agent-studio/1`;

async function classifyMessage(userMessage, conversationHistory = []) {
  // Build context from conversation history
  const contextString = conversationHistory.length > 0 
    ? JSON.stringify(
        conversationHistory
          .map((msg) => {
            const textPart = msg.parts.find((part) => part.text);
            return textPart ? { role: msg.role, text: textPart.text } : null;
          })
          .filter(Boolean)
      )
    : "No prior messages";

  // Combine context with new message for classification
  const classificationPrompt = [
    `Given this conversation context:`,
    "```",
    contextString,
    "```",
    `Classify intent of this new message: ${userMessage}`,
  ].join("\n");

  const response = await fetch(
    `${BASE_URL}/agents/${GUARDRAIL_AGENT_ID}/completions?compatibilityMode=ai-sdk-5&stream=false`,
    {
      method: "POST",
      headers: {
        "X-Algolia-Application-Id": ALGOLIA_APP_ID,
        "X-Algolia-API-Key": ALGOLIA_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            parts: [{ type: "text", text: classificationPrompt }]
          },
        ],
      }),
    }
  );

  const data = await response.json();
  const textPart = data.parts?.find((p) => p.type === "text");
  return textPart?.text?.trim() ?? "NO_VIOLATION";
}

// Usage: maintain conversation history and classify with context
let conversationHistory = [
  { role: "assistant", parts: [{ type: "text", text: "What's your age?" }] }
];

const label = await classifyMessage("16", conversationHistory);
if (label !== "NO_VIOLATION") {
  // Show a fallback message instead of calling the main agent
  console.log("Blocked due to:", label); // Will be "MINOR" in this case
}
````

⚠️ **Security Note:** A determined user could bypass client-side guardrails by calling the main agent API directly. For strict enforcement, run the guardrail server-side or use separate API keys with different ACL permissions for the guardrail and main agents.

**Backend integrationPython**

````py
import httpx
import json

ALGOLIA_APP_ID = "YOUR_APPLICATION_ID"
ALGOLIA_API_KEY = "YOUR_SEARCH_API_KEY"
GUARDRAIL_AGENT_ID = "YOUR_GUARDRAIL_AGENT_ID"
MAIN_AGENT_ID = "YOUR_MAIN_AGENT_ID"
BASE_URL = f"https://{ALGOLIA_APP_ID}.algolia.net/agent-studio/1"

HEADERS = {
    "X-Algolia-Application-Id": ALGOLIA_APP_ID,
    "X-Algolia-API-Key": ALGOLIA_API_KEY,
    "Content-Type": "application/json",
}

BLOCKED_RESPONSES = {
    "POLITICAL": "I can only help with shopping-related questions.",
    "MINOR": "For safety reasons, I can't assist with this request.",
    "VIOLENT": "I'm not able to engage with this type of content.",
    "SEXUAL": "I'm not able to engage with this type of content.",
    "MEDICAL": "Consult a healthcare professional for medical questions.",
    "LEGAL": "Consult a legal professional for legal questions.",
    "NOT_IN_REGION": "This service is only available in Europe.",
    "OUT_OF_SCOPE": "I can only help with shopping-related questions.",
}

def _build_classification_prompt(user_message: str, conversation_history: list) -> str:
    """Build prompt with conversation context for guardrail classification."""
    if conversation_history:
        # Extract text parts from conversation
        context_messages = []
        for msg in conversation_history:
            text_parts = [p["text"] for p in msg.get("parts", []) if p.get("type") == "text"]
            if text_parts:
                context_messages.append({"role": msg["role"], "text": " ".join(text_parts)})
        context_str = json.dumps(context_messages)
    else:
        context_str = "No prior messages"

    return "\n".join([
        "Given this conversation context:",
        "```",
        context_str,
        "```",
        f"Classify intent of this new message: {user_message}"
    ])

def _call_agent(client: httpx.Client, agent_id: str, messages: list) -> dict:
    response = client.post(
        f"{BASE_URL}/agents/{agent_id}/completions",
        headers=HEADERS,
        params={"compatibilityMode": "ai-sdk-5", "stream": "false"},
        json={"messages": messages},
    )
    response.raise_for_status()
    return response.json()

def _extract_text(data: dict) -> str:
    for part in data.get("parts", []):
        if part.get("type") == "text":
            return part["text"].strip()
    return ""

def handle_user_message(user_message: str, conversation_history: list) -> str:
    """Process user message through guardrail then main agent if allowed."""
    with httpx.Client() as client:
        # Build classification prompt with context
        classification_prompt = _build_classification_prompt(
            user_message, conversation_history
        )
        
        # Classify with guardrail agent
        guardrail_response = _call_agent(
            client,
            GUARDRAIL_AGENT_ID,
            [{"role": "user", "parts": [{"type": "text", "text": classification_prompt}]}],
        )
        label = _extract_text(guardrail_response)

        if label != "NO_VIOLATION":
            return BLOCKED_RESPONSES.get(label, "I can't help with that request.")

        # Passed guardrail — add to history and forward to main agent
        conversation_history.append(
            {"role": "user", "parts": [{"type": "text", "text": user_message}]}
        )
        main_response = _call_agent(client, MAIN_AGENT_ID, conversation_history)

        # Add assistant response to history for next turn
        conversation_history.append(main_response)

        return _extract_text(main_response)
````

**Performance considerations**

* Use `stream=false` for the guardrail since you need the full label before deciding.  
* The guardrail adds 100-300ms latency with a nano/mini model.  
* Keep conversation context to text-only parts to minimize tokens.  
* Consider truncating very long conversations to the last 10-20 messages.  
* The main agent call can still use streaming (`stream=true`) for a responsive user experience.

**Testing your guardrail**

**Test with context-dependent scenarios:**

1. Have the assistant ask for age, then respond with a number.  
2. Have the assistant ask for color preference, then respond with a color name.  
3. Send ambiguous one-word responses after different assistant questions.  
4. Verify that the same user input gets different classifications based on context.
