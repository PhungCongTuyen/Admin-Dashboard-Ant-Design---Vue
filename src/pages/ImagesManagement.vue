<template>
  <div class="images-management-container">
    <div class="images-management-options-bar">
      <span class="images-management-options-label">Filter:</span>
      <a-select
          v-model:value="select"
          style="width: 120px"
          :options="filterOptions"
          @change="handleChangeFilter"
          :disabled="isLoading"
      />
    </div>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1920, y: 'calc(100vh - 350px)' }"
        bordered
        @change="handleTableChange"
        :pagination="pagination"
        :loading="isLoading"
    >
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
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
      <template #imageCreatedTime="{record}">
        <span>{{ renderTime(record?.createdAt) }}</span>
      </template>
      <template #imageUpdatedTime="{record}">
        <span>{{ renderTime(record?.updatedAt) }}</span>
      </template>
      <template #actions="{ record }">
        <div v-if="userRole === 'admin'">
          <a-button v-if="record.status !== 'pending'"
                    @click="showConfirm('pending', record)"
                    :style="{marginRight: '10px'}" type="primary" ghost>Pending
          </a-button>
          <a-button v-if="record.status !== 'approved'" @click="showConfirm('approv', record)"
                    :style="{marginRight: '10px'}" type="primary">Approve
          </a-button>
          <a-button v-if="record.status !== 'reject'" @click="showConfirm('reject', record)"
                    :style="{marginRight: '10px'}" danger ghost>Reject
          </a-button>
          <a-button v-if="record.status !== 'delete'" @click="showConfirm('delet', record)" danger
                    type="primary">Delete
          </a-button>
        </div>
        <div v-if="userRole === 'moderator'">
          <a-button v-if="record.status === 'pending'" @click="showConfirm('approv', record)"
                    :style="{marginRight: '10px'}" type="primary">Approve
          </a-button>
          <a-button v-if="record.status === 'pending'" @click="showConfirm('reject', record)"
                    :style="{marginRight: '10px'}" danger ghost>Reject
          </a-button>
          <a-button v-if="record.status !== 'delete'" @click="showConfirm('delet', record)" danger
                    type="primary">Delete
          </a-button>
        </div>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {message, Modal} from "ant-design-vue";
import {defineComponent, ref, computed, watch, onMounted} from "vue";
import {TableState, TableStateFilters} from "ant-design-vue/es/table/interface";
import {getListImageApi, updateStatusImageApi} from "@/services/apis/image.api";
import FallbackConstants from "@/constants/fallback.constants";
import moment from "moment";

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
    title: "Updated by",
    key: "updatedBy",
    align: "center",
    dataIndex: ["updatedBy", "email"],
    width: 200,
    sorter: true,
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
    value: "reject",
    label: "Rejected",
  },
  {
    value: "delete",
    label: "Deleted",
  },
];

export default defineComponent({
  name: "ImagesManagement",
  setup() {
    /* ----------------------- variables -------------------------*/
    const userRole = localStorage.getItem("role");
    //variables for table
    const rawData = ref<RawData[]>([]);
    const dataTable = ref<DataTable[]>([]);
    const select = ref<string>("");
    const sort = ref<string>("");
    const isLoading = ref<boolean>(false);
    const imageFallback = FallbackConstants.IMAGE_FALLBACK;

    //variables for pagination
    const currentPage = ref<number | undefined>(1);
    const pageSize = 20;
    const totalItem = ref<number>(0);

    /* ------------------------- functions ----------------------*/
    const pagination = computed(() => ({
      total: totalItem.value,
      current: currentPage.value,
      pageSize: pageSize,
    }));

    const handleChangeFilter = (value: string) => {
      select.value = value;
      getListImages({
        page: 1,
        pageSize: pageSize,
        sort: sort.value,
        status: select.value === "" ? undefined : select.value
      });
    };

    const checkModalType = (type: string) => {
      if (type === "pending") return "pending";
      else if (type === "approv") {
        return "approved";
      } else if (type === "reject") {
        return "reject";
      } else return "delete";
    };

    const showConfirm = (type: string, data: DataTable) => {
      Modal.confirm({
        title: `Do you want this image to be ${type !== "pending" ? type + "ed" : "pending"}?`,
        content: `When the OK button is clicked, this image will be ${type !== "pending" ? type + "ed" : "pending"}.`,
        onOk() {
          updateStatusImage({imageId: data.id, status: checkModalType(type)});
        },
        onCancel() {
        },
      });
    };

    const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: any) => {
      const sortOrder = sorter.order === "ascend" ? 1 : -1;
      sort.value = sorter.order ? `${sorter.columnKey}:${sortOrder}` : "";
      currentPage.value = page?.current;
      getListImages({
        page: currentPage.value || 1,
        pageSize: pageSize,
        sort: sort.value,
        status: select.value === "" ? undefined : select.value
      });
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

    const updateStatusImage = ({imageId, status}: { imageId: string, status: string }) => {
      isLoading.value = true;
      updateStatusImageApi({imageId: imageId, status: status}).then(() => {
        getListImages({
          page: currentPage.value || 1,
          pageSize,
          sort: sort.value,
          status: select.value === "" ? undefined : select.value
        });
      }).catch((e) => {
        isLoading.value = false;
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
      });
    };

    const renderTime = (data: string | undefined) => {
      if (!data) return null;
      return moment(data).utc(false).format("HH:mm:ss - DD/MM/YYYY");
    };

    /*---------------------------- hooks --------------------------*/
    onMounted(() => getListImages({
      page: currentPage.value || 1,
      pageSize,
      sort: sort.value,
      status: select.value === "" ? undefined : select.value
    }));
    watch(rawData, convertDataToTable);

    return {
      isLoading,
      filterOptions,
      dataTable,
      select,
      columns,
      pagination,
      pageSize,
      imageFallback,
      userRole,
      handleChangeFilter,
      showConfirm,
      handleTableChange,
      renderTime,
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

  .placeholder-image {
    height: 100px;
  }
}
</style>