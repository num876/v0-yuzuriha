export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Webhook-Secret",
        }
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    const webhookSecret = request.headers.get("X-Webhook-Secret") || "";
    const expectedSecret = env.WEBHOOK_SECRET || "yuzuriha2025";
    
    if (webhookSecret !== expectedSecret) {
      return new Response(JSON.stringify({ success: false, error: "Invalid Webhook Secret" }), { 
        status: 401,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" } 
      });
    }

    try {
      const payload = await request.json();
      
      const apiKey = payload.apiKey || env.OKX_API_KEY;
      const secretKey = payload.secretKey || env.OKX_SECRET_KEY;
      const passphrase = payload.passphrase || env.OKX_PASSPHRASE;
      const isDemo = payload.isDemo !== undefined ? payload.isDemo : true;

      if (!apiKey || !secretKey || !passphrase) {
        return new Response(JSON.stringify({ success: false, error: "Missing API Credentials" }), { status: 400 });
      }

      const instrument = payload.instId || (payload.ticker ? payload.ticker.replace("USDT", "-USDT") : "BTC-USDT");
      
      const orderBody = {
        instId: instrument,
        tdMode: "cash",
        side: (payload.signal || "buy").toLowerCase(),
        ordType: "market",
        sz: payload.size || "0.001"
      };

      const bodyStr = JSON.stringify(orderBody);
      const method = "POST";
      const path = "/api/v5/trade/order";
      const timestamp = new Date().toISOString();

      const message = timestamp + method + path + bodyStr;
      
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(secretKey),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"]
      );
      
      const signatureBuffer = await crypto.subtle.sign(
        "HMAC",
        key,
        encoder.encode(message)
      );
      
      const sign = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)));

      const headers = {
        "Content-Type": "application/json",
        "OK-ACCESS-KEY": apiKey,
        "OK-ACCESS-SIGN": sign,
        "OK-ACCESS-TIMESTAMP": timestamp,
        "OK-ACCESS-PASSPHRASE": passphrase,
      };

      if (isDemo) {
        headers["x-simulated-trading"] = "1";
      }

      const okxResponse = await fetch(`https://www.okx.com${path}`, {
        method: "POST",
        headers: headers,
        body: bodyStr
      });

      const okxData = await okxResponse.json();

      if (okxData.code !== "0") {
        throw new Error(`OKX rejected: ${okxData.msg} (code: ${okxData.code})`);
      }

      return new Response(JSON.stringify({ 
        success: true, 
        orderId: okxData.data[0].ordId,
        message: "Order placed successfully" 
      }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }
  }
}
