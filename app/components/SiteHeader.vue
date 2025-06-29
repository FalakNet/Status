<!-- 站点状态 -->
<template>
  <header id="header" :class="{ 'scrolled': isScrolled }">
    <!-- 背景 -->
    <Transition name="fade" mode="in-out">
      <div
        :key="statusStore.siteStatus"
        :style="{ background: `var(--${statusStore.siteStatus}-cover)` }"
        :class="['status-cover', statusStore.siteStatus]"
      />
    </Transition>
    <div class="status-content">
      <!-- 状态内容 -->
      <div class="site-status">
        <!-- 状态文本 -->
        <div class="status-text">
          <div class="point" />
          <Transition name="fade" mode="out-in">
            <div :key="statusStore.siteStatus" class="text">
              <span class="title">
                {{ siteGlobalText[statusStore.siteStatus] }}
              </span>
              <span v-if="statusStore.siteStatus === 'loading'" class="tip">
                Please wait a moment ...
              </span>
              <span
                v-else-if="statusStore.siteStatus === 'unknown'"
                class="tip"
              >
                This might be a temporary issue. Please try refreshing.
              </span>
              <!-- 更新频率 -->
              <n-flex 
                v-else 
                :size="0" 
                class="tip" 
                style="text-align: left;"
                align="left"
                :wrap="true"
                :vertical="false"
              >
                <div class="time-info">
                  <span class="update-time">
                    Updated at
                    {{
                      formatTime(statusStore.siteData?.timestamp || 0, {
                        showTime: true,
                        showOnlyTimeIfToday: true,
                      })
                    }}
                  </span>
                  <span class="refresh-time">
                    Will refresh in {{ nextUpdateTime }}
                  </span>
                </div>
                <n-button
                  :focusable="false"
                  color="#fff"
                  quaternary
                  circle
                  align="left"
                  size="small"
                  @click="refresh"
                >
                  <template #icon>
                    <Icon name="icon:refresh" />
                  </template>
                </n-button>
              </n-flex>
            </div>
          </Transition>
        </div>
      </div>
    </div>
    <!-- 波纹 -->
    <svg
      class="waves-area"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      viewBox="0 24 150 28"
      preserveAspectRatio="none"
      shape-rendering="auto"
    >
      <defs>
        <path
          id="gentle-wave"
          d="M -160 44 c 30 0 58 -18 88 -18 s 58 18 88 18 s 58 -18 88 -18 s 58 18 88 18 v 44 h -352 Z"
        />
      </defs>
      <g class="parallax">
        <use href="#gentle-wave" x="48" y="0" />
        <use href="#gentle-wave" x="48" y="3" />
        <use href="#gentle-wave" x="48" y="5" />
        <use href="#gentle-wave" x="48" y="7" />
      </g>
    </svg>
  </header>
</template>

<script setup lang="ts">
const { t } = useI18n();
const statusStore = useStatusStore();

// 倒计时
const updateTime = ref<number>(300);

// 滚动状态
const isScrolled = ref<boolean>(false);

// 站点状态文本
const siteGlobalText = computed(() => ({
  loading: "Site status loading",
  unknown: "Site status unknown",
  normal: "Site is running normally",
  error: "All sites encountered issues",
  warn: "Some sites encountered issues",
}));

// 更新倒计时
const nextUpdateTime = computed(() => {
  const time = updateTime.value;
  const minutes = Math.floor(time / 60);
  const seconds = time % 60;
  return minutes > 0
    ? `${minutes} minute ${seconds} second`
    : `${seconds} second`;
});

// 更新数据
const refresh = async () => {
  const lastUpdate = statusStore.siteData?.timestamp || 0;
  if (!lastUpdate) return;
  // 小于 5 分钟
  if (Date.now() - lastUpdate < 5 * 60 * 1000) {
    window.$message.warning("Refreshing too frequently. Please try again later.");
    return;
  }
  updateTime.value = 300;
  await getSiteData();
};

// 滚动监听
const handleScroll = () => {
  isScrolled.value = window.scrollY > 50;
  // Toggle body class for header padding
  if (isScrolled.value) {
    document.body.classList.add('header-scrolled');
  } else {
    document.body.classList.remove('header-scrolled');
  }
};

// 监听滚动事件
onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 执行倒计时
const { pause: pauseTime, resume: resumeTime } = useIntervalFn(
  async () => {
    if (updateTime.value > 0) updateTime.value--;
    if (updateTime.value === 0) {
      pauseTime();
      statusStore.siteStatus = "loading";
      await getSiteData();
      updateTime.value = 300;
      resumeTime();
    }
  },
  1000,
  { immediate: true },
);
</script>

<style lang="scss" scoped>
header {
  position: relative;
  height: 44vh;
  min-height: 320px;
  width: 100%;
  color: white;
  overflow: hidden;
  transition: all 0.3s ease;
  
  &.scrolled {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 80px;
    min-height: 80px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    z-index: 1000;
    
    .status-content {
      padding: 10px 20px;
      max-width: 1200px;
      
      .site-status {
        height: auto;
        align-items: center;
        padding: 0;
        
        .status-text {
          margin-bottom: 0;
          gap: 12px;
          
          .point {
            width: 24px;
            height: 24px;
            min-width: 24px;
            margin-right: 12px;
            
            @media (max-width: 768px) {
              width: 24px;
              height: 24px;
              min-width: 24px;
              margin-right: 12px;
            }
          }
          
          .text {
            .title {
              font-size: 18px;
              margin-bottom: 0;
              line-height: 1;
              
              @media (max-width: 768px) {
                font-size: 16px;
              }
            }
            
            .tip {
              display: none;
            }
          }
        }
      }
    }
    
    .waves-area {
      display: none;
    }
  }
  
  // Mobile-first responsive design
  @media (max-width: 1024px) {
    height: 50vh;
    min-height: 350px;
  }
  
  @media (max-width: 768px) {
    height: 55vh;
    min-height: 300px;
  }
  
  @media (max-width: 480px) {
    height: 60vh;
    min-height: 280px;
  }
  
  @media (max-width: 360px) {
    height: 65vh;
    min-height: 260px;
  }
  
  .status-cover {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-size: 400% !important;
    background: var(--loading-cover);
    z-index: -1;
    transition: filter 0.3s;
    filter: var(--cover-filter);
  }
  
  .status-content {
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    max-width: 900px;
    margin: 0 auto;
    padding: 30px 20px 80px;
    
    @media (max-width: 1024px) {
      padding: 25px 18px 70px;
    }
    
    @media (max-width: 768px) {
      padding: 20px 16px 60px;
    }
    
    @media (max-width: 480px) {
      padding: 16px 14px 50px;
    }
    
    @media (max-width: 360px) {
      padding: 12px 10px 40px;
    }
    
    .site-status {
      display: flex;
      align-items: flex-end;
      justify-content: flex-start;
      padding: 0 20px;
      height: 100%;
      
      @media (max-width: 1024px) {
        padding: 0 15px;
      }
      
      @media (max-width: 768px) {
        padding: 0 10px;
        align-items: flex-end;
        justify-content: flex-start;
      }
      
      @media (max-width: 480px) {
        padding: 0 8px;
        align-items: flex-end;
        justify-content: flex-start;
        text-align: left;
      }
      
      .status-text {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 12px;
        flex-wrap: wrap;
        width: 100%;
        
        @media (max-width: 768px) {
          flex-direction: row;
          align-items: center;
          justify-content: flex-start;
          text-align: left;
          margin-bottom: 0;
          gap: 16px;
        }
        
        @media (max-width: 480px) {
          gap: 12px;
        }
        
        .point {
          position: relative;
          width: 40px;
          height: 40px;
          min-width: 40px;
          background-color: #fff;
          border-radius: 50%;
          margin-right: 30px;
          flex-shrink: 0;
          
          @media (max-width: 1024px) {
            width: 38px;
            height: 38px;
            min-width: 38px;
            margin-right: 25px;
          }
          
          @media (max-width: 768px) {
            width: 36px;
            height: 36px;
            min-width: 36px;
            margin-right: 20px;
          }
          
          @media (max-width: 480px) {
            width: 32px;
            height: 32px;
            min-width: 32px;
          }
          
          @media (max-width: 360px) {
            width: 28px;
            height: 28px;
            min-width: 28px;
          }
          
          &::after {
            content: "";
            background-color: #ffffff80;
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
        
        .text {
          display: flex;
          flex-direction: column;
          flex: 1;
          
          @media (max-width: 768px) {
            align-items: flex-start;
            text-align: left;
          }
          
          .title {
            font-size: 40px;
            font-weight: bold;
            line-height: 1.1;
            margin-bottom: 8px;
            word-break: break-word;
            
            @media (max-width: 1024px) {
              font-size: 36px;
            }
            
            @media (max-width: 768px) {
              font-size: 28px;
              line-height: 1.2;
              margin-bottom: 6px;
            }
            
            @media (max-width: 480px) {
              font-size: 22px;
              line-height: 1.3;
              margin-bottom: 4px;
            }
            
            @media (max-width: 360px) {
              font-size: 20px;
            }
          }
          
          .tip {
            font-size: 14px;
            opacity: 0.9;
            line-height: 1.4;
            
            @media (max-width: 1024px) {
              font-size: 13px;
            }
            
            @media (max-width: 768px) {
              font-size: 12px;
              opacity: 0.85;
            }
            
            @media (max-width: 480px) {
              font-size: 11px;
            }
            
            @media (max-width: 360px) {
              font-size: 10px;
            }
            
            .time-info {
              display: flex;
              flex-direction: column;
              gap: 2px;
              
              @media (max-width: 768px) {
                align-items: center;
                text-align: center;
                gap: 4px;
              }
              
              .update-time,
              .refresh-time {
                display: block;
                
                @media (max-width: 768px) {
                  font-size: 11px;
                }
                
                @media (max-width: 480px) {
                  font-size: 10px;
                }
                
                @media (max-width: 360px) {
                  font-size: 9px;
                }
              }
              
              .update-time::after {
                content: " | ";
                font-size: 12px;
                margin: 0 4px;
                opacity: 0.6;
                
                @media (max-width: 768px) {
                  display: none;
                }
              }
            }
            
            .n-button {
              --n-height: 24px;
              --n-font-size: 12px;
              margin-left: 12px;
              min-width: 24px;
              transition: all 0.2s ease;
              
              @media (max-width: 1024px) {
                --n-height: 26px;
                margin-left: 10px;
              }
              
              @media (max-width: 768px) {
                --n-height: 28px;
                --n-font-size: 14px;
                margin-left: 0;
                margin-top: 8px;
                min-width: 28px;
              }
              
              @media (max-width: 480px) {
                --n-height: 32px;
                --n-font-size: 16px;
                margin-top: 10px;
                min-width: 32px;
              }
              
              // Better touch targets
              @media (hover: none) and (pointer: coarse) {
                --n-height: 36px;
                min-width: 36px;
                margin-top: 12px;
              }
              
              &:hover {
                transform: scale(1.05);
              }
              
              &:active {
                transform: scale(0.95);
              }
            }
          }
        }
      }
    }
  }
  
  .waves-area {
    width: 100%;
    height: 60px;
    position: absolute;
    bottom: 0;
    left: 0;
    z-index: -1;
    pointer-events: none;
    
    @media (max-width: 1024px) {
      height: 55px;
    }
    
    @media (max-width: 768px) {
      height: 50px;
    }
    
    @media (max-width: 600px) {
      height: 45px;
    }
    
    @media (max-width: 480px) {
      height: 40px;
    }
    
    @media (max-width: 360px) {
      height: 35px;
    }
    
    @media (max-width: 320px) {
      height: 30px;
    }
    
    .parallax {
      > use {
        animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
        transition: fill 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform, fill;
      }

      > use:nth-child(1) {
        animation-delay: -2s;
        animation-duration: 7s;
        fill: rgba(var(--cover-fill-color), 0.741);
      }

      > use:nth-child(2) {
        animation-delay: -3s;
        animation-duration: 10s;
        fill: rgba(var(--cover-fill-color), 0.51);
      }

      > use:nth-child(3) {
        animation-delay: -4s;
        animation-duration: 13s;
        fill: rgba(var(--cover-fill-color), 0.212);
      }

      > use:nth-child(4) {
        animation-delay: -5s;
        animation-duration: 20s;
        fill: var(--main-bg-color);
      }
    }
  }
}

// Animations
@keyframes breathing {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.4;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }
  100% {
    transform: translate3d(85px, 0, 0);
  }
}

// Improved mobile interactions
@media (hover: none) and (pointer: coarse) {
  header {
    .status-content {
      .site-status {
        .status-text {
          .text {
            .tip {
              .n-button {
                // Enhanced touch target for mobile
                --n-height: 40px;
                min-width: 40px;
                
                &::before {
                  content: '';
                  position: absolute;
                  top: -8px;
                  left: -8px;
                  right: -8px;
                  bottom: -8px;
                  border-radius: 50%;
                }
              }
            }
          }
        }
      }
    }
  }
}
</style>
