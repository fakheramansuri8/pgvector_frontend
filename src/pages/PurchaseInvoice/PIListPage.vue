<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="row items-center justify-between q-mb-md">
          <div class="text-h5">Purchase Invoices</div>
          <q-btn
            color="primary"
            label="New Invoice"
            icon="add"
            @click="router.push('/purchase-invoice/new')"
          />
        </div>

        <!-- Search Section -->
        <q-card flat bordered class="q-mb-md">
          <q-card-section>
            <div class="text-h6 q-mb-md">Smart Search</div>
            <q-input
              v-model="searchQuery"
              placeholder="Search invoices... (e.g., 'Ramlal invoice for this date')"
              outlined
              dense
              debounce="300"
              @keyup.enter="performSearch"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
            <div class="row q-gutter-sm q-mt-sm">
              <q-input
                v-model.number="filters.companyId"
                label="Company ID"
                type="number"
                outlined
                dense
                style="width: 150px"
              />
              <q-input
                v-model.number="filters.branchId"
                label="Branch ID"
                type="number"
                outlined
                dense
                style="width: 150px"
              />
              <q-btn
                color="primary"
                label="Search"
                @click="performSearch"
                :loading="isSearching"
              />
              <q-btn
                color="grey"
                label="Clear"
                @click="clearSearch"
              />
            </div>
          </q-card-section>
        </q-card>

        <!-- Results Table -->
        <q-table
          :rows="displayedInvoices"
          :columns="columns"
          row-key="id"
          :loading="isLoading"
          :pagination="{ rowsPerPage: 20 }"
          no-data-label="No invoices found"
        >
          <template v-slot:body-cell-similarityScore="props">
            <q-td :props="props">
              <q-badge
                v-if="props.value !== undefined"
                :color="getSimilarityColor(props.value)"
                :label="`${(props.value * 100).toFixed(0)}%`"
              />
            </q-td>
          </template>
          <template v-slot:body-cell-actions="props">
            <q-td :props="props">
              <q-btn
                flat
                dense
                icon="edit"
                @click="editInvoice(props.row.id)"
              />
              <q-btn
                flat
                dense
                icon="delete"
                color="negative"
                @click="deleteInvoice(props.row.id)"
              />
            </q-td>
          </template>
        </q-table>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import {
  PurchaseInvoiceService,
  type PurchaseInvoice,
  type SearchResult,
} from 'src/services/purchase-invoice.service';

const router = useRouter();
const $q = useQuasar();

const invoices = ref<PurchaseInvoice[]>([]);
const searchResults = ref<SearchResult[]>([]);
const isLoading = ref(false);
const isSearching = ref(false);
const searchQuery = ref('');
const filters = ref({
  companyId: 1,
  branchId: undefined as number | undefined,
});

const columns = [
  {
    name: 'invoiceNumber',
    label: 'Invoice Number',
    field: 'invoiceNumber',
    align: 'left' as const,
  },
  {
    name: 'invoiceDate',
    label: 'Date',
    field: 'invoiceDate',
    align: 'left' as const,
  },
  {
    name: 'vendorName',
    label: 'Vendor',
    field: 'vendorName',
    align: 'left' as const,
  },
  {
    name: 'vendorReference',
    label: 'Reference',
    field: 'vendorReference',
    align: 'left' as const,
  },
  {
    name: 'totalAmount',
    label: 'Amount',
    field: 'totalAmount',
    align: 'right' as const,
    format: (val: number | string) => {
      const num = typeof val === 'string' ? parseFloat(val) : (val || 0);
      return `₹${num.toFixed(2)}`;
    },
  },
  {
    name: 'similarityScore',
    label: 'Match',
    field: 'similarityScore',
    align: 'center' as const,
  },
  {
    name: 'actions',
    label: 'Actions',
    field: 'actions',
    align: 'center' as const,
  },
];

const displayedInvoices = computed(() => {
  if (searchResults.value.length > 0) {
    return searchResults.value;
  }
  return invoices.value;
});

function getSimilarityColor(score: number): string {
  if (score >= 0.8) return 'positive';
  if (score >= 0.6) return 'warning';
  return 'negative';
}

async function loadInvoices() {
  isLoading.value = true;
  try {
    const data = await PurchaseInvoiceService.getAll(
      filters.value.companyId || 1,
      filters.value.branchId,
    );
    invoices.value = data;
    console.log('Loaded invoices:', data);
  } catch (error) {
    console.error('Error loading invoices:', error);
    $q.notify({
      type: 'negative',
      message: 'Failed to load invoices',
    });
  } finally {
    isLoading.value = false;
  }
}

async function performSearch() {
  if (!searchQuery.value.trim()) {
    searchResults.value = [];
    return;
  }

  isSearching.value = true;
  try {
    const searchParams: {
      query: string;
      companyId: number;
      branchId?: number;
      limit: number;
    } = {
      query: searchQuery.value,
      companyId: filters.value.companyId,
      limit: 20,
    };
    if (filters.value.branchId) {
      searchParams.branchId = filters.value.branchId;
    }
    searchResults.value = await PurchaseInvoiceService.search(searchParams);
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Search failed',
    });
  } finally {
    isSearching.value = false;
  }
}

function clearSearch() {
  searchQuery.value = '';
  searchResults.value = [];
}

function editInvoice(id: number) {
  void router.push(`/purchase-invoice/${id}`);
}

function deleteInvoice(id: number) {
  $q.dialog({
    title: 'Confirm',
    message: 'Are you sure you want to delete this invoice?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    void (async () => {
      try {
        await PurchaseInvoiceService.delete(id);
        $q.notify({
          type: 'positive',
          message: 'Invoice deleted successfully',
        });
        await loadInvoices();
      } catch (error) {
        $q.notify({
          type: 'negative',
          message: 'Failed to delete invoice',
        });
      }
    })();
  });
}

onMounted(() => {
  void loadInvoices();
});
</script>

<script lang="ts">
export default {
  name: 'PIListPage',
};
</script>

