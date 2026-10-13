import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  FileText,
  Users,
  Eye,
  Sparkles,
  TrendingUp,
  ExternalLink,
  Search,
  Filter,
  ArrowUpDown,
  Heart,
  MessageCircle,
  Share2,
  Calendar,
  Clock,
  Award,
  Video,
  ChevronRight,
  Download,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import Chart from 'chart.js/auto';
import {
  CAMPANHA_TIKTOK_COPA_BOTECO,
  TIKTOK_COPA_BOTECO_POSTS,
  TikTokPostItem,
} from '../tiktokCampaignData';

interface CampaignsViewProps {
  onExportCsv?: () => void;
  onNavigateToGeneral?: () => void;
}

export const CampaignsView: React.FC<CampaignsViewProps> = ({ onExportCsv, onNavigateToGeneral }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'data' | 'views' | 'interacoes' | 'engajamento'>('data');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedDay, setSelectedDay] = useState<string>('all');

  const timelineChartRef = useRef<HTMLCanvasElement | null>(null);
  const doughnutChartRef = useRef<HTMLCanvasElement | null>(null);
  const rankingChartRef = useRef<HTMLCanvasElement | null>(null);

  const campaign = CAMPANHA_TIKTOK_COPA_BOTECO;
  const posts = TIKTOK_COPA_BOTECO_POSTS;

  const formatBR = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

  // Lista única de datas
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(posts.map((p) => p.data)));
  }, [posts]);

  // Filtragem e ordenação
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    if (selectedDay !== 'all') {
      result = result.filter((p) => p.data === selectedDay);
    }

    if (searchTerm.trim() !== '') {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.titulo.toLowerCase().includes(term) ||
          p.data.includes(term) ||
          p.diaSemana.toLowerCase().includes(term) ||
          p.horario.includes(term)
      );
    }

    result.sort((a, b) => {
      let valA: number = 0;
      let valB: number = 0;

      if (sortBy === 'views') {
        valA = a.views;
        valB = b.views;
      } else if (sortBy === 'interacoes') {
        valA = a.interacoes;
        valB = b.interacoes;
      } else if (sortBy === 'engajamento') {
        valA = a.taxaEngajamento;
        valB = b.taxaEngajamento;
      } else {
        // Por data/hora
        const parseDate = (d: string, h: string) => {
          const [day, mon, year] = d.split('/').map(Number);
          const [hour, min] = h.split(':').map(Number);
          return new Date(year, mon - 1, day, hour, min).getTime();
        };
        valA = parseDate(a.data, a.horario);
        valB = parseDate(b.data, b.horario);
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });

    return result;
  }, [posts, selectedDay, searchTerm, sortBy, sortOrder]);

  // Top 5 posts por engajamento
  const topEngagingPosts = useMemo(() => {
    return [...posts].sort((a, b) => b.taxaEngajamento - a.taxaEngajamento).slice(0, 5);
  }, [posts]);

  // Inicialização dos gráficos
  useEffect(() => {
    // Destruir gráficos pré-existentes nos canvas para evitar erro de canvas em uso
    if (timelineChartRef.current) {
      Chart.getChart(timelineChartRef.current)?.destroy();
    }
    if (doughnutChartRef.current) {
      Chart.getChart(doughnutChartRef.current)?.destroy();
    }
    if (rankingChartRef.current) {
      Chart.getChart(rankingChartRef.current)?.destroy();
    }

    let timelineChart: Chart | null = null;
    let doughnutChart: Chart | null = null;
    let rankingChart: Chart | null = null;

    // 1. Gráfico de Evolução Post a Post (Views & Interações)
    if (timelineChartRef.current) {
      const labels = posts.map((p, idx) => `${p.data.slice(0, 5)} #${idx + 1}`);
      const viewsData = posts.map((p) => p.views);
      const interactionsData = posts.map((p) => p.interacoes);

      timelineChart = new Chart(timelineChartRef.current, {
        type: 'line',
        data: {
          labels,
          datasets: [
            {
              label: 'Visualizações (Views)',
              data: viewsData,
              borderColor: '#005099',
              backgroundColor: 'rgba(0, 80, 153, 0.08)',
              yAxisID: 'yViews',
              tension: 0.35,
              borderWidth: 2.5,
              fill: true,
              pointBackgroundColor: '#005099',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
            {
              label: 'Interações Totais',
              data: interactionsData,
              borderColor: '#F26322',
              backgroundColor: '#F26322',
              yAxisID: 'yInteractions',
              tension: 0.35,
              borderWidth: 2,
              pointBackgroundColor: '#F26322',
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                font: { family: "'Inter', sans-serif", size: 12, weight: 600 },
                color: '#374151',
                usePointStyle: true,
              },
            },
            tooltip: {
              backgroundColor: 'rgba(0, 56, 107, 0.95)',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                title: (items) => {
                  const idx = items[0]?.dataIndex ?? 0;
                  const item = posts[idx];
                  return `${item.data} às ${item.horario} - ${item.titulo}`;
                },
              },
            },
          },
          scales: {
            yViews: {
              type: 'linear',
              position: 'left',
              beginAtZero: true,
              title: {
                display: true,
                text: 'Visualizações (Views)',
                color: '#005099',
                font: { size: 11, weight: 600 },
              },
              grid: { color: '#E5E7EB' },
              ticks: { color: '#6B7280' },
            },
            yInteractions: {
              type: 'linear',
              position: 'right',
              beginAtZero: true,
              title: {
                display: true,
                text: 'Interações',
                color: '#F26322',
                font: { size: 11, weight: 600 },
              },
              grid: { drawOnChartArea: false },
              ticks: { color: '#F26322' },
            },
            x: {
              grid: { display: false },
              ticks: {
                font: { size: 10 },
                color: '#6B7280',
                maxRotation: 45,
                minRotation: 45,
              },
            },
          },
        },
      });
    }

    // 2. Gráfico Donut de Composição das Interações
    if (doughnutChartRef.current) {
      doughnutChart = new Chart(doughnutChartRef.current, {
        type: 'doughnut',
        data: {
          labels: [
            `Curtidas (${campaign.totalCurtidas})`,
            `Comentários (${campaign.totalComentarios})`,
            `Compartilhamentos (${campaign.totalCompartilhamentos})`,
          ],
          datasets: [
            {
              data: [
                campaign.totalCurtidas,
                campaign.totalComentarios,
                campaign.totalCompartilhamentos,
              ],
              backgroundColor: ['#F26322', '#005099', '#28A745'],
              borderWidth: 2,
              borderColor: '#FFFFFF',
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '68%',
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                font: { family: "'Inter', sans-serif", size: 11, weight: 600 },
                color: '#374151',
                usePointStyle: true,
              },
            },
            tooltip: {
              callbacks: {
                label: (ctx) => {
                  const val = ctx.raw as number;
                  const pct = ((val / campaign.totalInteracoes) * 100).toFixed(1);
                  return ` ${ctx.label}: ${val} (${pct}%)`;
                },
              },
            },
          },
        },
      });
    }

    // 3. Gráfico de Ranking Top 5 Engajamento
    if (rankingChartRef.current) {
      const topLabels = topEngagingPosts.map((p) => {
        const short = p.titulo.replace('COMIDA DE BOTECO | ', '').slice(0, 18);
        return `${short}... (${p.data.slice(0, 5)})`;
      });
      const topEngData = topEngagingPosts.map((p) => p.taxaEngajamento);

      rankingChart = new Chart(rankingChartRef.current, {
        type: 'bar',
        data: {
          labels: topLabels,
          datasets: [
            {
              label: 'Taxa de Engajamento (%)',
              data: topEngData,
              backgroundColor: [
                '#F26322',
                '#FF7F41',
                '#005099',
                '#1877F2',
                '#28A745',
              ],
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: {
                label: (ctx) => ` Engajamento: ${ctx.raw}%`,
              },
            },
          },
          scales: {
            x: {
              beginAtZero: true,
              ticks: {
                callback: (v) => `${v}%`,
                color: '#6B7280',
                font: { size: 10 },
              },
              grid: { color: '#E5E7EB' },
            },
            y: {
              grid: { display: false },
              ticks: {
                color: '#374151',
                font: { size: 11, weight: 600 },
              },
            },
          },
        },
      });
    }

    return () => {
      timelineChart?.destroy();
      doughnutChart?.destroy();
      rankingChart?.destroy();
    };
  }, [posts, campaign, topEngagingPosts]);

  return (
    <div className="space-y-7 animate-in fade-in duration-300">
      {/* ========================================================
          CABEÇALHO DA SEÇÃO DE CAMPANHAS (ESTILO ANEXO 2)
          ======================================================== */}
      <div>
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#005099] border border-blue-200">
            <Flame className="w-3.5 h-3.5 text-[#F26322]" />
            CAMPANHAS ATIVAS
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-500" />
            Período: 30/09 a 10/10/2026
          </span>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-black text-white">
            <Video className="w-3 h-3" />
            TikTok
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#005099] tracking-tight">
          Performance de Campanhas
        </h2>
        <p className="text-xs md:text-sm text-gray-500 mt-1">
          Monitoramento executivo do desempenho individual e consolidado de cada campanha veiculada na semana.
        </p>
      </div>

      {/* ========================================================
          5 CARDS DE KPI SUPERIORES (EXATAMENTE COMO NO ANEXO 2)
          ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 1. TOTAL DE POSTS */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Total de Posts
            </span>
            <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 group-hover:text-[#005099] group-hover:bg-blue-50 transition flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#005099] tracking-tight">
            {campaign.totalPosts}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium flex items-center gap-1">
            <span>1 campanha ativa</span>
          </div>
        </div>

        {/* 2. SOMA DE ALCANCE */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Soma de Alcance
            </span>
            <div className="w-8 h-8 rounded-lg bg-orange-50 text-[#F26322] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#005099] tracking-tight group-hover:text-[#F26322] transition">
            {formatBR(campaign.somaAlcance)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            Usuários únicos alcançados
          </div>
        </div>

        {/* 3. SOMA DE IMPRESSÕES */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Soma de Impressões
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#005099] flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#005099] tracking-tight">
            {formatBR(campaign.somaImpressoes)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            Visualizações totais
          </div>
        </div>

        {/* 4. INTERAÇÕES */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Interações
            </span>
            <div className="w-8 h-8 rounded-lg bg-green-50 text-[#28A745] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#28A745] tracking-tight">
            {formatBR(campaign.totalInteracoes)}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            Engajamento qualificado
          </div>
        </div>

        {/* 5. ENGAJAMENTO MÉDIO */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs hover:shadow-md transition-all duration-200 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-500">
              Engajamento Médio
            </span>
            <div className="w-8 h-8 rounded-lg bg-red-50 text-[#E11D48] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#E11D48] tracking-tight">
            {campaign.engajamentoMedioPonderadoFormatted}
          </div>
          <div className="text-[11px] text-gray-500 mt-1 font-medium">
            Média ponderada do período
          </div>
        </div>
      </div>

      {/* ========================================================
          CARD DA CAMPANHA ESPECÍFICA (ESTILO EXATO DO ANEXO 2)
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs p-5 md:p-6 hover:shadow-md transition-all duration-300">
        {/* Linha de Título e Badges da Campanha */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="w-3 h-3 rounded-full bg-[#005099] ring-4 ring-blue-100 shrink-0" />
            <h3 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
              {campaign.nome}
              <span className="text-gray-400 font-normal text-base ml-2">
                ({campaign.tema})
              </span>
            </h3>
            <span className="text-xs font-bold uppercase px-2.5 py-0.5 rounded-md bg-blue-50 text-[#005099] border border-blue-200">
              {campaign.categoria}
            </span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 border border-purple-200 flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Campanha Ativa do Período
            </span>
          </div>

          <div className="text-xs font-bold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200 self-start sm:self-auto">
            {campaign.totalPosts} publicações
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 mb-5">
          Total de {campaign.totalPosts} publicações no período ({campaign.periodo}) veiculadas no TikTok oficial (@assaiatacadistaoficial).
        </p>

        {/* Subcards de KPI com bordas coloridas verticais à esquerda (como no anexo 2) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 mb-5">
          {/* 1. Publicações */}
          <div className="bg-gray-50/70 p-3.5 rounded-xl border-l-4 border-l-gray-400 border border-gray-200">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
              Publicações
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {campaign.totalPosts}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Total de posts ativos
            </div>
          </div>

          {/* 2. Soma de Alcance */}
          <div className="bg-orange-50/40 p-3.5 rounded-xl border-l-4 border-l-[#F26322] border border-orange-100">
            <div className="text-[10px] font-bold text-[#F26322] uppercase tracking-wider">
              Soma de Alcance
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {formatBR(campaign.somaAlcance)}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Usuários alcançados
            </div>
          </div>

          {/* 3. Soma de Impressões */}
          <div className="bg-blue-50/40 p-3.5 rounded-xl border-l-4 border-l-[#005099] border border-blue-100">
            <div className="text-[10px] font-bold text-[#005099] uppercase tracking-wider">
              Soma de Impressões
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {formatBR(campaign.somaImpressoes)}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Visualizações/impressões
            </div>
          </div>

          {/* 4. Soma de Interações */}
          <div className="bg-green-50/40 p-3.5 rounded-xl border-l-4 border-l-[#28A745] border border-green-100">
            <div className="text-[10px] font-bold text-[#28A745] uppercase tracking-wider">
              Soma de Interações
            </div>
            <div className="text-xl md:text-2xl font-black text-gray-900 mt-1">
              {formatBR(campaign.totalInteracoes)}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              {campaign.totalCurtidas} curtidas &bull; {campaign.totalComentarios} com. &bull; {campaign.totalCompartilhamentos} comp.
            </div>
          </div>

          {/* 5. Engajamento Médio */}
          <div className="bg-red-50/40 p-3.5 rounded-xl border-l-4 border-l-[#E11D48] border border-red-100 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider">
              Engajamento Médio
            </div>
            <div className="text-xl md:text-2xl font-black text-[#E11D48] mt-1">
              {campaign.engajamentoMedioPonderadoFormatted}
            </div>
            <div className="text-[10px] text-gray-500 mt-0.5">
              Taxa média da campanha
            </div>
          </div>
        </div>

        {/* Diagnóstico Executivo (como no anexo 2) */}
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs text-gray-700 leading-relaxed flex items-start gap-2.5">
          <span className="font-extrabold text-[#005099] uppercase tracking-wider shrink-0">
            DIAGNÓSTICO EXECUTIVO:
          </span>
          <span>
            {campaign.diagnosticoExecutivo}
          </span>
        </div>
      </div>

      {/* ========================================================
          GRÁFICOS ANALÍTICOS DA CAMPANHA
          ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico 1: Evolução Post a Post */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="mb-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-[#005099] flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#F26322]" />
                <span>Visualizações & Interações ao Longo dos Posts</span>
              </h4>
              <span className="text-[11px] text-gray-500 font-semibold bg-gray-100 px-2.5 py-0.5 rounded-full">
                30/09 a 10/10/2026
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Acompanhamento de volume de views e resposta de engajamento em cada publicação
            </p>
          </div>
          <div className="relative h-64 w-full">
            <canvas ref={timelineChartRef} />
          </div>
        </div>

        {/* Gráfico 2: Composição das Interações & Destaque */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h4 className="text-sm font-bold text-[#005099] flex items-center gap-2">
              <Heart className="w-4 h-4 text-[#F26322]" />
              <span>Mix de Interações</span>
            </h4>
            <p className="text-xs text-gray-500 mt-0.5">
              208 curtidas (93,7%), 12 comentários (5,4%) e 2 compartilhamentos (0,9%)
            </p>
          </div>
          <div className="relative h-44 w-full flex items-center justify-center">
            <canvas ref={doughnutChartRef} />
          </div>

          {/* Destaque do Melhor Post */}
          <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <div className="flex items-center justify-between text-xs font-bold text-[#F26322] mb-1">
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5" />
                Melhor Engajamento
              </span>
              <span className="bg-[#F26322] text-white px-2 py-0.5 rounded text-[10px]">
                {campaign.melhorPost.taxaEngajamento}
              </span>
            </div>
            <p className="text-xs font-semibold text-gray-800 line-clamp-1">
              {campaign.melhorPost.titulo}
            </p>
            <div className="text-[11px] text-gray-500 mt-0.5">
              {campaign.melhorPost.views} visualizações &bull; {campaign.melhorPost.interacoes} interações
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          TABELA DETALHADA DAS 21 PUBLICAÇÕES NO TIKTOK
          ======================================================== */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        {/* Barra de Filtro e Busca da Tabela */}
        <div className="p-4 bg-gray-50/80 border-b border-gray-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por receita, episódio ou data..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-xs bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-[#005099] focus:ring-1 focus:ring-[#005099] w-64"
              />
            </div>

            {/* Filtro por Dia */}
            <select
              value={selectedDay}
              onChange={(e) => setSelectedDay(e.target.value)}
              className="text-xs bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-gray-700 font-medium focus:outline-none focus:border-[#005099]"
            >
              <option value="all">Todas as datas ({posts.length} posts)</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d} ({posts.filter((p) => p.data === d).length} post{posts.filter((p) => p.data === d).length > 1 ? 's' : ''})
                </option>
              ))}
            </select>

            {/* Ordenação */}
            <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-500">Ordenar:</span>
              <button
                onClick={() => {
                  if (sortBy === 'engajamento') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('engajamento'); setSortOrder('desc'); }
                }}
                className={`font-semibold cursor-pointer px-1.5 py-0.5 rounded ${
                  sortBy === 'engajamento' ? 'bg-orange-100 text-[#F26322]' : 'text-gray-600 hover:text-black'
                }`}
              >
                Engajamento {sortBy === 'engajamento' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'views') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('views'); setSortOrder('desc'); }
                }}
                className={`font-semibold cursor-pointer px-1.5 py-0.5 rounded ${
                  sortBy === 'views' ? 'bg-blue-100 text-[#005099]' : 'text-gray-600 hover:text-black'
                }`}
              >
                Views {sortBy === 'views' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
              <button
                onClick={() => {
                  if (sortBy === 'data') setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                  else { setSortBy('data'); setSortOrder('asc'); }
                }}
                className={`font-semibold cursor-pointer px-1.5 py-0.5 rounded ${
                  sortBy === 'data' ? 'bg-gray-100 text-gray-900' : 'text-gray-600 hover:text-black'
                }`}
              >
                Data {sortBy === 'data' && (sortOrder === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          <div className="text-xs text-gray-500 font-semibold self-end md:self-center">
            Exibindo {filteredPosts.length} de {posts.length} publicações
          </div>
        </div>

        {/* Conteúdo da Tabela */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-gray-100 text-[#005099] font-bold border-b border-gray-200">
              <tr>
                <th className="py-3.5 px-4">Data & Horário</th>
                <th className="py-3.5 px-4">Título do Vídeo</th>
                <th className="py-3.5 px-4">Linha Editorial</th>
                <th className="py-3.5 px-4">Campanha</th>
                <th className="py-3.5 px-4 text-right">Views</th>
                <th className="py-3.5 px-4 text-right">Interações</th>
                <th className="py-3.5 px-4 text-right">Curtidas</th>
                <th className="py-3.5 px-4 text-right">Comentários</th>
                <th className="py-3.5 px-4 text-right">Compart.</th>
                <th className="py-3.5 px-4 text-right">Engajamento</th>
                <th className="py-3.5 px-4 text-center">Link TikTok</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => {
                const isHighlight = post.taxaEngajamento >= 2.5;

                return (
                  <tr
                    key={post.id}
                    className={`hover:bg-gray-50/90 transition ${
                      isHighlight ? 'bg-orange-50/20' : ''
                    }`}
                  >
                    {/* Data & Horário */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-bold text-gray-900">{post.data}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <span>{post.diaSemana}</span> &bull; <span>{post.horario}</span>
                      </div>
                    </td>

                    {/* Título */}
                    <td className="py-3 px-4 font-semibold text-gray-800 max-w-xs">
                      <div className="flex items-center gap-1.5">
                        {isHighlight && (
                          <Flame className="w-3.5 h-3.5 text-[#F26322] shrink-0" title="Alto Engajamento" />
                        )}
                        <span className="truncate" title={post.titulo}>
                          {post.titulo}
                        </span>
                      </div>
                    </td>

                    {/* Linha Editorial */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-[#005099] border border-blue-200">
                        {post.linhaEditorial}
                      </span>
                    </td>

                    {/* Campanha */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-gray-700 font-semibold text-[11px]">
                        {post.campanha}
                      </span>
                    </td>

                    {/* Views */}
                    <td className="py-3 px-4 text-right font-extrabold text-[#005099]">
                      {formatBR(post.views)}
                    </td>

                    {/* Interações */}
                    <td className="py-3 px-4 text-right font-bold text-gray-900">
                      {post.interacoes}
                    </td>

                    {/* Curtidas */}
                    <td className="py-3 px-4 text-right text-gray-600">
                      {post.curtidas}
                    </td>

                    {/* Comentários */}
                    <td className="py-3 px-4 text-right text-gray-600">
                      {post.comentarios}
                    </td>

                    {/* Compartilhamentos */}
                    <td className="py-3 px-4 text-right text-gray-600">
                      {post.compartilhamentos}
                    </td>

                    {/* Taxa de Engajamento */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-xs ${
                          post.taxaEngajamento >= 2.5
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : post.taxaEngajamento >= 1.5
                            ? 'bg-blue-50 text-[#005099] border border-blue-200'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {post.taxaEngajamentoFormatted}
                      </span>
                    </td>

                    {/* Link */}
                    <td className="py-3 px-4 text-center">
                      <a
                        href={post.link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-black hover:text-white text-gray-700 transition"
                        title="Ver publicação no TikTok"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
