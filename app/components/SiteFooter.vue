<template>
  
  
</template>

<script setup lang="ts">
const { public: configPublic } = useRuntimeConfig();
const { siteIcp, version } = configPublic;

</script>

<style lang="scss" scoped>
footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px 90px;
  margin-top: auto;
  z-index: 100;
  .text {
    margin-top: 12px;
    .n-p,
    .n-text {
      margin: 0;
      font-size: 13px;
      line-height: 26px;
    }
    .n-text {
      font-weight: bold;
      cursor: pointer;
      &:hover {
        color: var(--normal-color);
      }
    }
  }
}
</style>
