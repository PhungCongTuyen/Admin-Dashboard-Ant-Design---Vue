<template>
  <div class="awards-management-container">
    <a-modal
        :visible="showModal"
        title="Awards Management"
        @ok="handleOk"
        @cancel="handleCloseModal"
    >
      <a-row>
        <a-col :span="8">
          <a-image
              :src="imageURL"
              alt="award"
              :style="{ width: '128px' }"
              :fallback="fallback"
          />
        </a-col>
        <a-col :span="16">
          <div :style="{ fontWeight: 'bold' }">
            Award:
          </div>
          <a-input
              v-model:value="award"
              placeholder="Name of award..."
              :style="{ marginBottom: '20px' }"
          />
          <div :style="{ fontWeight: 'bold' }">
            Description:
          </div>
          <a-textarea
              v-model:value="description"
              placeholder="Description..."
              :auto-size="{ minRows: 2, maxRows: 10 }"
          />
        </a-col> 
      </a-row>
    </a-modal>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }"
        bordered
        :pagination="pagination"
        @change="handleTableChange"
        size="small"
    >
      <template #no="{ index }">
        <span>{{
            (pagination.current - 1) * pagination.pageSize + index + 1
          }}</span>
      </template>
      <template #thumbnail="{ record }">
        <a-image
            :src="
            record.url ||
              'https://zos.alipayobjects.com/rmsportal/jkjgkEfvpUPVyRjUImniVslZfWPnJuuZ.png'
          "
            :width="100"
        />
      </template>
      <template #actions="{ record }">
        <span>
          <a-button
              v-if="!record.award"
              :style="{ marginRight: '10px' }"
              type="primary"
              @click="handleOpenModal(record, index)"
          >
            Edit Award
          </a-button>
          <a-button
              v-if="record.award"
              :style="{ marginRight: '10px' }"
              danger
              type="primary"
              @click="showConfirm('reset', record, index)"
          >
            Reset Award
          </a-button>
        </span>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {Modal} from "ant-design-vue";
import {defineComponent, ref, computed} from "vue";
import {
    TableState,
    TableStateFilters,
} from "ant-design-vue/es/table/interface";
import FallbackConstants from "../constants/fallback.constants";

type Pagination = TableState["pagination"];

interface DataTable {
  key?: number | string;
  url?: string;
  likes?: number;
  email?: string;
  status?: string;
  time?: string;
  updatedBy?: string;
}

interface RawData {
  url?: string;
  likes?: number;
  email?: string;
  status?: string;
  time?: string;
  updatedBy?: string;
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
        sortDirections: ["ascend", "descend"],
    },
    {
        title: "Owner's Email",
        key: "email",
        align: "center",
        width: 200,
    },
    {
        title: "Award",
        key: "award",
        dataIndex: "award",
        align: "center",
        width: 100,
    },
    {
        title: "Description",
        key: "description",
        dataIndex: "description",
        align: "center",
        width: 200,
    },
    {
        title: "Actions",
        key: "actions",
        dataIndex: "actions",
        align: "center",
        width: 100,
        slots: {customRender: "actions"},
    },
];

export default defineComponent({
    name: "AwardsManagement",
    setup() {
    /* ----------------------- variables -------------------------*/
        const rawData = [
            {award: "have Award", url: "", description: "good image"},
            {award: "", url: "", description: "good quality"},
            {award: null, url: "", description: ""},
        ];
        const fallback = FallbackConstants.IMAGE_FALLBACK;
        const dataTable = rawData.map((prev: RawData, index: number) => {
            return {
                ...prev,
                key: index,
            };
        });
        const current = ref<number | undefined>(1);
        const showModal = ref<boolean>(false);
        const pageSize = 20;
        const total = ref(dataTable.length);
        const imageURL = ref<string | null | ArrayBuffer>("");
        const description = ref<string>("");
        const award = ref<string>("");
        /* ------------------------- functions ----------------------*/
        const pagination = computed(() => ({
            total: total.value,
            current: current.value,
            pageSize: pageSize,
        }));

        const showConfirm = (type: string, data: DataTable, index: number) => {
            Modal.confirm({
                title: `Do you want to ${type} award of this image?`,
                content:
            "When clicked the OK button, this dialog will be closed after 1 second",
                onOk() {
                    console.log(type);
                    console.log("data", data);
                    console.log("index", index);
                },
                onCancel() {
                },
            });
        };

        const handleTableChange = (
            page: Pagination,
            filters: TableStateFilters,
            sorter: any
        ) => {
            current.value = page?.current;
            console.log("page", page?.current);
            console.log("filters", filters);
            console.log("sorter", sorter);
        };

        const handleOpenModal = (record: any, index: number) => {
            showModal.value = true;
            award.value = record.award;
            description.value = record.description;
            imageURL.value = record.url;
            console.log(record, index);
        };

        const handleCloseModal = () => {
            showModal.value = false;
        };

        const handleOk = () => {
            showModal.value = false;
        };

        return {
            imageURL,
            award,
            description,
            columns,
            dataTable,
            showModal,
            pagination,
            fallback,
            showConfirm,
            handleTableChange,
            handleOpenModal,
            handleCloseModal,
            handleOk,
        };
    },
});
</script>

<style scoped lang="scss">
.awards-management-container {
}
</style>
