<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h5 q-mb-md">
          {{ isEdit ? 'Edit Purchase Invoice' : 'New Purchase Invoice' }}
        </div>

        <q-form @submit="onSubmit" class="q-gutter-md">
          <!-- Header Section -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Header Details</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="formData.invoiceNumber"
                    label="Invoice Number *"
                    outlined
                    dense
                    :rules="[(val: string) => !!val || 'Invoice number is required']"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="formData.invoiceDate"
                    label="Invoice Date *"
                    type="date"
                    outlined
                    dense
                    :rules="[(val: string | undefined) => !!val || 'Date is required']"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model.number="formData.companyId"
                    label="Company ID *"
                    type="number"
                    outlined
                    dense
                    :rules="[(val: number) => !!val || 'Company ID is required']"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model.number="formData.branchId"
                    label="Branch ID *"
                    type="number"
                    outlined
                    dense
                    :rules="[(val: number) => !!val || 'Branch ID is required']"
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="formData.vendorName" label="Vendor Name" outlined dense />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="formData.vendorReference"
                    label="Vendor Reference"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="formData.billNumber" label="Bill Number" outlined dense />
                </div>
                <div class="col-12 col-md-3">
                  <q-input
                    v-model="formData.billDate"
                    label="Bill Date"
                    type="date"
                    outlined
                    dense
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="formData.invoiceType"
                    :options="invoiceTypeOptions"
                    label="Invoice Type"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-select
                    v-model="formData.taxNature"
                    :options="taxNatureOptions"
                    label="Tax Nature"
                    outlined
                    dense
                    emit-value
                    map-options
                  />
                </div>
                <div class="col-12 col-md-3">
                  <q-input v-model="formData.dueDate" label="Due Date" type="date" outlined dense />
                </div>
                <div class="col-12 col-md-3">
                  <q-checkbox v-model="formData.taxInclusive" label="Tax Inclusive" />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <!-- Items Section -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="row items-center justify-between q-mb-md">
                <div class="text-h6">Items</div>
                <q-btn color="primary" icon="add" label="Add Item" size="sm" @click="addItem" />
              </div>

              <q-table
                :rows="formData.items || []"
                :columns="itemColumns"
                row-key="srNo"
                flat
                bordered
                :pagination="{ rowsPerPage: 0 }"
                hide-bottom
              >
                <template v-slot:body-cell-srNo="props">
                  <q-td :props="props">
                    {{ props.row.srNo || props.rowIndex + 1 }}
                  </q-td>
                </template>

                <template v-slot:body-cell-productName="props">
                  <q-td :props="props">
                    <q-input
                      v-model="props.row.productName"
                      dense
                      borderless
                      @update:model-value="calculateItemTotal(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-quantity="props">
                  <q-td :props="props">
                    <q-input
                      v-model.number="props.row.quantity"
                      type="number"
                      dense
                      borderless
                      step="0.001"
                      @update:model-value="calculateItemTotal(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-uom="props">
                  <q-td :props="props">
                    <q-input v-model="props.row.uom" dense borderless placeholder="pcs" />
                  </q-td>
                </template>

                <template v-slot:body-cell-price="props">
                  <q-td :props="props">
                    <q-input
                      v-model.number="props.row.price"
                      type="number"
                      dense
                      borderless
                      step="0.01"
                      @update:model-value="calculateItemTotal(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-discountPercentage="props">
                  <q-td :props="props">
                    <q-input
                      v-model.number="props.row.discountPercentage"
                      type="number"
                      dense
                      borderless
                      step="0.01"
                      min="0"
                      max="100"
                      @update:model-value="calculateItemTotal(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-taxAmount="props">
                  <q-td :props="props">
                    <q-input
                      v-model.number="props.row.taxAmount"
                      type="number"
                      dense
                      borderless
                      step="0.01"
                      @update:model-value="calculateItemTotal(props.rowIndex)"
                    />
                  </q-td>
                </template>

                <template v-slot:body-cell-netTotal="props">
                  <q-td :props="props">
                    {{ formatCurrency(props.row.netTotal || 0) }}
                  </q-td>
                </template>

                <template v-slot:body-cell-actions="props">
                  <q-td :props="props">
                    <q-btn
                      flat
                      dense
                      round
                      icon="delete"
                      color="negative"
                      size="sm"
                      @click="removeItem(props.rowIndex)"
                    />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
          </q-card>

          <!-- Footer Section -->
          <q-card flat bordered class="q-mb-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Financial Summary</div>
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <div class="row q-mb-sm">
                    <div class="col-6 text-weight-medium">Subtotal:</div>
                    <div class="col-6 text-right">{{ formatCurrency(totals.subtotal) }}</div>
                  </div>
                  <div class="row q-mb-sm">
                    <div class="col-6 text-weight-medium">Discount:</div>
                    <div class="col-6 text-right">{{ formatCurrency(totals.discount) }}</div>
                  </div>
                  <div class="row q-mb-sm">
                    <div class="col-6 text-weight-medium">Tax:</div>
                    <div class="col-6 text-right">{{ formatCurrency(totals.tax) }}</div>
                  </div>
                  <q-separator class="q-my-sm" />
                  <div class="row">
                    <div class="col-6 text-weight-bold text-h6">Total:</div>
                    <div class="col-6 text-right text-weight-bold text-h6">
                      {{ formatCurrency(totals.total) }}
                    </div>
                  </div>
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="formData.narration"
                    label="Narration"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                  />
                  <q-input
                    v-model="formData.termsConditions"
                    label="Terms & Conditions"
                    type="textarea"
                    outlined
                    dense
                    rows="3"
                    class="q-mt-sm"
                  />
                </div>
              </div>
            </q-card-section>
          </q-card>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Cancel" color="grey" flat @click="router.back()" />
            <q-btn
              :label="isEdit ? 'Update' : 'Create'"
              color="primary"
              type="submit"
              :loading="isLoading"
              :disable="!hasItems"
            >
              <q-tooltip v-if="!hasItems">At least one item is required</q-tooltip>
            </q-btn>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  PurchaseInvoiceService,
  type CreatePurchaseInvoiceDto,
  type UpdatePurchaseInvoiceDto,
  type PurchaseInvoiceItem,
} from 'src/services/purchase-invoice.service';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const isEdit = computed(() => !!route.params.id);
const isLoading = ref(false);

const invoiceTypeOptions = [
  { label: 'Regular', value: 'Regular' },
  { label: 'Credit', value: 'Credit' },
  { label: 'Cash', value: 'Cash' },
];

const taxNatureOptions = [
  { label: 'GST', value: 'GST' },
  { label: 'RCM', value: 'RCM' },
  { label: 'Exempt', value: 'Exempt' },
];

const itemColumns = [
  { name: 'srNo', label: 'Sr No', field: 'srNo', align: 'center' as const },
  { name: 'productName', label: 'Product Name', field: 'productName', align: 'left' as const },
  { name: 'hsn', label: 'HSN', field: 'hsn', align: 'left' as const },
  { name: 'quantity', label: 'Quantity', field: 'quantity', align: 'right' as const },
  { name: 'uom', label: 'UOM', field: 'uom', align: 'center' as const },
  { name: 'price', label: 'Price', field: 'price', align: 'right' as const },
  {
    name: 'discountPercentage',
    label: 'Disc %',
    field: 'discountPercentage',
    align: 'right' as const,
  },
  { name: 'taxAmount', label: 'Tax', field: 'taxAmount', align: 'right' as const },
  { name: 'netTotal', label: 'Net Total', field: 'netTotal', align: 'right' as const },
  { name: 'actions', label: 'Actions', field: 'actions', align: 'center' as const },
];

const formData = ref<CreatePurchaseInvoiceDto>({
  invoiceNumber: '',
  companyId: 1,
  branchId: 1,
  invoiceDate: new Date().toISOString().split('T')[0] || '',
  vendorName: '',
  vendorReference: '',
  billNumber: '',
  billDate: '',
  invoiceType: 'Regular',
  taxNature: 'GST',
  dueDate: '',
  narration: '',
  termsConditions: '',
  subtotal: 0,
  discountAmount: 0,
  taxAmount: 0,
  totalAmount: 0,
  taxInclusive: false,
  items: [],
});

const hasItems = computed(() => {
  return (formData.value.items?.length || 0) > 0;
});

const totals = computed(() => {
  const items = formData.value.items || [];
  let subtotal = 0;
  let discount = 0;
  let tax = 0;

  items.forEach((item) => {
    const itemTotal = (item.quantity || 0) * (item.price || 0);
    const itemDiscount = item.discountAmount || (itemTotal * (item.discountPercentage || 0)) / 100;
    const itemSubtotal = itemTotal - itemDiscount;
    const itemTax = item.taxAmount || 0;

    subtotal += itemSubtotal;
    discount += itemDiscount;
    tax += itemTax;
  });

  const total = subtotal + tax;

  return {
    subtotal,
    discount,
    tax,
    total,
  };
});

function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount || 0;
  return `₹${num.toFixed(2)}`;
}

function addItem() {
  if (!formData.value.items) {
    formData.value.items = [];
  }
  const newItem: PurchaseInvoiceItem = {
    productName: '',
    productCode: '',
    description: '',
    hsn: '',
    quantity: 1,
    uom: 'pcs',
    price: 0,
    total: 0,
    discountAmount: 0,
    discountPercentage: 0,
    taxAmount: 0,
    netTotal: 0,
    srNo: (formData.value.items.length || 0) + 1,
  };
  formData.value.items.push(newItem);
}

function removeItem(index: number) {
  if (formData.value.items) {
    formData.value.items.splice(index, 1);
    // Recalculate totals
    calculateAllTotals();
  }
}

function calculateItemTotal(index: number) {
  const item = formData.value.items?.[index];
  if (!item) return;

  const quantity = item.quantity || 0;
  const price = item.price || 0;
  // Ensure discount percentage is between 0-100
  let discountPercentage = item.discountPercentage || 0;
  if (discountPercentage > 100) {
    discountPercentage = 100;
    item.discountPercentage = 100;
  }
  if (discountPercentage < 0) {
    discountPercentage = 0;
    item.discountPercentage = 0;
  }

  // Calculate totals
  item.total = quantity * price;
  item.discountAmount = (item.total * discountPercentage) / 100;
  const subtotal = item.total - item.discountAmount;
  const tax = item.taxAmount || 0;
  item.netTotal = subtotal + tax;

  // Update invoice totals
  calculateAllTotals();
}

function calculateAllTotals() {
  const calculated = totals.value;
  formData.value.subtotal = calculated.subtotal;
  formData.value.discountAmount = calculated.discount;
  formData.value.taxAmount = calculated.tax;
  formData.value.totalAmount = calculated.total;
}

async function loadInvoice() {
  if (!isEdit.value) return;

  isLoading.value = true;
  try {
    const invoice = await PurchaseInvoiceService.getById(Number(route.params.id));
    const defaultDate: string = new Date().toISOString().split('T')[0] || '';
    const invoiceDateValue: string =
      invoice.invoiceDate &&
      typeof invoice.invoiceDate === 'string' &&
      invoice.invoiceDate.length > 0
        ? invoice.invoiceDate
        : defaultDate;

    formData.value = {
      invoiceNumber: invoice.invoiceNumber,
      companyId: invoice.companyId,
      branchId: invoice.branchId,
      invoiceDate: invoiceDateValue,
      vendorName: invoice.vendorName || '',
      vendorReference: invoice.vendorReference || '',
      billNumber: invoice.billNumber || '',
      billDate: invoice.billDate || '',
      invoiceType: invoice.invoiceType || 'Regular',
      taxNature: invoice.taxNature || 'GST',
      dueDate: invoice.dueDate || '',
      narration: invoice.narration || '',
      termsConditions: invoice.termsConditions || '',
      subtotal: invoice.subtotal ? Number(invoice.subtotal) : 0,
      discountAmount: invoice.discountAmount ? Number(invoice.discountAmount) : 0,
      taxAmount: invoice.taxAmount ? Number(invoice.taxAmount) : 0,
      totalAmount: invoice.totalAmount ? Number(invoice.totalAmount) : 0,
      taxInclusive: invoice.taxInclusive || false,
      items:
        invoice.items?.map((item, index) => ({
          ...item,
          srNo: item.srNo || index + 1,
        })) || [],
    };
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Failed to load invoice',
    });
  } finally {
    isLoading.value = false;
  }
}

async function onSubmit() {
  if (!hasItems.value) {
    $q.notify({
      type: 'warning',
      message: 'Please add at least one item',
    });
    return;
  }

  isLoading.value = true;
  try {
    // Calculate final totals before submit
    calculateAllTotals();

    // Update item srNo
    if (formData.value.items) {
      formData.value.items.forEach((item, index) => {
        item.srNo = index + 1;
      });
    }

    if (isEdit.value) {
      const updateData: UpdatePurchaseInvoiceDto = {
        ...formData.value,
      };
      await PurchaseInvoiceService.update(Number(route.params.id), updateData);
      $q.notify({
        type: 'positive',
        message: 'Invoice updated successfully',
      });
    } else {
      await PurchaseInvoiceService.create(formData.value);
      $q.notify({
        type: 'positive',
        message: 'Invoice created successfully',
      });
    }
    void router.push('/purchase-invoice');
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: isEdit.value ? 'Failed to update invoice' : 'Failed to create invoice',
    });
  } finally {
    isLoading.value = false;
  }
}

onMounted(() => {
  void loadInvoice();
});
</script>

<script lang="ts">
export default {
  name: 'PIAddEditPage',
};
</script>

<style scoped>
.q-table {
  font-size: 0.875rem;
}
</style>
