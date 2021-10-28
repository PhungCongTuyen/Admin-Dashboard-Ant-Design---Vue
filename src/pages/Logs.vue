<template>
  <div class="logs-container">
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }"
        bordered
        size="small"
        @change="handleTableChange"
        :pagination="pagination">
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {computed, defineComponent, ref} from "vue";
import {TableState, TableStateFilters} from "ant-design-vue/es/table/interface";

type Pagination = TableState["pagination"];

const columns = [
  {
    title: "No.",
    key: "no",
    align: "center",
    width: 100,
    slots: {customRender: "no"}
  },
  {
    title: "Time",
    key: "time",
    align: "center",
    width: 300,
    sorter: true,
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
  },
];

export default defineComponent({
  name: "Logs",
  setup() {
    const rawData = [{status: "pending"}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    const dataTable = rawData.map((prev, index) => {
      return {
        ...prev,
        key: index
      };
    });
    const current = ref<number | undefined>(1);
    const pageSize = 5;
    const total = ref(dataTable.length);
    /*------------------------------- functions -----------------------------*/

    const pagination = computed(() => ({
      total: total.value,
      current: current.value,
      pageSize: pageSize,
    }));

    const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: any) => {
      current.value = page?.current;
      console.log("page", page?.current);
      console.log("filters", filters);
      console.log("sorter", sorter);
    };

    /*------------------------------- hooks -----------------------------*/
    return {
      columns,
      dataTable,
      pagination,
      handleTableChange
    };
  }
});
</script>

<style scoped lang="scss">
.logs-container {

}
</style>