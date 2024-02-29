<script setup lang="ts">
import { computed } from "vue";

interface Props {
  /**
   * The angle of the compass in degrees (clockwise) from north.
   */
  angle: number;
}
const props = defineProps<Props>();

const rotateValue = computed(() => `${props.angle}deg`);
</script>

<template>
  <div class="compass-background">
    <div class="compass-needle">
      <div class="compass-north">N</div>
    </div>
  </div>
</template>

<style scoped>
.compass-background {
  position: relative;
  width: 55px;
  height: 55px;
  background-color: rgba(var(--v-theme-background), 1);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 0 10px 0 rgba(0, 0, 0, 0.5);
}

.compass-needle {
  position: absolute;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 25px solid rgba(var(--v-theme-primary), 0.5);
  transform: rotate(v-bind(rotateValue));
}

.compass-north {
  position: absolute;
  top: -14px;
  left: 0;
  transform: translateX(-55%);
  font-size: 0.8rem;
  font-weight: bold;
  color: rgba(var(--v-theme-primary), 0.5);
}
</style>
