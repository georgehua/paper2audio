<template>
  <div
    class="dot dot--basic"
    :style="{ backgroundColor: color, width: diameter, height: diameter }"
    aria-hidden="true"
  ></div>
</template>

<script>
export default {
  props: {
    diameter: {
      type: String,
      default: "0.5rem",
    },
    color: {
      type: String,
      default: "red",
    },
  },
};
</script>
<style lang="css">
@-webkit-keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
@-moz-keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
@-o-keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}
@keyframes blink {
  0%,
  100% {
    opacity: 0;
  }
  50% {
    opacity: 1;
  }
}

.dot {
  display: inline-block;
  border-radius: 50%;
  -webkit-animation: blink 2s infinite;
  -moz-animation: blink 2s infinite;
  -o-animation: blink 2s infinite;
  animation: blink 2s infinite;
}
</style>