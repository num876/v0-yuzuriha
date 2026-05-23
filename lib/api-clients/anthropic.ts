import { Anthropic } from '@anthropic-ai/sdk';

export interface ClaudeAnalysisResponse {
  confidence: number;
  recommendation: 'execute' | 'skip' | 'wait';
  reasoning: string;
  keyFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function analyzeTradeSignal(
  pair: string,
  signal: 'buy' | 'sell',
  price: number,
  timeframe: string,
  framework: string,
  technicalIndicators?: Record<string, any>,
  newsSentiment?: 'positive' | 'negative' | 'neutral',
  assetClass: 'crypto' | 'stock' | 'commodity' = 'crypto'
): Promise<ClaudeAnalysisResponse> {
  try {
    // Customize prompt based on asset class
    const assetClassPrompt = {
      crypto: 'Focus on blockchain metrics, on-chain volume, and market sentiment.',
      stock: 'Focus on earnings reports, company fundamentals, and sector trends.',
      commodity: 'Focus on macro indicators (DXY, Fed rates, inflation data, geopolitical factors) and supply/demand dynamics.',
    }[assetClass];

    const prompt = `You are a professional trading analyst using the ${framework} framework.

Analyze this trading signal for ${assetClass}:
- Pair: ${pair}
- Signal: ${signal.toUpperCase()}
- Current price: $${price}
- Timeframe: ${timeframe}
- News sentiment: ${newsSentiment || 'neutral'}
${technicalIndicators ? `- Technical indicators: ${JSON.stringify(technicalIndicators)}` : ''}

${assetClassPrompt}

Provide your analysis in the following JSON format:
{
  "confidence": <0-100>,
  "recommendation": "execute" | "skip" | "wait",
  "reasoning": "<2 sentence analysis>",
  "keyFactors": ["factor1", "factor2"],
  "riskLevel": "low" | "medium" | "high"
}

Focus on risk management and confluence of multiple timeframes.`;

    const message = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    const responseText =
      message.content[0].type === 'text' ? message.content[0].text : '';

    try {
      const parsed = JSON.parse(responseText);
      return {
        confidence: Math.min(Math.max(parsed.confidence || 50, 0), 100),
        recommendation: parsed.recommendation || 'wait',
        reasoning: parsed.reasoning || 'Unable to provide analysis',
        keyFactors: parsed.keyFactors || [],
        riskLevel: parsed.riskLevel || 'medium',
      };
    } catch (parseError) {
      console.error('[v0] JSON parse error:', parseError);
      return {
        confidence: 50,
        recommendation: 'wait',
        reasoning: 'Unable to parse analysis response',
        keyFactors: [],
        riskLevel: 'medium',
      };
    }
  } catch (error) {
    console.error('[v0] Claude API error:', error);
    return {
      confidence: 0,
      recommendation: 'skip',
      reasoning: 'API error - analysis unavailable',
      keyFactors: [],
      riskLevel: 'high',
    };
  }
}
