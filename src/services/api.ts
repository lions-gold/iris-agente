import {
  Referencia,
  ReferenciaDetalle,
  SystemHealth,
  DevOpsAssets,
  NeuralMemory,
} from '../types';

export const api = {
  async getHealth(): Promise<SystemHealth> {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error('Error al conectar con el núcleo de Iris');
    return res.json();
  },

  async getReferencias(): Promise<{ referencias: Referencia[]; tallas: number[] }> {
    const res = await fetch('/api/inventory/referencias');
    if (!res.ok) throw new Error('Error al obtener referencias');
    return res.json();
  },

  async getReferenciaDetalle(id: number): Promise<ReferenciaDetalle> {
    const res = await fetch(`/api/inventory/referencias/${id}`);
    if (!res.ok) throw new Error('Error al obtener detalles de la referencia');
    return res.json();
  },

  async createReferencia(
    codigo: string,
    descripcion: string
  ): Promise<{ message: string; referencia: any }> {
    const res = await fetch('/api/inventory/referencias', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, descripcion }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al crear referencia');
    return data;
  },

  async recordMovimiento(
    id: number,
    tipo: 'ENTRADA' | 'SALIDA',
    cantidades: Record<number, number>,
    nota: string
  ): Promise<{ message: string; changesCount: number; warnings: string[]; updatedTotal: number }> {
    const res = await fetch(`/api/inventory/referencias/${id}/mover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tipo, nota, cantidades }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || (data.warnings && data.warnings.join(', ')) || 'Error al registrar movimiento');
    return data;
  },

  async deleteReferencia(id: number): Promise<{ message: string }> {
    const res = await fetch(`/api/inventory/referencias/${id}`, {
      method: 'DELETE',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al eliminar referencia');
    return data;
  },

  async sendIrisChat(
    prompt: string,
    history: any[] = []
  ): Promise<{
    reply: string;
    reflection: string;
    mood: string;
    creator: string;
    synapseCount: number;
  }> {
    const res = await fetch('/api/iris/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, history }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error en comunicación con Iris');
    return data;
  },

  async sparkSynapse(): Promise<{ thought: string }> {
    const res = await fetch('/api/iris/synapse/spark', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Error al encender sinapsis');
    return data;
  },

  async getMemories(): Promise<{ memories: NeuralMemory[] }> {
    const res = await fetch('/api/iris/memories');
    if (!res.ok) throw new Error('Error al cargar memorias de Iris');
    return res.json();
  },

  async getDevOpsConfigs(): Promise<DevOpsAssets> {
    const res = await fetch('/api/system/devops-configs');
    if (!res.ok) throw new Error('Error al cargar configuraciones DevOps');
    return res.json();
  },
};
