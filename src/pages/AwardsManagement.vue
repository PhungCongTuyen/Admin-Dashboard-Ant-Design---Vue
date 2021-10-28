<template>
  <div class="awards-management-container">
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1700, y: 'calc(100vh - 350px)' }"
        bordered
        @change="handleTableChange"
        :pagination="pagination"
    >
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
      </template>
      <template #thumbnail="{ record }">
        <a-image :src="record.url || 'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'"
                 :width="100"/>
      </template>
      <template #actions="{ record }">
          <span>
            <a-button v-if="record.status === 'pending'" @click="showConfirm('approve', record, index)"
                      :style="{marginRight: '10px'}" type="primary">Award
            </a-button>
            <a-button v-if="record.status === 'pending'" @click="showConfirm('reject', record, index)"
                      :style="{marginRight: '10px'}" danger ghost>Reset
            </a-button>
          </span>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {Modal} from 'ant-design-vue';
import {defineComponent, ref, computed} from "vue";
import {TableState, TableStateFilters} from 'ant-design-vue/es/table/interface';

type Pagination = TableState['pagination'];

interface DataTable {
  key?: number | string,
  url?: string,
  likes?: number,
  email?: string,
  status?: string,
  time?: string,
  updatedBy?: string
}

interface RawData {
  url?: string,
  likes?: number,
  email?: string,
  status?: string,
  time?: string,
  updatedBy?: string
}

export default defineComponent({
  name: "AwardsManagement",
  setup() {
    /* ----------------------- variables -------------------------*/
    const rawData = [{status: 'pending', url: ''}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    const dataTable = rawData.map((prev: RawData, index: number) => {
      return {
        ...prev,
        key: index
      }
    });
    const current = ref<number | undefined>(1);
    const pageSize = 20;
    const total = ref(dataTable.length);
    /* ------------------------- functions ----------------------*/
    const pagination = computed(() => ({
      total: total.value,
      current: current.value,
      pageSize: pageSize,
    }));

    const showConfirm = (type: string, data: DataTable, index: number) => {
      Modal.confirm({
        title: `Do you want to ${type} this image?`,
        content: 'When clicked the OK button, this dialog will be closed after 1 second',
        onOk() {
          console.log(type);
          console.log("data", data);
          console.log("index", index);
        },
        onCancel() {
        },
      })
    };

    const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: any) => {
      current.value = page?.current
      console.log("page", page?.current);
      console.log("filters", filters);
      console.log("sorter", sorter);
    }

    return {
      dataTable,
      pagination,
      showConfirm,
      handleTableChange
    }
  }
})
</script>

<style scoped lang="scss">

</style>