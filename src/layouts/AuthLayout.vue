<template>
    <a-layout class="layout-auth" id="layout-auth" >
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