<template>
  <q-page class="q-pa-md">
    <q-card>
      <q-card-section>
        <div class="text-h4 q-mb-md">pgvector Semantic Search Demo</div>
        <div class="text-body1 q-mb-lg">
          This is a demonstration of semantic search using pgvector and Gemini embeddings for Purchase Invoices.
        </div>
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
