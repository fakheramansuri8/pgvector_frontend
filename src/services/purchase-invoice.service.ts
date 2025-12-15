import { api } from 'src/boot/axios';

export interface PurchaseInvoiceItem {
  id?: number;
  productName?: string;
  productCode?: string;
  description?: string;
  hsn?: string;
  quantity: number;
  uom?: string;
  price: number;
  total: number;
  discountAmount?: number;
  discountPercentage?: number;
  taxAmount?: number;
  netTotal: number;
  srNo?: number;
}

export interface PurchaseInvoice {
  id: number;
  invoiceNumber: string;
  companyId: number;
  branchId: number;
  vendorAccountId?: number | null;
  invoiceDate?: string;
  vendorName?: string | null;
  vendorReference?: string | null;
  billNumber?: string | null;
  billDate?: string | null;
  invoiceType?: string | null;
  taxNature?: string | null;
  dueDate?: string | null;
  narration?: string | null;
  termsConditions?: string | null;
  subtotal?: number | string;
  discountAmount?: number | string;
  taxAmount?: number | string;
  totalAmount?: number | string;
  taxInclusive?: boolean;
  items?: PurchaseInvoiceItem[];
  embedding?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreatePurchaseInvoiceDto {
  invoiceNumber: string;
  companyId: number;
  branchId: number;
  vendorAccountId?: number;
  invoiceDate: string;
  vendorName?: string;
  vendorReference?: string;
  billNumber?: string;
  billDate?: string;
  invoiceType?: string;
  taxNature?: string;
  dueDate?: string;
  narration?: string;
  termsConditions?: string;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  taxInclusive?: boolean;
  items?: PurchaseInvoiceItem[];
}

export interface UpdatePurchaseInvoiceDto {
  invoiceNumber?: string;
  vendorAccountId?: number;
  invoiceDate?: string;
  vendorName?: string;
  vendorReference?: string;
  billNumber?: string;
  billDate?: string;
  invoiceType?: string;
  taxNature?: string;
  dueDate?: string;
  narration?: string;
  termsConditions?: string;
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  totalAmount?: number;
  taxInclusive?: boolean;
  items?: PurchaseInvoiceItem[];
}

export interface SearchPurchaseInvoiceDto {
  query: string;
  companyId?: number;
  branchId?: number;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

export interface SearchResult extends PurchaseInvoice {
  similarityScore: number;
}

export class PurchaseInvoiceService {
  static async getAll(companyId: number, branchId?: number): Promise<PurchaseInvoice[]> {
    const params = new URLSearchParams();
    params.append('companyId', companyId.toString());
    if (branchId) {
      params.append('branchId', branchId.toString());
    }
    const response = await api.get(`/api/purchase-invoice?${params.toString()}`);
    const data = response.data;
    // Ensure we return an array
    if (Array.isArray(data)) {
      return data;
    }
    // If it's a single object, wrap it in an array
    if (data && typeof data === 'object') {
      return [data];
    }
    return [];
  }

  static async getById(id: number): Promise<PurchaseInvoice> {
    const response = await api.get(`/api/purchase-invoice/${id}`);
    return response.data;
  }

  static async create(data: CreatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    const response = await api.post('/api/purchase-invoice', data);
    return response.data;
  }

  static async update(id: number, data: UpdatePurchaseInvoiceDto): Promise<PurchaseInvoice> {
    const response = await api.put(`/api/purchase-invoice/${id}`, data);
    return response.data;
  }

  static async delete(id: number): Promise<void> {
    await api.delete(`/api/purchase-invoice/${id}`);
  }

  static async search(searchDto: SearchPurchaseInvoiceDto): Promise<SearchResult[]> {
    const response = await api.post('/api/purchase-invoice/search', searchDto);
    return response.data;
  }

  static async generateEmbedding(id: number): Promise<void> {
    await api.post(`/api/purchase-invoice/${id}/generate-embedding`);
  }
}
