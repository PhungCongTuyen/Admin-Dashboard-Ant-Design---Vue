<template>
  <div class="awards-management-container">
    <div class="awards-management-options-bar">
      <span class="awards-management-options-label">Filter: </span>
      <a-select
          v-model:value="select"
          style="width: 120px"
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
          >
            <template #placeholder>
              <a-image
                :src="imageFallback"
                :style="{ width: '128px' }"
              />
            </template>
          </a-image>
        </a-col>
        <a-col :span="16">
          <div :style="{ fontWeight: 'bold' }">
            Award:
          </div>
          <a-select
              v-model:value="award"
              style="width: 100%"
              :options="awardOptions"
          />
          <div :style="{ fontWeight: 'bold' }">
            Description:
          </div>
          <a-textarea
              v-model:value="description"
              placeholder="Description..."
              :auto-size="{ minRows: 2, maxRows: 10 }"
              :disabled="true"
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
        :loading="isLoading"
    >
      <template #no="{ index }">
        <span>{{
            (pagination.current - 1) * pagination.pageSize + index + 1
          }}</span>
      </template>
      <template #image="{ record }">
        <a-image
            :src="record.link"
            :width="70"
            :style="{minHeight: '70px'}"
        >
          <template #placeholder>
            <a-image
                :src="imageFallback"
                :width="70"
                :height="70"
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
              @click="handleOpenModal(record)"
          >
            Edit Award
          </a-button>
          <a-button
              v-if="record.award"
              :style="{ marginRight: '10px' }"
              danger
              type="primary"
              @click="showConfirm(record)"
          >
            Reset Award
          </a-button>
        </span>
      </template>
      <template #imageCreatedTime="{record}">
        <span>{{ renderTime(record?.createdAt) }}</span>
      </template>
      <template #imageUpdatedTime="{record}">
        <span>{{ renderTime(record?.updatedAt) }}</span>
      </template>
      <template #awardImage="{ record }">
        <a-image
            :src="record?.award?.link"
            :width="70"
            :style="{minHeight: '70px'}"
        >
          <template #placeholder v-if="record.award?.link">
            <a-image
                :src="imageFallback"
                :width="70"
                :height="70"
                :preview="false"
            />
          </template>
        </a-image>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {message, Modal} from "ant-design-vue";
import {defineComponent, ref, computed, watch, onMounted} from "vue";
import {
  TableState,
  TableStateFilters,
} from "ant-design-vue/es/table/interface";
import FallbackConstants from "../constants/fallback.constants";
import {getListImageAwardApi} from "@/services/apis/image.api";
import moment from "moment";
import {assignAward, getListAwardsApi, unassignedAward} from "@/services/apis/award.api";

type Pagination = TableState["pagination"];


interface DataTable {
  key?: string | number;
  customer: {
    createdAt: string;
    customerId: string;
    deleted: boolean
    email: string,
    id: string
    isFirstPublish: boolean
    nickName: string
    updatedAt: string
  },
  award?: {
    createdAt: string;
    deleted: boolean;
    description?: string;
    id: string;
    link: string;
    name: string;
    updatedAt: string;
  },
  createdAt: string;
  id: string;
  link: string;
  status: string;
  totalLike: number;
  updatedAt: string;
}

interface RawData {
  customer: {
    createdAt: string;
    customerId: string;
    deleted: boolean
    email: string,
    id: string
    isFirstPublish: boolean
    nickName: string
    updatedAt: string
  },
  award?: {
    createdAt: string;
    deleted: boolean;
    description?: string;
    id: string;
    link: string;
    name: string;
    updatedAt: string;
  },
  createdAt: string;
  id: string;
  link: string;
  status: string;
  totalLike: number;
  updatedAt: string;
}

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

interface Award {
  createdAt: string;
  deleted: boolean;
  description?: string;
  id: string;
  link: string;
  name: string;
  updatedAt: string;
}

interface AwardOption {
  value: string;
  label: string;
}


const filterOptions = [
  {
    value: "0",
    label: "All",
  },
  {
    value: "1",
    label: "Assigned Award",
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
    slots: {customRender: "imageUpdatedTime"}
  },
  {
    title: "Award's Name",
    key: "awardName",
    dataIndex: ["award", "name"],
    align: "center",
    width: 150,
    sorter: true
  },
  {
    title: "Award's Icon",
    key: "award-icon",
    dataIndex: ["award", "link"],
    align: "center",
    width: 100,
    slots: {customRender: "awardImage"}
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



export default defineComponent({
  name: "AwardsManagement",
  setup() {
    /* ----------------------- variables -------------------------*/
    const rawData = ref<RawData[]>([]);
    const imageFallback = FallbackConstants.IMAGE_FALLBACK;
    const dataTable = ref<DataTable[]>([]);
    const isLoading = ref<boolean>(false);
    const select = ref<string>("0");
    const sort = ref<string>("");

    //variables for modal
    const imageURL = ref<string | undefined>("");
    const description = ref<string | undefined>("");
    const award = ref<string | undefined>("");
    const id = ref<string>("");
    const showModal = ref<boolean>(false);
    const awardOptions = ref<AwardOption[]>([]);
    const originalAward = ref<Award[]>([]);

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

    const showConfirm = (data: DataTable) => {
      Modal.confirm({
        title: "Do you want to reset award of this image?",
        content:
            "When the OK button is clicked, the award of this image will be unassigned.",
        onOk() {
          isLoading.value = true;
          unassignedAward(data.id).then(() => {
            getListImagesAward({
              page: currentPage.value || 1,
              pageSize,
              sort: sort.value,
              awarded: select.value
            });
          }).catch((e) => {
            message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
            isLoading.value = false;
          });
        },
        onCancel() {
        },
      });
    };

    const handleChangeFilter = (value: string) => {
      select.value = value;
      getListImagesAward({
        page: 1,
        pageSize: pageSize,
        sort: sort.value,
        awarded: select.value,
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
      getListImagesAward({
        page: currentPage.value || 1,
        pageSize: pageSize,
        sort: sort.value,
        awarded: select.value
      });
    };

    const handleOpenModal = (record: RawData) => {
      showModal.value = true;
      id.value = record.id;
    };

    const handleCloseModal = () => {
      showModal.value = false;
      id.value = "";
    };

    const handleOk = () => {
      if (!award.value) return;
      assignAward({awardId: award.value, imageId: id.value}).then(() => {
        message.success("Assigned Award!");
        getListImagesAward({
          page: currentPage.value || 1,
          pageSize,
          sort: sort.value,
          awarded: select.value
        });
        showModal.value = false;
      }).catch((e) => {
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
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

    const getListAward = ({
                            page,
                            pageSize,
                            sort,
                            search
                          }: {
      page?: number,
      pageSize?: number,
      sort?: string,
      search?: string,
    }) => {
      isLoading.value = true;
      getListAwardsApi({
        page,
        pageSize,
        sort,
        search,
      }).then((res) => {
        originalAward.value = res.data.data;
        awardOptions.value = res.data.data?.map((item: Award) => {
          return {
            value: item.id,
            label: item.name
          };
        });
      }).catch((e) => {
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
      });
    };

    const renderDescriptionAndImage = () => {
      imageURL.value = originalAward.value.filter((i) => i.id === award.value)[0]?.link;
      description.value = originalAward.value.filter((i) => i.id === award.value)[0]?.description;
    };

    const renderTime = (data: string | undefined) => {
      if (!data) return null;
      return moment(data).utc(false).format("HH:mm:ss - DD/MM/YYYY");
    };

    /*---------------------------- hooks ---------------------------*/
    onMounted(() =>
      getListImagesAward({
        page: 1,
        pageSize,
        sort: sort.value,
        awarded: select.value
      })
    );
    onMounted(() => getListAward({}));
    watch(rawData, convertDataToTable);
    watch(showModal, () => {award.value = awardOptions.value[0].value;});
    watch(award, renderDescriptionAndImage);

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
      isLoading,
      awardOptions,
      filterOptions,
      handleChangeFilter,
      renderTime,
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
  }
}
</style>
