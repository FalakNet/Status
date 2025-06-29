<!-- 站点数据卡片 -->
<template>
  <Transition name="fade" mode="out-in">
    <div v-if="!isEmpty(siteData)" class="site-cards">
      <n-card
        v-for="(site, index) in siteData"
        :key="index"
        :style="{ animationDelay: `${index * 0.1}s` }"
        class="site-item"
        hoverable
      >
        <!-- 信息 -->
        <n-flex class="meta" justify="space-between" :wrap="false">
          <n-flex :size="8" class="title" align="center" :wrap="false">
            <n-text class="site-name">{{ site.name }}</n-text>
            <n-popover>
              <template #trigger>
                <n-tag :bordered="false" size="small" round>
                  {{ siteTypeMap[site.type]?.tag || "HTTP" }} /
                  {{ formatInterval(site?.interval) }}
                </n-tag>
              </template>
              <n-text>
                Check if the site is running properly every {{ formatInterval(site?.interval) || "30s" }} for {{ siteTypeMap[site.type]?.text }}
              </n-text>
            </n-popover>
            <!-- 跳转 -->
            <n-button
              v-if="site?.url"
              :focusable="false"
              size="tiny"
              tertiary
              round
              @click="jumpLink(site.url)"
            >
              <template #icon>
                <Icon name="icon:link" />
              </template>
            </n-button>
          </n-flex>
          <n-flex
            :style="{
              '--bg-color': `var(--${siteStatusMap[site.status]?.type || 'unknown'}-color)`,
            }"
            class="status"
            align="center"
            :wrap="false"
          >
            <div v-if="site.status !== 0" class="point" />
            <Icon v-else name="icon:pause" />
            <n-text class="status-text">{{ siteStatusMap[site.status]?.text }}</n-text>
          </n-flex>
        </n-flex>
        <!-- 每日数据 -->
        <n-flex
          v-if="site?.days?.length"
          :size="2"
          class="timeline"
          justify="space-between"
        >
          <n-popover
            v-for="(day, dayIndex) in site.days"
            :key="day?.date || dayIndex"
          >
            <template #trigger>
              <div
                :style="{
                  backgroundColor: `var(--${getDayStatus(day.percent)}-color)`,
                }"
                class="day"
              />
            </template>
            <div class="day-data">
              <n-text class="date" depth="3">
                {{ day?.date ? formatTime(day.date) : "Unknown date" }}
              </n-text>
              <!-- 详细 -->
              <n-text v-if="day?.percent >= 100">
                Daily availability {{ day?.percent }}%
              </n-text>
              <n-text v-else-if="day?.percent > 0 && day?.percent < 100">
                Failed {{ day?.down?.times }} times, total downtime {{ formatDuration(day?.down?.duration) }}, daily availability {{ day?.percent }}%
              </n-text>
              <n-text v-else>No data for today</n-text>
            </div>
          </n-popover>
        </n-flex>
        <!-- 总结 -->
        <n-flex class="summary" justify="space-between" :wrap="false">
          <n-text class="date" depth="3">
            {{ formatTime(site?.days?.[0]?.date || 0) }}
          </n-text>
          <n-text v-if="site?.down?.times" class="summary-text" depth="3">
            Failed {{ site?.down?.times }} times in the last {{ site?.days?.length }} days, total downtime {{ formatDuration(site?.down?.duration) }}, average availability {{ site?.percent }}%
          </n-text>
          <n-text v-else class="summary-text" depth="3">
            Availability in the last {{ site?.days?.length }} days {{ site?.percent }}%
          </n-text>
          <n-text class="date" depth="3">Today</n-text>
        </n-flex>
      </n-card>
    </div>
    <div
      v-else
      :style="{ '--color': `var(--${statusStore.siteStatus}-color)` }"
      class="site-cards loading"
    >
      <n-card class="site-item" hoverable>
        <Transition name="fade" mode="out-in">
          <n-spin v-if="statusStore.siteStatus !== 'unknown'" />
          <n-result
            v-else
            status="error"
            title="Error"
            description="Interface call limit exceeded or request error. Please try again later."
          >
            <template #footer>
              <n-button tertiary round @click="refresh">
                Retry
              </n-button>
            </template>
          </n-result>
        </Transition>
      </n-card>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import type { SiteStatusType, SiteType } from "~~/types/main";

const { t } = useI18n();
const statusStore = useStatusStore();

// 站点类型
const siteStatusMap = computed(() => ({
  0: { text: "Paused", type: "unknown" },
  1: { text: "Not Checked Yet", type: "unknown" },
  2: { text: "Normal", type: "normal" },
  8: { text: "Error", type: "error" },
  9: { text: "Down", type: "error" },
}));

// 请求类型
const siteTypeMap = computed(() => ({
  1: { tag: "HTTP", text: "Monitor the availability of the target service by sending HTTP or HTTPS requests" },
  2: { tag: "KEYWORD", text: "Get the page content and check if the returned content contains the specified keyword" },
  3: { tag: "PING", text: "Send a Ping request to the target server using the ICMP protocol" },
  4: { tag: "PORT", text: "Check if the specified port of the target server is open" },
  5: { tag: "HEARTBEAT", text: "The monitored service actively sends a 'heartbeat signal' to the monitoring service to indicate that it is running normally" },
}));

// 全部站点数据
const siteData = computed<SiteStatusType[] | undefined>(
  () => statusStore.siteData?.data,
);

// 当天站点状态
const getDayStatus = (percent: number): SiteType => {
  if (percent >= 100) return "normal";
  else if (percent >= 50 && percent < 100) return "warn";
  else if (percent > 0 && percent < 50) return "error";
  else return "unknown";
};

// 重试
const refresh = async () => {
  statusStore.$patch({
    siteStatus: "loading",
    siteData: undefined,
  });
  await getSiteData();
};

onMounted(getSiteData);
</script>

<style lang="scss" scoped>
.site-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 900px;
  margin: 30px auto 20px;
  padding: 0 20px;
  
  @media (max-width: 768px) {
    margin: 20px auto 15px;
    padding: 0 15px;
    gap: 10px;
  }
  
  @media (max-width: 480px) {
    margin: 15px auto 10px;
    padding: 0 12px;
    gap: 8px;
  }
  
  .site-item {
    opacity: 0;
    border-radius: 12px;
    animation: float-up 0.5s forwards;
    overflow: hidden;
    
    @media (max-width: 480px) {
      border-radius: 8px;
    }
    
    .meta {
      margin-bottom: 12px;
      
      @media (max-width: 768px) {
        margin-bottom: 10px;
        flex-wrap: wrap;
        gap: 8px;
      }
      
      @media (max-width: 480px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        margin-bottom: 8px;
      }
      
      .title {
        flex: 1;
        min-width: 0;
        
        @media (max-width: 480px) {
          width: 100%;
          flex-wrap: wrap;
        }
      }
      
      .site-name {
        font-weight: bold;
        
        @media (max-width: 768px) {
          font-size: 14px;
        }
        
        @media (max-width: 480px) {
          font-size: 13px;
          word-break: break-word;
        }
      }
      
      .n-tag {
        --n-height: 20px;
        cursor: pointer;
        
        @media (max-width: 768px) {
          --n-height: 18px;
          font-size: 11px;
        }
        
        @media (max-width: 480px) {
          --n-height: 16px;
          font-size: 10px;
        }
      }
      
      .status {
        flex-shrink: 0;
        
        @media (max-width: 480px) {
          align-self: flex-start;
        }
        
        .status-text {
          color: var(--bg-color);
          
          @media (max-width: 768px) {
            font-size: 12px;
          }
          
          @media (max-width: 480px) {
            font-size: 11px;
          }
        }
        
        svg {
          font-size: 22px;
          margin-right: -4px;
          color: var(--bg-color);
          
          @media (max-width: 768px) {
            font-size: 20px;
          }
          
          @media (max-width: 480px) {
            font-size: 18px;
          }
        }
      }
      .point {
        position: relative;
        width: 14px;
        height: 14px;
        min-width: 14px;
        background-color: var(--bg-color);
        border-radius: 50%;
        
        @media (max-width: 768px) {
          width: 12px;
          height: 12px;
          min-width: 12px;
        }
        
        @media (max-width: 480px) {
          width: 10px;
          height: 10px;
          min-width: 10px;
        }
        
        &::after {
          content: "";
          background-color: var(--bg-color);
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          border-radius: 50%;
          opacity: 1;
          z-index: -1;
          animation: breathing 1.5s ease infinite;
          transition: background-color 1s;
        }
      }
    }
    .timeline {
      margin: 15px 0 10px;
      
      @media (max-width: 768px) {
        margin: 12px 0 8px;
      }
      
      @media (max-width: 480px) {
        margin: 10px 0 6px;
      }
      
      .day {
        height: 26px;
        flex: 1;
        border-radius: 25px;
        background-color: var(--normal-color);
        transition: transform 0.3s;
        transform-origin: bottom;
        cursor: pointer;
        
        @media (max-width: 768px) {
          height: 24px;
        }
        
        @media (max-width: 480px) {
          height: 20px;
          border-radius: 20px;
        }
        
        &:hover {
          transform: scale(1.1);
          
          @media (max-width: 480px) {
            transform: scale(1.05);
          }
        }
      }
    }
    .summary {
      @media (max-width: 768px) {
        flex-wrap: wrap;
        gap: 4px;
      }
      
      @media (max-width: 480px) {
        flex-direction: column;
        gap: 6px;
        text-align: center;
      }
      
      .date {
        width: 100px;
        
        @media (max-width: 768px) {
          width: 80px;
          font-size: 11px;
        }
        
        @media (max-width: 480px) {
          width: auto;
          font-size: 10px;
          text-align: center;
        }
        
        &:last-child {
          text-align: right;
          
          @media (max-width: 480px) {
            text-align: center;
          }
        }
      }
      
      .summary-text {
        font-size: 13px;
        flex: 1;
        text-align: center;
        
        @media (max-width: 768px) {
          font-size: 11px;
        }
        
        @media (max-width: 480px) {
          font-size: 10px;
          line-height: 1.3;
        }
      }
      
      .n-text {
        font-size: 13px;
        
        @media (max-width: 768px) {
          font-size: 11px;
        }
        
        @media (max-width: 480px) {
          font-size: 10px;
        }
      }
    }
  }
  &.loading {
    .site-item {
      min-height: 200px;
      :deep(.n-card__content) {
        padding: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    .n-spin-body {
      --n-size: 40px;
      --n-color: var(--color);
    }
  }
}
.day-data {
  display: flex;
  flex-direction: column;
  .date {
    font-size: 12px;
  }
}
</style>
