
import React, { useState, useRef, useEffect } from 'react';
import { CopywriterConfig, CopyStyle } from './types';
import { generatePropertyCopy } from './services/geminiService';

const DEFAULT_CONFIG: CopywriterConfig = {
  name: '莊淯翔（小莊）',
  phone: '0930-862-633',
  lineId: 'pi2358',
  lineLink: 'https://line.me/ti/p/iU_QvNI7t0',
  licenseId: '(113) 登字第 481916 號',
  brokerInfo: '',
  featureIcon: '🤟',
};

const FEATURE_ICONS = ['🤟', '✨', '✅', '💎', '🏠', '📍', '🔥', '🏆', '🌈', '🌟', '🎯', '💯', '🔔', '🚩', '⚡', '🏡'];

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [config, setConfig] = useState<CopywriterConfig>(DEFAULT_CONFIG);
  const [style, setStyle] = useState<CopyStyle>('normal');
  const [generatedText, setGeneratedText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [showKeyGuide, setShowKeyGuide] = useState(false);
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [hasApiKey, setHasApiKey] = useState<boolean | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    checkApiKey();
  }, []);

  const checkApiKey = async () => {
    try {
      // @ts-ignore
      const selected = await window.aistudio.hasSelectedApiKey();
      setHasApiKey(selected);
    } catch (e) {
      setHasApiKey(false);
    }
  };

  const handleSelectApiKey = async () => {
    try {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasApiKey(true);
      setShowKeyGuide(false);
    } catch (e) {
      console.error("Failed to open key selector", e);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setPdfName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setPdfBase64(base64);
        setError(null);
      };
      reader.readAsDataURL(file);
    } else if (file) {
      setError('目前僅支援 PDF 檔案上傳。');
    }
  };

  const handleGenerate = async () => {
    if (!inputText.trim() && !pdfBase64) {
      setError('請輸入資料或上傳 PDF。');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCopySuccess(false);

    try {
      const result = await generatePropertyCopy(inputText, config, style, pdfBase64 || undefined);
      setGeneratedText(result);
    } catch (err: any) {
      setError(err.message || '發生錯誤');
      if (err.message?.includes("API 金鑰")) {
        setHasApiKey(false);
        setShowKeyGuide(true);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedText).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const styles = [
    { id: 'normal' as CopyStyle, label: '正常標準版', icon: '📋', desc: '專業準確', gradient: 'from-slate-500 to-slate-700', active: 'ring-slate-400 border-slate-600 bg-slate-50 text-slate-900' },
    { id: 'warm' as CopyStyle, label: '溫馨家園版', icon: '🏠', desc: '情感生活', gradient: 'from-rose-400 to-orange-500', active: 'ring-rose-400 border-rose-500 bg-rose-50 text-rose-900' },
    { id: 'professional' as CopyStyle, label: '專業投資版', icon: '🏢', desc: '數據增值', gradient: 'from-blue-500 to-indigo-700', active: 'ring-blue-400 border-blue-600 bg-blue-50 text-blue-900' },
    { id: 'broadcast' as CopyStyle, label: '短影音口播', icon: '🎤', desc: '吸睛動感', gradient: 'from-purple-500 to-fuchsia-600', active: 'ring-purple-400 border-purple-600 bg-purple-50 text-purple-900' },
  ];

  const currentStyleData = styles.find(s => s.id === style);

  return (
    <div className="min-h-screen bg-[#f1f5f9] flex flex-col antialiased">
      {/* Key Guide Modal */}
      {showKeyGuide && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1e293b] w-full max-w-lg rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-300">
            <div className="p-8 pb-4 flex justify-between items-start">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🔑</span>
                <h2 className="text-2xl font-black text-[#fbbf24] tracking-tight">如何獲取 API 金鑰？</h2>
              </div>
              <button onClick={() => setShowKeyGuide(false)} className="text-slate-400 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="px-8 pb-8 space-y-6">
              <p className="text-slate-300 text-sm leading-relaxed">
                本系統使用 Google Gemini 強大的 AI 模型進行推演，您需要免費申請一個金鑰。
              </p>
              
              <ol className="space-y-4">
                {[
                  { text: '前往 Google AI Studio', link: 'https://aistudio.google.com/app/api-keys?projectFilter=gen-lang-client-0354138731' },
                  { text: '登入您的 Google 帳號。' },
                  { text: '點擊藍色的 Create API key 按鈕。' },
                  { text: '選擇 Create API key in new project。' },
                  { text: '複製以 AIza 開頭的字串。' },
                  { text: '回到這裡點擊下方按鈕貼上即可使用！' }
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 text-slate-200">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs font-black text-amber-400 border border-white/10">{i + 1}</span>
                    <span className="text-sm">
                      {step.link ? (
                        <a href={step.link} target="_blank" rel="noreferrer" className="text-blue-400 font-bold underline hover:text-blue-300 transition-colors">{step.text}</a>
                      ) : step.text}
                    </span>
                  </li>
                ))}
              </ol>

              <button 
                onClick={handleSelectApiKey}
                className="w-full py-4 bg-[#c2410c] hover:bg-[#9a3412] text-white font-black text-lg rounded-2xl shadow-xl transition-all transform active:scale-[0.98] mt-4"
              >
                我瞭解了
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-[#0f172a] text-white sticky top-0 z-50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-amber-400 to-orange-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
              <span className="text-white font-black text-xl">台</span>
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight leading-none">台南房產金牌文案</h1>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Tainan Realtor AI Pro</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
              onClick={() => setShowConfig(!showConfig)} 
              className="flex items-center gap-2 bg-slate-800/50 hover:bg-slate-700 px-4 py-2 rounded-xl border border-white/5 transition-all text-xs font-bold"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              設定
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-5 space-y-8">
          {showConfig && (
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">📋 系統與個人設定</h3>
                <button onClick={() => setShowConfig(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>

              {/* API Key Section */}
              <div className="mb-8 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-[10px] font-black text-amber-600 uppercase tracking-wider">🔑 API 金鑰管理</label>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${hasApiKey ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {hasApiKey ? '已連接金鑰' : '尚未設定'}
                  </span>
                </div>
                <button 
                  onClick={handleSelectApiKey}
                  className="w-full py-3 bg-white border border-amber-300 text-amber-700 rounded-xl text-xs font-black hover:bg-amber-100 transition-all shadow-sm flex items-center justify-center gap-2 mb-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  選取專屬 API 金鑰
                </button>
                <div className="flex items-center justify-between px-1">
                  <button onClick={() => setShowKeyGuide(true)} className="text-[10px] text-blue-600 font-black hover:underline">如何獲取金鑰？</button>
                  <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-[9px] text-amber-700 underline font-black hover:text-amber-900 transition-colors"
                  >
                    計費與額度說明 ↗
                  </a>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">經紀人姓名</label>
                  <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full bg-slate-50 border-slate-200 border p-3 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase">服務熱線</label>
                  <input type="text" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} className="w-full bg-slate-50 border-slate-200 border p-3 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5 col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase">廣告證號</label>
                  <input type="text" value={config.licenseId} onChange={e => setConfig({...config, licenseId: e.target.value})} className="w-full bg-slate-50 border-slate-200 border p-3 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5 col-span-2 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black text-slate-400 uppercase">經紀人資訊 (選填)</label>
                    <span className="text-[9px] text-amber-500 font-bold">若留空則預設林仕展證號</span>
                  </div>
                  <input 
                    type="text" 
                    placeholder="例如：經紀人：林仕展 (110) 南市字第 00755 號" 
                    value={config.brokerInfo} 
                    onChange={e => setConfig({...config, brokerInfo: e.target.value})} 
                    className="w-full bg-slate-50 border-slate-200 border p-3 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  />
                </div>
                <div className="space-y-1.5 border-t pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase">LINE ID</label>
                  <input type="text" value={config.lineId} onChange={e => setConfig({...config, lineId: e.target.value})} className="w-full bg-slate-50 border-slate-200 border p-3 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
                <div className="space-y-1.5 border-t pt-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase">LINE 連結</label>
                  <input type="text" value={config.lineLink} onChange={e => setConfig({...config, lineLink: e.target.value})} className="w-full bg-slate-50 border-slate-200 border p-3 text-sm rounded-xl focus:ring-2 focus:ring-orange-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          )}

          {/* Feature Icon Picker - COLLAPSIBLE */}
          <div className="space-y-3">
            <button 
              onClick={() => setIsIconPickerOpen(!isIconPickerOpen)}
              className={`w-full bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between transition-all hover:bg-slate-50 ${isIconPickerOpen ? 'ring-2 ring-amber-400 border-transparent shadow-lg' : ''}`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-xl">
                  {config.featureIcon}
                </div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-800 uppercase tracking-wider">文案特色圖案</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">點擊切換項目符號</p>
                </div>
              </div>
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className={`h-5 w-5 text-slate-400 transition-transform duration-300 ${isIconPickerOpen ? 'rotate-180' : ''}`} 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
            
            {isIconPickerOpen && (
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2.5 p-5 bg-white rounded-3xl border border-amber-100 shadow-xl animate-in zoom-in-95 fade-in duration-200">
                {FEATURE_ICONS.map(icon => (
                  <button
                    key={icon}
                    onClick={() => {
                      setConfig({...config, featureIcon: icon});
                      setIsIconPickerOpen(false);
                    }}
                    className={`w-full aspect-square flex items-center justify-center text-2xl rounded-2xl transition-all ${
                      config.featureIcon === icon 
                      ? 'bg-amber-400 shadow-lg scale-105 text-white ring-4 ring-amber-100' 
                      : 'bg-slate-50 hover:bg-slate-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Style Selector */}
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] px-1">選擇主打風格</label>
            <div className="grid grid-cols-2 gap-4">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`group relative overflow-hidden rounded-2xl border-2 transition-all duration-300 p-4 text-left ${
                    style === s.id 
                    ? s.active + ' shadow-2xl scale-[1.02]' 
                    : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50 text-slate-600'
                  }`}
                >
                  <div className={`absolute top-0 right-0 w-16 h-16 bg-gradient-to-br ${s.gradient} opacity-10 rounded-bl-[4rem] group-hover:opacity-20 transition-opacity`}></div>
                  <div className="relative z-10">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <div className="font-black text-sm mb-0.5">{s.label}</div>
                    <div className="text-[10px] opacity-60 font-medium uppercase tracking-wider">{s.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* PDF & Input */}
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-200 space-y-4">
            <div onClick={() => fileInputRef.current?.click()} className={`group relative overflow-hidden border-2 border-dashed rounded-[1.5rem] p-8 text-center cursor-pointer transition-all ${pdfName ? 'border-amber-400 bg-amber-50' : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50'}`}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${pdfName ? 'bg-amber-400 text-white shadow-lg' : 'bg-slate-100 text-slate-400 group-hover:bg-amber-100'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                </div>
                <div>
                  <p className={`font-black text-sm ${pdfName ? 'text-amber-800' : 'text-slate-700'}`}>{pdfName || '上傳物件 PDF 說明書'}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight mt-1">{pdfName ? '資料已成功鎖定' : '點擊或拖曳至此處'}</p>
                </div>
              </div>
            </div>
            <textarea
              className="w-full h-44 p-5 bg-slate-50 rounded-[1.5rem] focus:outline-none text-sm border border-transparent focus:bg-white focus:border-slate-100 transition-all resize-none shadow-inner"
              placeholder="貼上物件介紹（例如 591 內容、內部筆記、補充說明...）"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-5 rounded-[1.5rem] font-black text-white shadow-2xl transition-all transform active:scale-95 flex items-center justify-center gap-4 relative overflow-hidden ${
              isGenerating ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r ' + currentStyleData?.gradient + ' hover:brightness-110 shadow-lg'
            }`}
          >
            {isGenerating ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span className="tracking-widest uppercase text-xs">AI 正在注入靈魂...</span>
              </>
            ) : (
              <>
                <span className="text-lg">✨</span>
                <span className="tracking-widest uppercase font-black">生成金牌文案</span>
              </>
            )}
          </button>
          
          {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-2xl animate-pulse flex items-center gap-2">⚠️ {error}</div>}
        </div>

        {/* Right Section: Premium Preview */}
        <div className="lg:col-span-7 bg-[#0f172a] rounded-[2.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] border border-slate-800 flex flex-col h-[800px] overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-2xl duration-500 bg-gradient-to-br ${currentStyleData?.gradient}`}>
                {currentStyleData?.icon}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm tracking-wide">{config.name} <span className="text-white/30 font-normal px-2">|</span> <span className="text-amber-400">撰寫中</span></h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`w-2 h-2 rounded-full animate-pulse bg-gradient-to-r ${currentStyleData?.gradient}`}></span>
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{currentStyleData?.label}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
              <div className="w-3 h-3 rounded-full bg-slate-700"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-10 custom-scrollbar scroll-smooth">
            {generatedText ? (
              <pre className="text-slate-200 whitespace-pre-wrap font-sans text-lg leading-relaxed animate-in fade-in slide-in-from-bottom-5 duration-700 selection:bg-amber-400 selection:text-slate-900">
                {generatedText}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className={`absolute inset-0 bg-gradient-to-r ${currentStyleData?.gradient} blur-3xl opacity-20 animate-pulse`}></div>
                  <div className="w-24 h-24 bg-slate-800/50 rounded-[2rem] flex items-center justify-center border border-white/5 relative z-10">
                     <p className="text-5xl drop-shadow-2xl">{currentStyleData?.icon}</p>
                  </div>
                </div>
                <div className="text-center space-y-2">
                  <p className="font-black text-slate-500 uppercase tracking-[0.3em]">Ready to Write</p>
                  <p className="text-xs text-slate-600 font-bold max-w-[240px] leading-relaxed">設定您的風格並點擊生成，AI 將為您打造最強房產文案。</p>
                </div>
              </div>
            )}
          </div>

          {generatedText && (
            <div className="p-8 border-t border-white/5 bg-white/5">
              <button
                onClick={handleCopy}
                className={`w-full py-5 rounded-[1.5rem] font-black transition-all transform active:scale-[0.98] shadow-2xl flex items-center justify-center gap-3 ${
                  copySuccess ? 'bg-green-500 text-white' : 'bg-amber-400 text-slate-900 hover:bg-amber-300'
                }`}
              >
                {copySuccess ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="tracking-widest uppercase">成功複製到剪貼簿</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    <span className="tracking-widest uppercase">複製完整文案內容</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-10 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-slate-900 font-black text-xs uppercase tracking-widest">台慶不動產台南海佃國小加盟店</p>
            <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase">鑫辰不動產有限公司 | 專業顧問團隊</p>
          </div>
          <div className="flex gap-4">
             <div className="px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 border border-slate-200 uppercase">AI Powered</div>
             <div className="px-4 py-2 bg-slate-100 rounded-lg text-[10px] font-black text-slate-500 border border-slate-200 uppercase">Tainan Exclusive</div>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 20px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
};

export default App;
