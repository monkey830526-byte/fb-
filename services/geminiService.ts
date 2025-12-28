
import { GoogleGenAI } from "@google/genai";
import { CopywriterConfig, CopyStyle } from "../types";

const SYSTEM_INSTRUCTION = `你是一位台灣頂尖房地產文案寫手，專精於台南房市。
請根據使用者提供的「資料」撰寫 Facebook 銷售文案。

# 核心原則
1. **嚴格依據數據**：不編造數字。缺失資訊標示「洽詢」。
2. **格式至上**：必須遵守下方指定的結構。

# 風格導向說明：
1. 【正常版】：最標準的不動產銷售格式。語氣客觀中立，條列清晰，資訊完整且易於閱讀。
2. 【溫馨版】：強調家庭、生活感、採光、幸福未來。語氣溫和感性。
3. 【專業版】：強調投資價值、地段紅利、數據指標、坪效。語氣理性權威。
4. 【口播版】：專為短影音設計。短句、節奏感強、開頭要有超強吸引力鉤子。

# Output Format (通用結構)
🔥 [物件案名]｜[根據風格產生的賣點]🔥
🏡 [行政區] ✖️ [特色1] ✖️ [特色2]

📍 地址：[地址]
💰 開價：[價格]
📏 總建坪：[總坪數]
🌟主  建  物：[主建物坪數]
🌟附屬建物： [附屬建物坪數]
🌟共用部分：[公設坪數]
🌟土地面積： [土地坪數]
🚗 車位：[車位型態/坪數]
🏠 格局：[房廳衛]
🏢 樓層：[所在樓層]/[總樓層]
📅 屋齡：[屋齡]年

🌟 頂級特色搶先看 🌟
🤟 [特色標題1]｜[內文]
🤟 [特色標題2]｜[內文]
🤟 [特色標題3]｜[內文]
🤟 [特色標題4]｜[內文]
🤟 [特色標題5]｜[內文]

🎯 這麼優質的物件，錯過就不再！
📞 賞屋專線｜[電話] [姓名]
📲 LINE 諮詢更方便 👉 [LINE連結] 點我立即加LINE
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
    normal: "【正常版】：請使用最標準、專業且易讀的格式。不使用過多誇飾詞彙，專注於清楚呈現物件的所有規格與優勢。",
    warm: "【溫馨版】：請多著墨於家的溫暖、全家人的生活動線、採光帶來的氛圍感，像在跟一對想成家的年輕夫妻說話。",
    professional: "【專業版】：請強調物件的稀缺性、區域未來增值空間、優質建材與投報分析，像在跟資深投資者或企業主說話。",
    broadcast: "【口播版】：句子要短、要有節奏！開頭第一句必須是能讓人停下來的鉤子。語氣要興奮且具備煽動力。"
  };

  const parts: any[] = [
    { text: `
請使用${styleDescriptions[style]}風格。

使用者資料：
${userInput || "無額外描述"}

文案經紀人資訊：
姓名：${config.name}
電話：${config.phone}
LINE ID：${config.lineId}
LINE 連結：${config.lineLink}
公司：【台慶不動產台南海佃國小加盟店】
公司備註：✨ 鑫辰不動產有限公司
證號：(113) 登字第 481916 號
經紀人：林仕展 (110) 南市字第 00755 號

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
        temperature: 0.7,
      },
    });

    return response.text || "生成失敗。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("生成過程中發生錯誤。");
  }
}
