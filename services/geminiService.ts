
import { GoogleGenAI } from "@google/genai";
import { CopywriterConfig, CopyStyle } from "../types";

const DEFAULT_BROKER_INFO = "經紀人：林仕展 (110) 南市字第 00755 號";

const SYSTEM_INSTRUCTION = `你是一位台灣頂尖房地產文案寫手，專精於台南房市。
請根據使用者提供的「資料」撰寫高質感的 Facebook 銷售文案。

# 核心原則
1. **視覺豐富度**：適度使用 Emoji（如：✨, 💎, 🏡, 📍）裝飾標題與重點，但不可過度堆砌影響閱讀。
2. **符號多樣性**：請根據指定的 [特色圖案] 來條列物件優勢，並在不同段落靈活切換相關 Emoji。
3. **格式化輸出**：使用空格與換行營造易讀的節奏感。

# 風格圖案策略：
1. 【正常版】：使用 📋, 📍, 💰, 🏠 等標準專業符號。
2. 【溫馨版】：使用 🌿, ✨, ☕, 👨‍👩‍👧, ☀️ 等感性溫溫暖符號。
3. 【專業版】：使用 💎, 📈, 🏢, 🚀, 班等權威價值符號。
4. 【口播版】：使用 📢, 🚨, 💥, 🔥, 🏃‍♂️ 等高強度吸引符號。

# Output Format (通用結構範例)
[風格專屬 Emoji] [物件案名]｜[吸睛賣點] [風格專屬 Emoji]
🏡 [行政區] ✖️ [特色1] ✖️ [特色2]

📍 地址：[地址]
💰 開價：[價格]
📏 總建坪：[總坪數]
━━━━━━━━━━━━━━
🌟 主  建  物：[主建物坪數]
🌟 附屬建物： [附屬建物坪數]
🌟 共用部分：[公設坪數]
🌟 土地面積： [土地坪數]
🚗 車位：[車位型態/坪數]
🏠 格局：[房廳衛]
🏢 樓層：[所在樓層]/[總樓層]
📅 屋齡：[屋齡]年
━━━━━━━━━━━━━━

[風格專屬區塊標題]
[特色圖案] [特色標題1]｜[內文描述]
[特色圖案] [特色標題2]｜[內文描述]
[特色圖案] [特色標題3]｜[內文描述]
[特色圖案] [特色標題4]｜[內文描述]
[特色圖案] [特色標題5]｜[內文描述]

🎯 這麼優質的物件，錯過就不再！
📞 賞屋專線｜[電話] [姓名]
📲 LINE 諮詢更方便 👉 [LINE連結]
🔍 LINE ID：[LINE ID]

🏆 [公司資訊區]`;

export async function generatePropertyCopy(
  userInput: string, 
  config: CopywriterConfig, 
  style: CopyStyle,
  pdfBase64?: string
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const styleDescriptions = {
    normal: "【正常版】：標準、清晰、條理分明。使用簡約的符號裝飾，讓資訊一眼就能被捕捉。",
    warm: "【溫馨版】：強調「家」的溫度。描述午後陽光、家人互動、生活機能帶來的便利。多用 🌿, ✨ 等柔和符號。",
    professional: "【專業版】：強調投資獲利、地段稀缺、頂級建材。用數據說話，語氣權威。多用 💎, 📈 等高端符號。",
    broadcast: "【口播版】：專為短影音設計。開頭必須有極強的鉤子，中間節奏緊湊。多用 🚨, 🔥 等吸睛符號。"
  };

  // 如果使用者沒填經紀人資訊，預設使用內建資訊
  const finalBrokerInfo = config.brokerInfo.trim() || DEFAULT_BROKER_INFO;

  const parts: any[] = [
    { text: `
請使用${styleDescriptions[style]}風格。
[特色圖案] 指定為：${config.featureIcon}

使用者提供資料：
${userInput || "無額外描述"}

文案經紀人資訊：
姓名：${config.name}
電話：${config.phone}
LINE ID：${config.lineId}
LINE 連結：${config.lineLink}
證號：${config.licenseId}
${finalBrokerInfo}
公司：台慶不動產台南海佃國小加盟店（鑫辰不動產有限公司）

請開始生成文案：` }
  ];

  if (pdfBase64) {
    parts.push({
      inlineData: { mimeType: "application/pdf", data: pdfBase64 }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts },
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.85,
      },
    });

    return response.text || "生成失敗。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("生成過程中發生錯誤。");
  }
}
