<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-body1 q-mb-lg">Semantic search using pgvector</div>
        <q-btn
          color="primary"
          size="lg"
          label="Go to Purchase Invoices"
          icon="receipt"
          @click="router.push('/purchase-invoice')"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();
</script>
