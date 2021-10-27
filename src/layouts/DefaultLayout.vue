<template>
  <a-layout class="layout-default" id="layout-default" >
    <a-layout-content>
      <router-view />
    </a-layout-content>
  </a-layout>
</template>

<script>

export default ({
  data() {
    return {
    }
  }
})

</script>

<style lang="scss">
.layout-auth {
  min-width: 500px;
}
</style>