<template>
  <div class="awards-management-container">
    <div class="awards-management-options-bar">
      <span class="awards-management-options-label">Search: </span>
      <a-input
          v-model:value="searchInput"
          placeholder="Email"
          style="width: 200px"
          :disabled="isLoading"
      >
        <template #suffix>
          <search-outlined/>
        </template>
      </a-input>
      <span class="awards-management-options-label-2">Filter:</span>
      <a-select
          v-model:value="select"
          style="width: 200px"
          :options="filterOptions"
          @change="handleChangeFilter"
          :disabled="isLoading"
      />
    </div>
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
        :scroll="{ x: 1920, y: 'calc(100vh - 350px)' }"
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
      <template #image="{ record }">
        <a-image
            :src="record.link"
            :width="100"
            :style="{minHeight: '100px'}"
        >
          <template #placeholder>
            <a-image
                :src="imageFallback"
                :width="100"
                :height="100"
                :preview="false"
            />
          </template>
        </a-image>
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
import {message, Modal} from "ant-design-vue";
import {defineComponent, ref, computed, watch} from "vue";
import {
  TableState,
  TableStateFilters,
} from "ant-design-vue/es/table/interface";
import FallbackConstants from "../constants/fallback.constants";
import {getListImageApi, getListImageAwardApi} from "@/services/apis/image.api";
import debounce from "lodash/debounce";

type Pagination = TableState["pagination"];


interface DataTable {
  id: string,
  key?: number | string,
  url?: string,
  likes?: number,
  email?: string,
  status?: string,
  time?: string,
  updatedBy?: string
}

interface RawData {
  id: string,
  url?: string,
  likes?: number,
  email?: string,
  status?: string,
  time?: string,
  updatedBy?: string
}

const filterOptions = [
  {
    value: "approved",
    label: "Approved Images",
  },
  {
    value: "awarded",
    label: "Awarded Images",
  }
];

const columns = [
  {
    title: "No.",
    key: "no",
    align: "center",
    width: 60,
    slots: {customRender: "no"},
  },
  {
    title: "Image",
    key: "image",
    dataIndex: "link",
    align: "center",
    width: 150,
    slots: {customRender: "image"},
  },
  {
    title: "Number of Likes",
    key: "like",
    align: "center",
    dataIndex: "totalLike",
    width: 100,
    sorter: true,
  },
  {
    title: "Owner's Email",
    key: "ownerEmail",
    dataIndex: ["customer", "email"],
    align: "center",
    width: 200,
    sorter: true,
  },
  {
    title: "Owner's Nickname",
    key: "ownerName",
    dataIndex: ["customer", "nickName"],
    align: "center",
    width: 200,
    sorter: true,
  },
  {
    title: "Status",
    key: "status",
    dataIndex: "status",
    align: "center",
    width: 100,
    sorter: true,
  },
  {
    title: "Created At",
    key: "createdAt",
    dataIndex: "createdAt",
    align: "center",
    width: 150,
    sorter: true,
    slots: {customRender: "imageCreatedTime"}
  },
  {
    title: "Updated At",
    key: "updatedAt",
    dataIndex: "updatedAt",
    align: "center",
    width: 150,
    sorter: true,
    slots: {customRender: "imageUpdatedTime"}
  },
  {
    title: "Actions",
    key: "actions",
    dataIndex: "actions",
    align: "center",
    width: 250,
    slots: {customRender: "actions"},
  },
];

type Sorter = {
  column: {
    title: string,
    key: string,
    dataIndex: string,
    sorter: boolean,
    width: number,
    align: string
  },
  columnKey: string,
  field: string,
  order: string
}

export default defineComponent({
  name: "AwardsManagement",
  setup() {
    /* ----------------------- variables -------------------------*/
    const rawData = ref<RawData[]>([]);
    const imageFallback = FallbackConstants.IMAGE_FALLBACK;
    const dataTable = ref<DataTable[]>([]);
    const currentPage = ref<number | undefined>(1);
    const showModal = ref<boolean>(false);
    const isLoading = ref<boolean>(false);
    const pageSize = 20;
    const totalItem = ref<number>(0);
    const imageURL = ref<string | null | ArrayBuffer>("");
    const description = ref<string>("");
    const select = ref<string>("approved");
    const sort = ref<string>("");
    const award = ref<string>("");
    const searchInput = ref<string>("");
    /* ------------------------- functions ----------------------*/
    const pagination = computed(() => ({
      total: totalItem.value,
      current: currentPage.value,
      pageSize: pageSize,
    }));

    const onSearch = debounce((e) => {
      searchInput.value = e;
      currentPage.value = 1;
      if (select.value === "approved") {
        getListImages({page: currentPage.value || 1, pageSize: pageSize, sort: sort.value, status: "approved"});
      } else {
        getListImagesAward({page: currentPage.value || 1, pageSize: pageSize, sort: sort.value, awarded: e});
      }
    }, 1000);

    const handleChangeFilter = (value: string) => {
      select.value = value;
      if (value === "approved") {
        getListImages({
          page: 1,
          pageSize: pageSize,
          sort: "",
          status: "approved"
        });
      } else {
        getListImagesAward({
          page: 1,
          pageSize: pageSize,
          sort: "",
          awarded: searchInput.value
        });
      }
    };

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
        sorter: Sorter
    ) => {
      const sortOrder = sorter.order === "ascend" ? 1 : -1;
      sort.value = sorter.order ? `${sorter.columnKey}:${sortOrder}` : "";
      currentPage.value = page?.current;
      if (select.value === "approved") {
        getListImages({
          page: currentPage.value || 1,
          pageSize: pageSize,
          sort: sort.value,
          status: "approved"
        });
      } else {
        getListImagesAward({
          page: currentPage.value || 1,
          pageSize: pageSize,
          sort: sort.value,
          awarded: searchInput.value
        });
      }
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

    const convertDataToTable = () => {
      dataTable.value = rawData.value?.map((prev: RawData, index: number) => {
        return {
          ...prev,
          key: index
        };
      });
    };


    const getListImages = ({
                             page,
                             pageSize,
                             sort,
                             status
                           }: { page: number, pageSize: number, sort: string, status?: string }) => {
      isLoading.value = true;
      getListImageApi({page, pageSize, sort, status}).then((res) => {
        rawData.value = res.data.data;
        totalItem.value = res.data.totalItem;
        isLoading.value = false;
      }).catch((e) => {
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
        isLoading.value = false;
      });
    };

    const getListImagesAward = ({
                                  page,
                                  pageSize,
                                  sort,
                                  awarded
                                }: { page: number, pageSize: number, sort: string, awarded: string }) => {
      isLoading.value = true;
      getListImageAwardApi({page, pageSize, sort, awarded}).then((res) => {
        rawData.value = res.data.data;
        totalItem.value = res.data.totalItem;
        isLoading.value = false;
      }).catch((e) => {
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
        isLoading.value = false;
      });
    };
    /*---------------------------- hooks ---------------------------*/
    watch(rawData, convertDataToTable);
    watch(searchInput, onSearch);

    return {
      imageURL,
      award,
      select,
      description,
      columns,
      dataTable,
      showModal,
      pagination,
      imageFallback,
      searchInput,
      isLoading,
      filterOptions,
      handleChangeFilter,
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
  .awards-management-options-bar {
    display: flex;
    align-items: center;
    margin-bottom: 20px;

    .awards-management-options-label {
      margin-right: 10px;
    }

    .awards-management-options-label-2 {
      margin-left: 10px;
      margin-right: 10px;
    }
  }
}
</style>
