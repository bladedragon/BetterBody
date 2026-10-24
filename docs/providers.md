# Provider configuration

## Supported adapters

The server supports OpenAI Responses and Chat Completions compatible vision protocols. Compatibility must be validated against the chosen provider and model; protocol similarity does not guarantee support for every parameter or structured response.

USDA FoodData Central is the implemented nutrient lookup adapter. Other food databases are not integrated.

## OpenAI Responses

Add credentials to `.env`, using `.env.example` as the template:

```dotenv
LIVE_CALLS_ENABLED=false
VISION_PROVIDER=OpenAI
VISION_PROTOCOL=responses
VISION_ENDPOINT=https://api.openai.com/v1/responses
OPENAI_MODEL=gpt-4.1-mini
OPENAI_API_KEY=
FDC_API_KEY=
```

The model name is a configurable default, not a guarantee of availability. Choose a vision-capable model supported by your account.

## Chat Completions compatible vision

```dotenv
LIVE_CALLS_ENABLED=false
VISION_PROVIDER=YourProvider
VISION_PROTOCOL=chat
VISION_ENDPOINT=https://provider.example/v1/chat/completions
VISION_MODEL=your-vision-model
VISION_API_KEY=
OPENAI_API_KEY=
FDC_API_KEY=
```

Replace the placeholder endpoint and model with values from your provider. The `chat` protocol uses `VISION_API_KEY`; Responses uses `OPENAI_API_KEY`. Set `LIVE_CALLS_ENABLED=true` and restart only when configuration is ready. Live calls may incur provider charges.

## Nutrient data

Obtain an API key from [USDA FoodData Central](https://fdc.nal.usda.gov/api-guide/) and set `FDC_API_KEY`. Matching depends on food descriptions, cooking state, and database coverage. Review candidates and retain their FDC identifiers; an automatic match is not a laboratory measurement.

Check provider documentation for current model availability, rate limits, prices, regional access, and image retention policies. Neither the fixture server nor automated tests validate live credentials or recognition quality.
