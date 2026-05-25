export interface OpenAIAnalysisRequest {
  pair: string;
  price: number;
  signal: string;
  timeframe: string;
  rsi?: string;
  macd?: string;
  ema?: string;
  volume?: string;
  newsSentiment?: string;
  whaleData?: string;
  dxy?: string;
  spy?: string;
  trend4h?: string;
  framework: string;
}

export interface OpenAIAnalysisResponse {
  confidence: number;
  recommendation: 'execute' | 'skip';
  reasoning: string;
  keyFactors: string[];
  risk: 'low' | 'medium' | 'high';
}

export async function analyzeTradeSignalWithOpenAI(
  params: OpenAIAnalysisRequest
): Promise<OpenAIAnalysisResponse> {
  const {
    pair,
    price,
    signal,
    timeframe,
    rsi = 'N/A',
    macd = 'N/A',
    ema = 'N/A',
    volume = 'N/A',
    newsSentiment = 'N/A',
    whaleData = 'N/A',
    dxy = 'N/A',
    spy = 'N/A',
    trend4h = 'N/A',
    framework,
  } = params;

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not defined.');
  }

  const prompt = `You are a professional quantitative trading analyst. Analyse this trade setup and give a confidence score.

Asset: ${pair}
Price: ${price}
Signal: ${signal} on ${timeframe}
RSI: ${rsi}
MACD: ${macd}
EMA trend: ${ema}
Volume: ${volume}
News sentiment: ${newsSentiment}
Whale activity: ${whaleData}
Macro: DXY ${dxy}, SPY ${spy}
4h trend: ${trend4h}
Framework: ${framework}

Using ${framework} methodology respond in JSON only:
{
  "confidence": 0-100,
  "recommendation": "execute" or "skip",
  "reasoning": "2 sentence explanation",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "risk": "low/medium/high"
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || '';

    const parsed = JSON.parse(responseText);

    // Normalize values
    const confidence = typeof parsed.confidence === 'number' 
      ? Math.min(Math.max(parsed.confidence, 0), 100)
      : parseInt(parsed.confidence) || 50;

    const recommendation = parsed.recommendation === 'execute' ? 'execute' : 'skip';
    
    const reasoning = typeof parsed.reasoning === 'string'
      ? parsed.reasoning
      : 'No reasoning provided';

    const keyFactors = Array.isArray(parsed.keyFactors)
      ? parsed.keyFactors
      : [];

    let risk: 'low' | 'medium' | 'high' = 'medium';
    if (parsed.risk === 'low' || parsed.risk === 'high' || parsed.risk === 'medium') {
      risk = parsed.risk;
    } else if (parsed.riskLevel === 'low' || parsed.riskLevel === 'high' || parsed.riskLevel === 'medium') {
      risk = parsed.riskLevel;
    }

    return {
      confidence,
      recommendation,
      reasoning,
      keyFactors,
      risk,
    };
  } catch (error) {
    console.error('[v0] OpenAI API client error:', error);
    return {
      confidence: 0,
      recommendation: 'skip',
      reasoning: `Failed to analyze trade setup: ${error instanceof Error ? error.message : 'Unknown error'}`,
      keyFactors: [],
      risk: 'high',
    };
  }
}
