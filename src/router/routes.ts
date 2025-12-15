import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/IndexPage.vue') },
      {
        path: 'purchase-invoice',
        component: () => import('pages/PurchaseInvoice/PIListPage.vue'),
      },
      {
        path: 'purchase-invoice/new',
        component: () => import('pages/PurchaseInvoice/PIAddEditPage.vue'),
      },
      {
        path: 'purchase-invoice/:id',
        component: () => import('pages/PurchaseInvoice/PIAddEditPage.vue'),
      },
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
