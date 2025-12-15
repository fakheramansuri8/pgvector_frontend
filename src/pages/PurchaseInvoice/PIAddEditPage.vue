<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h5 q-mb-md">
          {{ isEdit ? 'Edit Purchase Invoice' : 'New Purchase Invoice' }}
        </div>

        <q-form @submit="onSubmit" class="q-gutter-md">
          <div class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.invoiceNumber"
                label="Invoice Number *"
                outlined
                :rules="[(val: string) => !!val || 'Invoice number is required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model="formData.invoiceDate"
                label="Invoice Date *"
                type="date"
                outlined
                :rules="[(val: string | undefined) => !!val || 'Date is required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.companyId"
                label="Company ID *"
                type="number"
                outlined
                :rules="[(val: number) => !!val || 'Company ID is required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.branchId"
                label="Branch ID *"
                type="number"
                outlined
                :rules="[(val: number) => !!val || 'Branch ID is required']"
              />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="formData.vendorName" label="Vendor Name" outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="formData.vendorReference" label="Vendor Reference" outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input v-model="formData.billNumber" label="Bill Number" outlined />
            </div>
            <div class="col-12 col-md-6">
              <q-input
                v-model.number="formData.totalAmount"
                label="Total Amount"
                type="number"
                outlined
                step="0.01"
              />
            </div>
            <div class="col-12">
              <q-input
                v-model="formData.narration"
                label="Narration"
                type="textarea"
                outlined
                rows="3"
              />
            </div>
          </div>

          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn label="Cancel" color="grey" flat @click="router.back()" />
            <q-btn
              :label="isEdit ? 'Update' : 'Create'"
              color="primary"
              type="submit"
              :loading="isLoading"
            />
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
} from 'src/services/purchase-invoice.service';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();

const isEdit = computed(() => !!route.params.id);
const isLoading = ref(false);

const formData = ref<CreatePurchaseInvoiceDto>({
  invoiceNumber: '',
  companyId: 1,
  branchId: 1,
  invoiceDate: new Date().toISOString().split('T')[0] || '',
  vendorName: '',
  vendorReference: '',
  billNumber: '',
  narration: '',
  totalAmount: 0,
});

async function loadInvoice() {
  if (!isEdit.value) return;

  isLoading.value = true;
  try {
    const invoice = await PurchaseInvoiceService.getById(Number(route.params.id));
    const defaultDate = new Date().toISOString().split('T')[0];
    const invoiceDateValue: string =
      invoice.invoiceDate && invoice.invoiceDate.length > 0 ? invoice.invoiceDate : defaultDate;
    formData.value = {
      invoiceNumber: invoice.invoiceNumber,
      companyId: invoice.companyId,
      branchId: invoice.branchId,
      invoiceDate: invoiceDateValue,
      vendorName: invoice.vendorName || '',
      vendorReference: invoice.vendorReference || '',
      billNumber: invoice.billNumber || '',
      narration: invoice.narration || '',
      totalAmount: invoice.totalAmount ? Number(invoice.totalAmount) : 0,
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
  isLoading.value = true;
  try {
    if (isEdit.value) {
      const updateData: UpdatePurchaseInvoiceDto = {
        invoiceNumber: formData.value.invoiceNumber,
        invoiceDate: formData.value.invoiceDate,
        ...(formData.value.vendorName && { vendorName: formData.value.vendorName }),
        ...(formData.value.vendorReference && { vendorReference: formData.value.vendorReference }),
        ...(formData.value.billNumber && { billNumber: formData.value.billNumber }),
        ...(formData.value.narration && { narration: formData.value.narration }),
        ...(formData.value.totalAmount !== undefined && {
          totalAmount: formData.value.totalAmount,
        }),
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
