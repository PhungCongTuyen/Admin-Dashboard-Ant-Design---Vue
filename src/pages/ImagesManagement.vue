<template>
  <div class="images-management-container">
    <div class="images-management-options-bar">
      <span class="images-management-options-label">Filter:</span>
      <a-select
          v-model:value="select"
          style="width: 120px"
          :options="filterOptions"
          @change="handleChangeFilter"
      />
    </div>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1700, y: 'calc(100vh - 350px)' }"
        bordered
        @change="handleTableChange"
        :pagination="pagination"
        size="small"
    >
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
      </template>
      <template #thumbnail="{ record }">
        <a-image
            :src="record.url"
            :width="100"
        />
      </template>
      <template #actions="{ record }">
        <a-button v-if="record.status === 'pending'" @click="showConfirm('approve', record, index)"
                  :style="{marginRight: '10px'}" type="primary">Approve
        </a-button>
        <a-button v-if="record.status === 'pending'" @click="showConfirm('reject', record, index)"
                  :style="{marginRight: '10px'}" danger ghost>Reject
        </a-button>
        <a-button v-if="record.status !== 'deleted'" @click="showConfirm('delete', record, index)" danger
                  type="primary">Delete
        </a-button>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts"> 
import {Modal} from "ant-design-vue";
import {defineComponent, ref, computed} from "vue";
import {TableState, TableStateFilters} from "ant-design-vue/es/table/interface";
import fallbackConstant from "../constants/fallback.constants";

type Pagination = TableState["pagination"];

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

const columns = [
    {
        title: "No.",
        key: "no",
        align: "center",
        width: 50,
        slots: {customRender: "no"},
    },
    {
        title: "Thumbnail",
        key: "thumbnail",
        dataIndex: "url",
        align: "center",
        width: 150,
        slots: {customRender: "thumbnail"},
    },
    {
        title: "Number of Likes",
        key: "likes",
        align: "center",
        width: 100,
        sorter: true,
        sortDirections: ["ascend", "descend"]
    },
    {
        title: "Owner's Email",
        key: "email",
        align: "center",
        width: 200,
    },
    {
        title: "Status",
        key: "status",
        dataIndex: "status",
        align: "center",
        width: 100,
    },
    {
        title: "Created At",
        key: "created",
        align: "center",
        width: 150,
        sorter: true,
        sortDirections: ["ascend", "descend"]
    },
    {
        title: "Last Modified At",
        key: "time",
        align: "center",
        width: 150,
        sorter: true,
        sortDirections: ["ascend", "descend"]
    },
    {
        title: "Updated by",
        key: "updatedBy",
        align: "center",
        width: 150,
    },
    {
        title: "Actions",
        key: "actions",
        dataIndex: "actions",
        align: "center",
        width: 200,
        slots: {customRender: "actions"},
    },
];

const filterOptions = [
    {
        value: "",
        label: "None",
    },
    {
        value: "pending",
        label: "Pending",
    },
    {
        value: "approved",
        label: "Approved",
    },
    {
        value: "rejected",
        label: "Rejected",
    },
    {
        value: "deleted",
        label: "Deleted",
    },
];

export default defineComponent({
    name: "ImagesManagement",
    setup() {
        /* ----------------------- variables -------------------------*/
        const imageFallback = fallbackConstant.IMAGE_FALLBACK;
        const rawData = [
            {
                status: "pending",
                url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            },
            {
                status: "pending",
                url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            },
            {
                status: "pending",
                url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            },
            {
                status: "pending",
                url: "https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png"
            },];
        const dataTable = rawData.map((prev: RawData, index: number) => {
            return {
                ...prev,
                key: index
            };
        });
        const select = ref<string>("");
        const current = ref<number | undefined>(1);
        const pageSize = 20;
        const total = ref(dataTable.length);
        /* ------------------------- functions ----------------------*/
        const pagination = computed(() => ({
            total: total.value,
            current: current.value,
            pageSize: pageSize,
        }));

        const handleChangeFilter = (value: string) => {
            select.value = value;
            console.log(value);
        };

        const showConfirm = (type: string, data: DataTable, index: number) => {
            Modal.confirm({
                title: `Do you want to ${type} this image?`,
                content: "When clicked the OK button, this dialog will be closed after 1 second",
                onOk() {
                    console.log(type);
                    console.log("data", data);
                    console.log("index", index);
                },
                onCancel() {
                },
            });
        };

        const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: any) => {
            current.value = page?.current;
            console.log("page", page?.current);
            console.log("filters", filters);
            console.log("sorter", sorter);
        };

        /*---------------------------- hooks --------------------------*/
        return {
            filterOptions,
            dataTable,
            select,
            columns,
            pagination,
            total,
            current,
            pageSize,
            imageFallback,
            handleChangeFilter,
            showConfirm,
            handleTableChange,
        };
    },
});
</script>

<style scoped lang="scss">
.images-management-container {
  .images-management-options-bar {
    margin-bottom: 20px;

    .images-management-options-label {
      margin-right: 10px;
    }
  }
}
</style>