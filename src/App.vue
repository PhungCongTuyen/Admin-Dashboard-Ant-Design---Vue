<template>
  <div id="app">
    <component :is="layout">
      <router-view/>
    </component>
  </div>
</template>
<script>

export default ({
  name: "App",
  computed: {
    layout() {
      if (!this.$route.meta.layout) {
        return "layout-default";
      }
      return "layout-" + this.$route.meta.layout;
    }
  },
});

</script>

<style lang="scss">
</style>
