<template>
  <transition name="fade"
              @before-appear="beforeAppear"
              @appear="onAppear"
              @after-appear="afterAppear"
              appear>
    <slot></slot>
  </transition>
</template>
<script>
  export default {
    name: 'fade-render-transition',
    props: {
      duration: {
        type: Number,
        default: 300
      },
      delay: {
        type: Number,
        default: 0
      }
    },
    methods: {
      beforeAppear (el) {
        el.style.opacity = 0
      },
      onAppear (el) {
        el.style.transform = `translate3d(0, -60px, 0)`
        el.style.transition = `all ${this.duration / 1000}s ease-in`
        if (this.delay > 0) {
          el.style.transition = `${el.style.transition} ${this.delay / 1000}s`
        }
      },
      afterAppear (el) {
        el.style.opacity = 1
        el.style.transform = `translate3d(0, 0, 0)`
      }
    }
  }
</script>
<style lang="scss">
  @import "../../assets/sass/lbd/variables";
  @import "../../assets/sass/lbd/mixins";

  .fade-render-active {
    transition: all .3s;
    @include transform-translate-y(0);

  }

  .fade-render {
    opacity: 0;
    @include transform-translate-y(-60px);
  }
</style>
