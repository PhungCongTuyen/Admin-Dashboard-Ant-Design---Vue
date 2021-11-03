<template>
  <div id="app">
    <component :is="layout">
      <router-view/>
    </component>
  </div>
</template>
<script lang="ts">
import {defineComponent, ref, watch} from "vue";
import {useRoute} from "vue-router";

export default defineComponent({
    name: "App",
    setup() {
        const route = useRoute();
        const layout = ref("layout-default");
 
        const checkLayout = () => {
            if (!route.meta.layout) {
                layout.value = "layout-default";
            } else {
                layout.value = "layout-" + route.meta.layout;
            }
        };

        watch(route, checkLayout);

        return {
            layout
        };
    }
});

</script>

<style lang="scss">
</style>
