<script setup lang="ts">
import DefaultTheme from 'vitepress/theme'
import { useEventListener, customStorageEventName } from '@vueuse/core'
import SidebarCard from './components/SidebarCard.vue'
import AnnouncementPill from './components/AnnouncementPill.vue'
import NotFoundComponent from './components/NotFound.vue'
import {
  NolebaseEnhancedReadabilitiesMenu,
  NolebaseEnhancedReadabilitiesScreenMenu
} from '@nolebase/vitepress-plugin-enhanced-readabilities/client'
import { usePreferredReducedMotion } from '@vueuse/core'
import { ref, onMounted, onUnmounted } from 'vue'
import { type Vec2D, v2add, v2mag, v2norm, v2smul, v2sub } from './math'


const { Layout } = DefaultTheme
</script>

<script lang="ts">
export default {
  mounted() {
    const tables = document.querySelectorAll('table'); // Select all tables
    tables.forEach((table) => {
      const headers = Array.from(table.querySelectorAll('thead th')); // Get headers
      table.querySelectorAll('tbody tr').forEach((row) => {
        Array.from(row.children).forEach((cell, index) => {
          cell.setAttribute('data-label', headers[index]?.textContent.trim());
        });
      });
    });
  },
};
</script>

<template>
  <Layout>
    <template #not-found>
      <NotFoundComponent />
    </template>
    <template #sidebar-nav-after>
      <SidebarCard />
    </template>
    <template #home-hero-info-before>
      <AnnouncementPill />
    </template>
    <template #nav-bar-content-after>
      <NolebaseEnhancedReadabilitiesMenu />
    </template>
    <template #nav-bar-screen-content-after>
      <NolebaseEnhancedReadabilitiesScreenMenu />
    </template>
  </Layout>
</template>
