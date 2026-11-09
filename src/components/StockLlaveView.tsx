import React, { useState } from 'react';
import {
  Boxes,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Search,
  Filter,
  Sparkles,
  Download,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { Referencia, ReferenciaDetalle } from '../types';
import { api } from '../services/api';
import { irisVoice } from '../services/speech';

interface StockLlaveViewProps {
  referencias: Referencia[];
  tallas: number[];
  onRefresh: () => void;
  onIrisAdvice: (topic: string) => void;
}

export const StockLlaveView: React.FC<StockLlaveViewProps> = ({
  referencias,
  tallas,
  onRefresh,
  onIrisAdvice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRef, setSelectedRef] = useState<ReferenciaDetalle | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ text: string; isError?: boolean } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  // New Reference Form
  const [newCodigo, setNewCodigo] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [isSubmittingNew, setIsSubmittingNew] = useState(false);

  // Movement Form
  const [moveTipo, setMoveTipo] = useState<'ENTRADA' | 'SALIDA'>('ENTRADA');
  const [moveCantidades, setMoveCantidades] = useState<Record<number, string>>({});
  const [moveNota, setMoveNota] = useState('');
  const [isSubmittingMove, setIsSubmittingMove] = useState(false);

  // Filter references
  const filteredReferencias = referencias.filter(
    (r) =>
      r.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.descripcion.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalStockUnits = referencias.reduce((acc, r) => acc + (r.total || 0), 0);

  // Load Reference details
  const handleSelectRef = async (refId: number) => {
    setIsLoadingDetail(true);
    setActionMessage(null);
    try {
      const data = await api.getReferenciaDetalle(refId);
      setSelectedRef(data);
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Error al cargar referencia', isError: true });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // Submit New Reference
  const handleCreateReference = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCodigo.trim() || !newDescripcion.trim()) return;

    setIsSubmittingNew(true);
    try {
      await api.createReferencia(newCodigo, newDescripcion);
      irisVoice.playHarmonicChime('stock');
      setActionMessage({ text: `Referencia ${newCodigo.toUpperCase()} creada con éxito.` });
      setNewCodigo('');
      setNewDescripcion('');
      setShowCreateModal(false);
      onRefresh();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Error al crear referencia', isError: true });
    } finally {
      setIsSubmittingNew(false);
    }
  };

  // Submit Inventory Movement (ENTRADA / SALIDA)
  const handleSubmitMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRef) return;

    const parsedCantidades: Record<number, number> = {};
    for (const t of tallas) {
      const val = parseInt(moveCantidades[t] || '0', 10);
      if (val > 0) {
        parsedCantidades[t] = val;
      }
    }

    if (Object.keys(parsedCantidades).length === 0) {
      setActionMessage({ text: 'Ingresa al menos una cantidad mayor a 0', isError: true });
      return;
    }

    setIsSubmittingMove(true);
    try {
      const res = await api.recordMovimiento(
        selectedRef.referencia.id,
        moveTipo,
        parsedCantidades,
        moveNota
      );
      irisVoice.playHarmonicChime('stock');
      setActionMessage({ text: res.message });
      setMoveCantidades({});
      setMoveNota('');
      setShowMoveModal(false);
      // Reload detail and list
      await handleSelectRef(selectedRef.referencia.id);
      onRefresh();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Error al registrar movimiento', isError: true });
    } finally {
      setIsSubmittingMove(false);
    }
  };

  // Delete Reference
  const handleDeleteRef = async (refId: number, codigo: string) => {
    try {
      await api.deleteReferencia(refId);
      setActionMessage({ text: `Referencia ${codigo} eliminada.` });
      setConfirmDeleteId(null);
      if (selectedRef?.referencia.id === refId) {
        setSelectedRef(null);
      }
      onRefresh();
    } catch (err: any) {
      setActionMessage({ text: err.message || 'Error al eliminar', isError: true });
    }
  };

  // Export inventory as CSV
  const handleExportCSV = () => {
    const headers = ['ID', 'Codigo', 'Descripcion', ...tallas.map((t) => `Talla_${t}`), 'Total'];
    const rows = referencias.map((r) => [
      r.id,
      `"${r.codigo}"`,
      `"${r.descripcion}"`,
      ...tallas.map((t) => r.stock[t] || 0),
      r.total,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `StockLlave_Inventario_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action and feedback notifications */}
      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between border ${
            actionMessage.isError
              ? 'bg-red-950/60 border-red-500/40 text-red-200'
              : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2 text-sm">
            {actionMessage.isError ? (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs opacity-75 hover:opacity-100 font-mono-code"
          >
            ✕ Cerrar
          </button>
        </div>
      )}

      {/* Top Warehouse Controls & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel rounded-2xl p-5 border border-rose-500/20">
          <span className="text-xs text-neutral-400 font-mono-code block">Referencias en Bodega</span>
          <span className="text-2xl font-bold font-mono-code text-white mt-1 block">
            {referencias.length}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">Códigos activos</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-purple-500/20">
          <span className="text-xs text-neutral-400 font-mono-code block">Unidades Totales</span>
          <span className="text-2xl font-bold font-mono-code text-purple-300 mt-1 block">
            {totalStockUnits}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">Prendas en stock</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-cyan-500/20">
          <span className="text-xs text-neutral-400 font-mono-code block">Tallas Estandarizadas</span>
          <span className="text-lg font-bold font-mono-code text-cyan-300 mt-1 block">
            {tallas.join(' • ')}
          </span>
          <span className="text-[11px] text-neutral-400 mt-1 block">Curva completa de tallas</span>
        </div>

        <div className="glass-panel rounded-2xl p-5 border border-amber-500/20 flex flex-col justify-between">
          <span className="text-xs text-neutral-400 font-mono-code">Diagnóstico Iris AI</span>
          <button
            onClick={() => onIrisAdvice('Diagnóstico de stock y reposición')}
            className="mt-2 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-200 text-xs font-medium transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Analizar Quiebres de Stock
          </button>
        </div>
      </div>

      {/* Main Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por código (ej. 51-22) o descripción..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-rose-500/50 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            Nueva Referencia
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
            title="Exportar inventario en formato CSV"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar CSV
          </button>

          <button
            onClick={onRefresh}
            className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-neutral-300 transition-colors"
            title="Actualizar datos"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Inventory Table & Reference Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* References List */}
        <div className={`${selectedRef ? 'lg:col-span-7' : 'lg:col-span-12'} space-y-4`}>
          <div className="rounded-2xl border border-neutral-800 bg-neutral-950/60 overflow-hidden shadow-xl">
            <div className="p-4 border-b border-neutral-800/80 bg-neutral-900/40 flex items-center justify-between">
              <h3 className="font-serif-luxury text-base font-bold text-neutral-200 flex items-center gap-2">
                <Boxes className="w-4 h-4 text-rose-400" />
                Referencias en Bodega StockLlave
              </h3>
              <span className="text-xs font-mono-code text-neutral-400">
                {filteredReferencias.length} registros
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-neutral-800 bg-neutral-900/60 text-neutral-400 font-mono-code uppercase text-[10px]">
                    <th className="py-3 px-4">Código</th>
                    <th className="py-3 px-4">Descripción</th>
                    <th className="py-3 px-4 text-center">Curva Tallas (6-16)</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-900">
                  {filteredReferencias.length > 0 ? (
                    filteredReferencias.map((ref) => {
                      const isSelected = selectedRef?.referencia.id === ref.id;
                      return (
                        <tr
                          key={ref.id}
                          onClick={() => handleSelectRef(ref.id)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-rose-500/15 border-l-4 border-l-rose-500'
                              : 'hover:bg-neutral-900/50'
                          }`}
                        >
                          <td className="py-3.5 px-4 font-mono-code font-bold text-white">
                            <span className="px-2 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-rose-300">
                              {ref.codigo}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-neutral-300 font-medium">
                            {ref.descripcion}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center justify-center gap-1">
                              {tallas.map((t) => {
                                const qty = ref.stock?.[t] || 0;
                                return (
                                  <span
                                    key={t}
                                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono-code ${
                                      qty === 0
                                        ? 'bg-red-950/60 text-red-400 border border-red-900/50'
                                        : qty < 5
                                        ? 'bg-amber-950/60 text-amber-300 border border-amber-900/50'
                                        : 'bg-neutral-900 text-neutral-300'
                                    }`}
                                    title={`Talla ${t}: ${qty} unidades`}
                                  >
                                    {qty}
                                  </span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-code font-bold text-sm">
                            <span
                              className={
                                ref.total === 0
                                  ? 'text-red-400'
                                  : ref.total < 15
                                  ? 'text-amber-300'
                                  : 'text-emerald-400'
                              }
                            >
                              {ref.total}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectRef(ref.id);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-neutral-300 border border-neutral-700/60 text-[11px]"
                            >
                              Detalles
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-neutral-500 font-mono-code">
                        No se encontraron referencias que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Selected Reference Detail Panel */}
        {selectedRef && (
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-rose-500/30 bg-neutral-950/80 p-5 shadow-2xl space-y-5">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-code text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      {selectedRef.referencia.codigo}
                    </span>
                    <h4 className="font-serif-luxury text-lg font-bold text-white">
                      {selectedRef.referencia.descripcion}
                    </h4>
                  </div>
                  <p className="text-xs text-neutral-400 mt-1">
                    Inventario activo en bodega StockLlave
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {confirmDeleteId === selectedRef.referencia.id ? (
                    <div className="flex items-center gap-1.5 p-1 rounded-lg bg-red-950/80 border border-red-500/40 text-xs">
                      <span className="text-[10px] text-red-200">¿Eliminar?</span>
                      <button
                        onClick={() => handleDeleteRef(selectedRef.referencia.id, selectedRef.referencia.codigo)}
                        className="px-1.5 py-0.5 rounded bg-red-600 hover:bg-red-500 text-white text-[10px] font-bold"
                      >
                        Sí
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 text-[10px]"
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setConfirmDeleteId(selectedRef.referencia.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                      title="Eliminar referencia"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setSelectedRef(null);
                      setConfirmDeleteId(null);
                    }}
                    className="text-xs text-neutral-500 hover:text-neutral-300 font-mono-code"
                  >
                    ✕
                  </button>
                </div>
              </div>

              {/* Sizes Breakdown Cards */}
              <div>
                <span className="text-[11px] font-mono-code text-neutral-400 uppercase tracking-wider block mb-2">
                  Existencias por Talla
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {selectedRef.stock.map((item) => (
                    <div
                      key={item.talla}
                      className={`p-2.5 rounded-xl border text-center font-mono-code ${
                        item.cantidad === 0
                          ? 'bg-red-950/30 border-red-900/60 text-red-300'
                          : item.cantidad < 5
                          ? 'bg-amber-950/30 border-amber-900/60 text-amber-300'
                          : 'bg-neutral-900/80 border-neutral-800 text-neutral-100'
                      }`}
                    >
                      <span className="text-[10px] text-neutral-400 block">Talla {item.talla}</span>
                      <span className="text-lg font-bold block mt-0.5">{item.cantidad}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-3 flex items-center justify-between p-3 rounded-xl bg-neutral-900/60 border border-neutral-800">
                  <span className="text-xs text-neutral-300 font-medium">TOTAL DISPONIBLE</span>
                  <span className="text-lg font-bold font-mono-code text-rose-300">
                    {selectedRef.total} u.
                  </span>
                </div>
              </div>

              {/* Actions for this reference */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setMoveTipo('ENTRADA');
                    setShowMoveModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  Registrar Entrada
                </button>

                <button
                  onClick={() => {
                    setMoveTipo('SALIDA');
                    setShowMoveModal(true);
                  }}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 transition-colors"
                >
                  <ArrowUpRight className="w-4 h-4" />
                  Registrar Salida
                </button>
              </div>

              {/* Movement History Log */}
              <div className="space-y-2 pt-2 border-t border-neutral-800">
                <span className="text-[11px] font-mono-code text-neutral-400 uppercase tracking-wider block">
                  Historial de Movimientos ({selectedRef.movimientos.length})
                </span>

                <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
                  {selectedRef.movimientos.length > 0 ? (
                    selectedRef.movimientos.map((m) => (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 text-xs flex items-start justify-between gap-3"
                      >
                        <div className="flex items-start gap-2">
                          <span
                            className={`p-1 rounded-md text-[10px] font-bold font-mono-code ${
                              m.tipo === 'ENTRADA'
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                                : 'bg-red-950 text-red-400 border border-red-800'
                            }`}
                          >
                            {m.tipo === 'ENTRADA' ? '+ENT' : '-SAL'}
                          </span>
                          <div>
                            <span className="font-mono-code font-bold text-white">
                              Talla {m.talla}: {m.cantidad} u.
                            </span>
                            {m.nota && (
                              <p className="text-[11px] text-neutral-400 mt-0.5">{m.nota}</p>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] text-neutral-500 font-mono-code whitespace-nowrap">
                          {m.fecha}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="py-6 text-center text-xs text-neutral-500 font-mono-code">
                      Sin movimientos todavía para esta referencia.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: Nueva Referencia */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-rose-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="font-serif-luxury text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-rose-400" />
                Nueva Referencia de Bodega
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-neutral-400 hover:text-white font-mono-code text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateReference} className="space-y-4">
              <div>
                <label className="text-xs text-neutral-300 font-mono-code block mb-1">
                  Código de Referencia (ej. 51-22, 90-05)
                </label>
                <input
                  type="text"
                  value={newCodigo}
                  onChange={(e) => setNewCodigo(e.target.value)}
                  placeholder="Código único"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="text-xs text-neutral-300 font-mono-code block mb-1">
                  Descripción (ej. Jean casual, Blusa seda)
                </label>
                <input
                  type="text"
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  placeholder="Detalle de la prenda o artículo"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <p className="text-[11px] text-neutral-400">
                Se crearán automáticamente las tallas estándar ({tallas.join(', ')}) con stock inicial en 0.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingNew}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs shadow-lg shadow-rose-600/30 disabled:opacity-50"
                >
                  {isSubmittingNew ? 'Creando...' : 'Crear Referencia'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Registrar Movimiento (Entrada / Salida) */}
      {showMoveModal && selectedRef && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-rose-500/30 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-mono-code text-rose-300">
                  {selectedRef.referencia.codigo}
                </span>
                <h3 className="font-serif-luxury text-lg font-bold text-white">
                  Registrar Movimiento de Inventario
                </h3>
              </div>
              <button
                onClick={() => setShowMoveModal(false)}
                className="text-neutral-400 hover:text-white font-mono-code text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitMovement} className="space-y-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMoveTipo('ENTRADA')}
                  className={`py-2.5 rounded-xl text-xs font-bold font-mono-code flex items-center justify-center gap-2 border transition-all ${
                    moveTipo === 'ENTRADA'
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-600/30'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  ENTRADA (Ingreso)
                </button>

                <button
                  type="button"
                  onClick={() => setMoveTipo('SALIDA')}
                  className={`py-2.5 rounded-xl text-xs font-bold font-mono-code flex items-center justify-center gap-2 border transition-all ${
                    moveTipo === 'SALIDA'
                      ? 'bg-rose-600 border-rose-400 text-white shadow-lg shadow-rose-600/30'
                      : 'bg-neutral-900 border-neutral-800 text-neutral-400'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  SALIDA (Despacho)
                </button>
              </div>

              {/* Quantities per Size */}
              <div>
                <label className="text-xs text-neutral-300 font-mono-code block mb-2">
                  Cantidades a registrar por cada talla:
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {tallas.map((t) => {
                    const currentStock = selectedRef.referencia.stock[t] || 0;
                    return (
                      <div key={t} className="p-2 rounded-xl bg-neutral-900 border border-neutral-800 text-center">
                        <span className="text-[10px] text-neutral-400 block font-mono-code">
                          Talla {t}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-mono-code block mb-1">
                          (disp: {currentStock})
                        </span>
                        <input
                          type="number"
                          min="0"
                          max={moveTipo === 'SALIDA' ? currentStock : undefined}
                          value={moveCantidades[t] || ''}
                          onChange={(e) =>
                            setMoveCantidades({ ...moveCantidades, [t]: e.target.value })
                          }
                          placeholder="0"
                          className="w-full text-center py-1 rounded bg-neutral-950 border border-neutral-700 text-sm font-mono-code text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Note / Observation */}
              <div>
                <label className="text-xs text-neutral-300 font-mono-code block mb-1">
                  Nota u observación (ej. Lote para tienda norte, Confección taller)
                </label>
                <input
                  type="text"
                  value={moveNota}
                  onChange={(e) => setMoveNota(e.target.value)}
                  placeholder="Motivo o destino del movimiento"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-900 border border-neutral-700 text-sm text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowMoveModal(false)}
                  className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white text-xs"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingMove}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-lg transition-all ${
                    moveTipo === 'ENTRADA'
                      ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/30'
                      : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30'
                  }`}
                >
                  {isSubmittingMove
                    ? 'Procesando...'
                    : `Confirmar ${moveTipo === 'ENTRADA' ? 'Entrada' : 'Salida'}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
