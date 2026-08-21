<script setup lang="ts">
interface LogResponse {
  success: boolean;
  date: string;
  totalLines: number;
  lines: string[];
}

useSeoMeta({
  title: "System Logs",
});

const { $userApi } = useNuxtApp();
const searchQuery = ref("");
const logContainer = ref<HTMLElement | null>(null);

// Tải dữ liệu log từ Server API
const { data: logData, pending, refresh } = await useAsyncData(() => $userApi<LogResponse>("/api/audit/logs"));

// Lọc các dòng log theo từ khóa tìm kiếm
const filteredLines = computed(() => {
  if (!logData.value?.lines) return [];
  if (!searchQuery.value.trim()) return logData.value.lines;

  const query = searchQuery.value.toLowerCase();
  return logData.value.lines.filter((line) => line.toLowerCase().includes(query));
});

// Tự động cuộn xuống cuối file log
function scrollToBottom() {
  nextTick(() => {
    if (logContainer.value) {
      logContainer.value.scrollTop = logContainer.value.scrollHeight;
    }
  });
}

// Gọi cuộn xuống cuối mỗi khi dữ liệu được tải thành công
watch(
  () => logData.value,
  () => scrollToBottom(),
  { immediate: true },
);

// Helper tô màu các ký tự Level trong log
function getLineColor(line: string) {
  if (line.includes("[ERROR]") || line.includes("Error:")) return "text-red-400 font-semibold";
  if (line.includes("[WARN]")) return "text-yellow-400";
  if (line.includes("[INFO]")) return "text-blue-400";
  return "text-emerald-400";
}
</script>

<template>
  <UCard :ui="{ root: 'h-full', body: 'overflow-hidden flex flex-col h-full' }">
    <!-- Header Controls -->
    <div class="flex items-center justify-between pb-4 border-b border-gray-200 dark:border-gray-800">
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-terminal" class="w-5 h-5 text-emerald-500" />
        <h3 class="font-mono font-bold text-base">System Logs ({{ logData?.date }})</h3>
        <UBadge color="neutral" variant="subtle" size="xs"> {{ filteredLines.length }}/{{ logData?.totalLines || 0 }} lines </UBadge>
      </div>

      <div class="flex items-center gap-2">
        <!-- Ô tìm kiếm log -->
        <UInput v-model="searchQuery" icon="i-lucide-search" placeholder="Filter logs..." size="xs" class="w-48" />

        <!-- Nút Refresh -->
        <UButton icon="i-lucide-refresh-cw" color="neutral" variant="ghost" size="xs" :loading="pending" @click="() => refresh()" />

        <!-- Nút cuộn xuống dưới -->
        <UButton icon="i-lucide-arrow-down" color="neutral" variant="ghost" size="xs" @click="scrollToBottom" />
      </div>
    </div>

    <!-- Terminal Container -->
    <div ref="logContainer" class="flex-1 bg-gray-950 p-4 font-mono text-xs leading-relaxed overflow-y-auto selection:bg-gray-800">
      <!-- Skeleton Loading -->
      <div v-if="pending && !logData" class="space-y-2">
        <USkeleton class="h-4 w-3/4 bg-gray-800" />
        <USkeleton class="h-4 w-1/2 bg-gray-800" />
        <USkeleton class="h-4 w-5/6 bg-gray-800" />
      </div>

      <!-- Khung hiển thị Log -->
      <div v-else-if="filteredLines.length > 0" class="space-y-1">
        <div v-for="(line, index) in filteredLines" :key="index" class="flex items-start hover:bg-gray-900/60 rounded px-1 -mx-1 group transition-colors">
          <!-- Số dòng -->
          <span class="text-gray-600 select-none w-12 shrink-0 text-right pr-4 group-hover:text-gray-400">
            {{ index + 1 }}
          </span>

          <!-- Nội dung dòng log -->
          <span class="break-all whitespace-pre-wrap" :class="getLineColor(line)">
            {{ line }}
          </span>
        </div>
      </div>

      <!-- Trạng thái trống -->
      <div v-else class="flex flex-col items-center justify-center py-12 text-gray-500">
        <UIcon name="i-lucide-file-x" class="w-8 h-8 mb-2" />
        <p v-if="searchQuery">Không tìm thấy dòng log nào khớp với từ khóa "{{ searchQuery }}"</p>
        <p v-else>Chưa có dữ liệu log cho ngày hôm nay.</p>
      </div>
    </div>
  </UCard>
</template>
