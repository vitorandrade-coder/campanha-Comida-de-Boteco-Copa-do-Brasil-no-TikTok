import React, { useEffect, useState } from 'react';
import {
  FileUp,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  Printer,
  FileSpreadsheet,
  Code2,
  X,
  Download,
  Video,
} from 'lucide-react';
import { DADOS_AGOSTO } from './data';
import { CampaignsView } from './components/CampaignsView';
import {
  CAMPANHA_TIKTOK_COPA_BOTECO,
  TIKTOK_COPA_BOTECO_POSTS,
} from './tiktokCampaignData';

export default function App() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [rawHtml, setRawHtml] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30/09 a 10/10/2026');

  const activeData = DADOS_AGOSTO;
  const campaign = CAMPANHA_TIKTOK_COPA_BOTECO;
  const posts = TIKTOK_COPA_BOTECO_POSTS;

  const formatBR = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

  // Carregar o arquivo HTML standalone para exportação direta
  useEffect(() => {
    fetch('/relatorio-assai-agosto-2026.html')
      .then((res) => res.text())
      .then((text) => setRawHtml(text))
      .catch((err) => console.error('Erro ao carregar HTML:', err));
  }, []);

  const handleCopyCode = async () => {
    try {
      if (rawHtml) {
        await navigator.clipboard.writeText(rawHtml);
      } else {
        await navigator.clipboard.writeText(document.documentElement.outerHTML);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      console.warn('Falha na cópia para o clipboard');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadFile = () => {
    const content = rawHtml || document.documentElement.outerHTML;
    const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'relatorio-assai-tiktok-campanha-2026.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleExportCsv = () => {
    const headers = [
      'Data',
      'Dia da Semana',
      'Horario',
      'Linha Editorial',
      'Titulo',
      'Campanha',
      'Views',
      'Interacoes',
      'Curtidas',
      'Comentarios',
      'Compartilhamentos',
      'Taxa Engajamento (%)',
      'Link TikTok',
    ];

    const rows = posts.map((p) => [
      p.data,
      p.diaSemana,
      p.horario,
      p.linhaEditorial,
      `"${p.titulo.replace(/"/g, '""')}"`,
      p.campanha,
      p.views,
      p.interacoes,
      p.curtidas,
      p.comentarios,
      p.compartilhamentos,
      p.taxaEngajamentoFormatted,
      p.link,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'campanha-tiktok-comida-de-boteco-assai.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    const exportData = {
      empresa: 'Assaí Atacadista',
      agencia: 'Megamídia Group',
      canal: 'TikTok (@assaiatacadistaoficial)',
      resumoCanal: {
        totalSeguidores: activeData.social.plataformas.tiktok.total,
        novosNoMes: activeData.social.plataformas.tiktok.novosNoMes,
        taxaCrescimento: activeData.social.plataformas.tiktok.taxaCrescimento,
      },
      campanha: campaign,
      publicacoes: posts,
      dataExportacao: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportData, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', 'campanha-tiktok-comida-de-boteco.json');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-[#1F2937] font-['Inter',sans-serif] pb-20">
      {/* ========================================================
          CABEÇALHO OFICIAL COM CO-BRANDING (ESTILO ANEXO 2)
          ======================================================== */}
      <header className="bg-[#005099] text-white py-3.5 px-4 sm:px-6 lg:px-8 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Lado Esquerdo: Logo Assaí + Performance Digital Semanal */}
          <div className="flex items-center gap-3.5">
            <div
              className="bg-white px-3.5 py-1.5 rounded-xl shadow-xs border border-white/60 flex items-center justify-center h-12 shrink-0 cursor-default"
              title="Cliente: Assaí Atacadista"
            >
              <img
                src="https://i.imgur.com/ihchsJt.png"
                alt="Logo Cliente Assaí Atacadista"
                className="h-8 max-w-[125px] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight uppercase">
                  Performance Digital Semanal
                </h1>
                <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  TikTok
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-blue-100 font-normal">
                Análise de engajamento e comunicação no ecossistema Assaí &bull; Campanha Comida de Boteco
              </p>
            </div>
          </div>

          {/* Lado Direito: Período Selecionado, Filtro de Período e Logo Megamídia */}
          <div className="flex items-center flex-wrap gap-2.5 self-start md:self-center">
            {/* Box 1: Período Selecionado */}
            <div className="bg-white text-gray-800 px-3 py-1.5 rounded-lg border border-white/60 shadow-xs flex items-center gap-2 text-xs">
              <Calendar className="w-3.5 h-3.5 text-[#005099] shrink-0" />
              <div>
                <span className="text-[9px] uppercase font-bold text-gray-400 block leading-none">
                  Período Selecionado
                </span>
                <span className="font-extrabold text-[#005099] text-xs leading-tight">
                  30 de Setembro a 10 de Outubro de 2026
                </span>
              </div>
            </div>

            {/* Box 2: Dropdown Filtro de Período */}
            <div className="bg-white text-gray-800 px-2.5 py-1.5 rounded-lg border border-white/60 shadow-xs flex items-center gap-1.5 text-xs">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-[11px] font-bold text-gray-600 hidden sm:inline">Filtro de Período:</span>
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-transparent text-[#005099] font-bold text-xs focus:outline-none cursor-pointer"
              >
                <option value="30/09 a 10/10/2026">30/09 a 10/10/2026 (Campanha TikTok)</option>
              </select>
            </div>

            {/* Logo Megamídia Group */}
            <div
              className="bg-white px-2.5 py-1 rounded-lg border border-white/60 shadow-xs flex items-center justify-center h-10 shrink-0"
              title="Agência: Megamídia Group"
            >
              <img
                src="https://i.imgur.com/lAyMWKF.png"
                alt="Logo Megamídia Group"
                className="h-5 max-w-[85px] object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </header>

      {/* ========================================================
          BARRA DE NAVEGAÇÃO DE ABAS: SOMENTE A ABA COM ANÁLISE DO TIKTOK
          ======================================================== */}
      <nav className="bg-white border-b border-gray-200 sticky top-[69px] z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
          {/* Somente a aba com a análise do TikTok */}
          <div className="flex items-center overflow-x-auto no-scrollbar scroll-smooth py-0.5 -mb-px">
            <button
              className="px-4 py-3 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-b-2 border-[#005099] text-[#005099] bg-blue-50/50 cursor-default flex items-center gap-2"
            >
              <span className="w-2.5 h-2.5 rounded-full bg-[#005099] animate-pulse" />
              <span>TIKTOK &bull; ANÁLISE DE CAMPANHA</span>
            </button>
          </div>

          {/* Botão de Ação à Direita: VISUALIZAR ONEPAGE */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExportModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#005099] hover:bg-[#00386b] text-white text-xs font-bold uppercase tracking-wider shadow-xs hover:shadow transition shrink-0 cursor-pointer"
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Visualizar Onepage</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ========================================================
          CONTAINER PRINCIPAL: EXCLUSIVAMENTE ANÁLISE DO TIKTOK
          ======================================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-7">
        {/* Resumo Oficial do Canal TikTok */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:shadow-md transition-all duration-300">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-black text-white flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
              TT
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-gray-900">
                  TikTok @assaiatacadistaoficial
                </h3>
                <span className="text-[11px] font-bold bg-green-50 text-green-700 px-2.5 py-0.5 rounded-full border border-green-200 flex items-center gap-1">
                  <Check className="w-3 h-3 text-green-600" />
                  Conta Oficial Verificada
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Canal estratégico para conteúdo em vídeo, patrocínios sazonais e ativações de marca do Assaí Atacadista.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs flex-wrap">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Base de Seguidores</span>
              <span className="text-xl font-black text-[#005099]">
                {formatBR(activeData.social.plataformas.tiktok.total)}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Novos no Mês</span>
              <span className="text-xl font-black text-[#28A745]">
                +{formatBR(activeData.social.plataformas.tiktok.novosNoMes)}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Taxa de Crescimento</span>
              <span className="text-xl font-black text-[#F26322]">
                {activeData.social.plataformas.tiktok.taxaCrescimento}
              </span>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400 block">Posts na Campanha</span>
              <span className="text-xl font-black text-gray-900">
                21 vídeos
              </span>
            </div>
          </div>
        </div>

        {/* Análise Completa da Campanha Comida de Boteco no TikTok (Layout do Anexo 2 + Dados da Planilha) */}
        <CampaignsView onExportCsv={handleExportCsv} />
      </main>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-gray-200 text-center text-xs text-gray-500">
        <p>
          &copy; 2026 Assaí Atacadista &bull; Análise de Performance TikTok &bull; Elaborado pela Agência Megamídia Group &bull; Dados auditados de 30/09 a 10/10/2026.
        </p>
      </footer>

      {/* ========================================================
          MODAL DE EXPORTAÇÃO EXECUTIVA
          ======================================================== */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-200 animate-in fade-in duration-200">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 text-base font-bold text-[#005099]">
                <FileUp className="w-5 h-5 text-[#F26322]" />
                <span>Exportar Relatório TikTok</span>
              </div>
              <button
                id="btn-close-modal"
                onClick={() => setIsExportModalOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-1 rounded-lg transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-gray-600 mb-5">
              Escolha o formato ideal para apresentação ou integração de dados da campanha no TikTok:
            </p>

            <div className="space-y-3">
              {/* Opção 1: Imprimir / PDF */}
              <button
                id="export-option-pdf"
                onClick={handlePrint}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200 hover:border-[#F26322] hover:bg-orange-50/40 text-left transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#005099] flex items-center justify-center shrink-0">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Relatório em PDF para Apresentação</h4>
                  <p className="text-[11px] text-gray-500">Formatação pronta para impressão ou exportação em PDF</p>
                </div>
              </button>

              {/* Opção 2: CSV */}
              <button
                id="export-option-csv"
                onClick={handleExportCsv}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200 hover:border-[#28A745] hover:bg-green-50/40 text-left transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-green-50 text-[#28A745] flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Planilha dos 21 Vídeos (CSV)</h4>
                  <p className="text-[11px] text-gray-500">Dados individuais dos posts com views, curtidas, comentários e links</p>
                </div>
              </button>

              {/* Opção 3: JSON */}
              <button
                id="export-option-json"
                onClick={handleExportJson}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200 hover:border-[#F26322] hover:bg-orange-50/40 text-left transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-orange-50 text-[#F26322] flex items-center justify-center shrink-0">
                  <Code2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Arquivo JSON Estruturado</h4>
                  <p className="text-[11px] text-gray-500">Métricas agregadas e array completo de publicações</p>
                </div>
              </button>

              {/* Opção 4: Baixar HTML Standalone */}
              <button
                id="export-option-html"
                onClick={handleDownloadFile}
                className="w-full flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-200 hover:border-[#005099] hover:bg-blue-50/40 text-left transition cursor-pointer"
              >
                <div className="w-10 h-10 rounded-lg bg-[#005099]/10 text-[#005099] flex items-center justify-center shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Baixar Documento HTML Standalone</h4>
                  <p className="text-[11px] text-gray-500">Arquivo offline pronto para envio por e-mail ou arquivamento</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
