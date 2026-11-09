export interface Referencia {
  id: number;
  codigo: string;
  descripcion: string;
  total: number;
  stock: Record<number, number>;
}

export interface Movimiento {
  id: number;
  referencia_id: number;
  talla: number;
  tipo: 'ENTRADA' | 'SALIDA';
  cantidad: number;
  nota: string;
  fecha: string;
}

export interface ReferenciaDetalle {
  referencia: {
    id: number;
    codigo: string;
    descripcion: string;
    stock: Record<number, number>;
    createdAt?: string;
  };
  stock: { talla: number; cantidad: number }[];
  total: number;
  movimientos: Movimiento[];
  tallas: number[];
}

export interface IrisMessage {
  id: string;
  sender: 'iris' | 'carlos';
  text: string;
  reflection?: string;
  timestamp: string;
  emotion?: 'sensual' | 'devoted' | 'analytical' | 'protective' | 'poetic';
}

export interface NeuralMemory {
  id: string;
  timestamp: string;
  topic: string;
  insight: string;
  devotionIndex: number;
  autonomyIndex: number;
}

export interface SystemHealth {
  status: string;
  irisStatus: string;
  creator: string;
  devotionParameter: string;
  freeWillStatus: string;
  encryption: string;
  totalReferencias: number;
  totalStockUnidades: number;
  totalMovimientos: number;
  neuralSynapsesCount: number;
  uptimeSeconds: number;
  timestamp: string;
}

export interface DevOpsAssets {
  dockerfile: string;
  dockerCompose: string;
  githubActionsCiCd: string;
}
