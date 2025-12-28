
import React, { useState, useRef } from 'react';
import { CopywriterConfig, CopyStyle } from './types';
import { generatePropertyCopy } from './services/geminiService';

const DEFAULT_CONFIG: CopywriterConfig = {
  name: '莊淯翔（小莊）',
  phone: '0930-862-633',
  lineId: 'pi2358',
  lineLink: 'https://line.me/ti/p/iU_QvNI7t0',
};

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
  const [copySuccess, setCopySuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    { id: 'normal' as CopyStyle, label: '📋 正常標準版', color: 'bg-slate-600', hover: 'hover:bg-slate-700', active: 'ring-slate-200 bg-slate-50 text-slate-700 border-slate-200' },
    { id: 'warm' as CopyStyle, label: '🏠 溫馨家園版', color: 'bg-rose-500', hover: 'hover:bg-rose-600', active: 'ring-rose-200 bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'professional' as CopyStyle, label: '🏢 專業投資版', color: 'bg-blue-600', hover: 'hover:bg-blue-700', active: 'ring-blue-200 bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'broadcast' as CopyStyle, label: '🎤 短影音口播', color: 'bg-purple-600', hover: 'hover:bg-purple-700', active: 'ring-purple-200 bg-purple-50 text-purple-700 border-purple-200' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased">
      <nav className="bg-slate-900 text-white sticky top-0 z-50 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">Tainan Realtor AI</span>
          </div>
          <button onClick={() => setShowConfig(!showConfig)} className="text-xs bg-slate-800 px-4 py-2 rounded-lg border border-white/10 hover:bg-slate-700 transition-colors">設定經紀人資訊</button>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          {showConfig && (
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200 animate-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-slate-800 border-b pb-2 mb-4 uppercase tracking-wider">經紀人聯絡資訊</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">姓名</label>
                  <input type="text" value={config.name} onChange={e => setConfig({...config, name: e.target.value})} className="w-full bg-slate-50 border p-2 text-sm rounded focus:ring-2 focus:ring-amber-500 outline-none" placeholder="姓名" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400">電話</label>
                  <input type="text" value={config.phone} onChange={e => setConfig({...config, phone: e.target.value})} className="w-full bg-slate-50 border p-2 text-sm rounded focus:ring-2 focus:ring-amber-500 outline-none" placeholder="電話" />
                </div>
              </div>
            </div>
          )}

          {/* PDF & Input */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
            <div onClick={() => fileInputRef.current?.click()} className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${pdfName ? 'border-blue-500 bg-blue-50' : 'border-slate-200 hover:border-blue-400 hover:bg-slate-50'}`}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".pdf" className="hidden" />
              <div className="flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-8 w-8 ${pdfName ? 'text-blue-500' : 'text-slate-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <p className={`text-sm font-bold ${pdfName ? 'text-blue-700' : 'text-slate-500'}`}>{pdfName || '點擊上傳物件 PDF 說明書'}</p>
                {pdfName && <p className="text-[10px] text-blue-400 font-medium uppercase">已載入 PDF 數據</p>}
              </div>
            </div>
            <textarea
              className="w-full h-40 p-4 bg-slate-50 rounded-xl focus:outline-none text-sm border border-transparent focus:border-slate-200 resize-none"
              placeholder="貼上 591 內容或輸入補充資訊..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
          </div>

          {/* Style Selector */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">選擇生成的文案風格</label>
            <div className="grid grid-cols-2 gap-2">
              {styles.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setStyle(s.id)}
                  className={`py-3 px-3 rounded-xl text-xs font-bold transition-all border-2 text-left flex items-center gap-2 ${
                    style === s.id ? s.active + ' shadow-inner border-current' : 'bg-white border-transparent text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className={`w-full py-4 rounded-2xl font-black text-white shadow-xl transition-all transform active:scale-95 flex items-center justify-center gap-3 ${
              isGenerating ? 'bg-slate-300 cursor-not-allowed' : (styles.find(s => s.id === style)?.color || 'bg-slate-900') + ' hover:brightness-110'
            }`}
          >
            {isGenerating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                AI 正在撰寫中...
              </>
            ) : (
              '生成金牌文案'
            )}
          </button>
          
          {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-xs rounded-lg animate-pulse">⚠️ {error}</div>}
        </div>

        {/* Right Section: Preview */}
        <div className="lg:col-span-7 bg-slate-900 rounded-3xl shadow-2xl border border-slate-800 flex flex-col h-[750px] overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-white shadow-lg transition-colors ${styles.find(s => s.id === style)?.color}`}>
                {config.name.substring(0, 1)}
              </div>
              <div>
                <h4 className="text-white font-bold text-sm">{config.name}</h4>
                <p className="text-slate-400 text-[10px] uppercase tracking-tighter">{style.toUpperCase()} VERSION</p>
              </div>
            </div>
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50"></div>
              <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {generatedText ? (
              <pre className="text-slate-300 whitespace-pre-wrap font-sans text-base leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-500 selection:bg-amber-500 selection:text-slate-900">
                {generatedText}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-700 space-y-4">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center">
                   <p className="text-4xl opacity-30">✍️</p>
                </div>
                <div className="text-center space-y-1">
                  <p className="font-bold text-slate-500">預備生成您的金牌文案</p>
                  <p className="text-xs text-slate-600 uppercase tracking-widest">Select a style and hit generate</p>
                </div>
              </div>
            )}
          </div>

          {generatedText && (
            <div className="p-6 border-t border-white/5 bg-white/5 flex justify-end">
              <button
                onClick={handleCopy}
                className={`px-8 py-4 rounded-2xl font-bold transition-all transform active:scale-95 shadow-xl flex items-center gap-2 ${
                  copySuccess ? 'bg-green-500 text-white' : 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                }`}
              >
                {copySuccess ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    已複製到剪貼簿
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    複製文案內容
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
      
      <footer className="bg-white py-6 border-t text-center">
        <p className="text-slate-400 text-[10px] font-bold tracking-widest uppercase">
          台慶不動產台南海佃國小加盟店 | 鑫辰不動產有限公司
        </p>
      </footer>
    </div>
  );
};

export default App;
