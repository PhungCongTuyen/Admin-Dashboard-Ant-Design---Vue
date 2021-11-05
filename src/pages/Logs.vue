<template>
  <div class="logs-container">
    <a-form autoComplete="false" class="logs-options-bar">
      <span>Search: </span>
      <a-input placeholder="Email" style="width: 200px" v-model:value="userEmail" :style="{marginLeft: '10px'}"
               autoComplete="off" name="search" :disabled="isLoading">
        <template #suffix>
          <search-outlined/>
        </template>
      </a-input>
      <span :style="{marginLeft: '10px'}">Timeline: </span>
      <a-range-picker :style="{marginLeft: '10px', maxWidth: '300px'}"
                      :disabled="isLoading"
                      v-model:value="date"
                      :format="dateFormat" :allowClear="false"
                      @change="handleChangeDate"
                      :inputReadOnly="true"
      />
    </a-form>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1920, y: 'calc(100vh - 350px)' }"
        bordered
        size="small"
        class="ant-table-striped"
        @change="handleTableChange"
        :pagination="pagination"
        :loading="isLoading"
        :rowClassName="(record) => {
         if (['login', 'logout'].includes(record.action)) return 'table-striped';
         if (record.action === 'reject') return 'table-striped-reject'
         if (record.action === 'delete') return 'table-striped-delete'
        }"
    >
      <template #image="{ record }">
        <a-image
            :src="record?.image?.link"
            :width="100"
            :style="{minHeight: '100px'}"
        >
          <template #placeholder v-if="record.image?.link">
            <a-image
                :src="imageFallback"
                :width="100"
                :height="100"
                :preview="false"
            />
          </template>
        </a-image>
      </template>
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
      </template>
      <template #actionTime="{record}">
        <span>{{ renderTime(record.createdAt) }}</span>
      </template>
      <template #imageCreatedTime="{record}">
        <span>{{ renderTime(record?.image?.createdAt) }}</span>
      </template>
      <template #imageUpdatedTime="{record}">
        <span>{{ renderTime(record?.image?.updatedAt) }}</span>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import moment, {Moment} from "moment";
import {computed, defineComponent, onMounted, ref, watch} from "vue";
import {TableState} from "ant-design-vue/es/table/interface";
import {getListLogsApi} from "@/services/apis/logs.api";
import {message} from "ant-design-vue";
import debounce from "lodash/debounce";
import FallbackConstants from "@/constants/fallback.constants";


type Pagination = TableState["pagination"];

interface RawData {
  createdAt: string;
  email: string;
  id: string;
  password: string;
  role: string;
  updatedAt: string;
  deleted: boolean;
}

interface ConvertedRawData {
  createdAt: string;
  key: number;
  email: string;
  id: string;
  password: string;
  role: string;
  updatedAt: string;
  deleted: boolean;
}


const columns = [
  {
    title: "No.",
    key: "no",
    align: "center",
    width: 50,
    slots: {customRender: "no"}
  },
  {
    title: "Email",
    key: "email",
    dataIndex: ["user", "email"],
    align: "center",
    width: 200,
  },
  {
    title: "Action",
    key: "action",
    dataIndex: "action",
    align: "center",
    width: 100,
  },
  {
    title: "Action Created At",
    key: "action",
    dataIndex: "createdAt",
    align: "center",
    width: 100,
    slots: {customRender: "actionTime"}
  },
  {
    title: "Customer's Email",
    key: "customer-email",
    dataIndex: ["customer", "email"],
    align: "center",
    width: 100,
  },
  {
    title: "Nickname",
    key: "nickname",
    dataIndex: ["customer", "nickName"],
    align: "center",
    width: 100,
  },
  {
    title: "Images Management",
    key: "images-management",
    align: "center",
    children: [
      {
        title: "Image",
        key: "image",
        align: "center",
        dataIndex: ["image", "link"],
        slots: {customRender: "image"},
        width: 100
      },
      {
        title: "Total Like",
        key: "total-like",
        align: "center",
        dataIndex: ["image", "totalLike"],
        width: 100,
      },
      {
        title: "Image's Status",
        key: "image-status",
        align: "center",
        dataIndex: ["image", "status"],
        width: 100,
      },
      {
        title: "Created At",
        key: "image-created-at",
        align: "center",
        dataIndex: ["image", "createdAt"],
        slots: {customRender: "imageCreatedTime"},
        width: 100,
      },
      {
        title: "Updated At",
        key: "image-updated-at",
        align: "center",
        dataIndex: ["image", "updatedAt"],
        slots: {customRender: "imageUpdatedTime"},
        width: 100,
      }
    ]
  }
];

export default defineComponent({
  name: "Logs",
  setup() {
    //variables for data
    const rawData = ref<RawData[]>([]);
    const dataTable = ref<ConvertedRawData[]>([]);
    const isLoading = ref<boolean>(false);
    const imageFallback = FallbackConstants.IMAGE_FALLBACK;

    //variables for pagination
    const currentPage = ref<number | undefined>(1);
    const pageSize = 20;
    const totalItem = ref<number>(0);

    //variables for search
    const dateFormat = "DD/MM/YYYY";
    const userEmail = ref<string>("");
    const date = ref<Moment[]>([moment(new Date(), dateFormat).startOf("month").startOf("day"), moment(new Date(), dateFormat).endOf("month").endOf("day")]);

    /*------------------------------- functions -----------------------------*/
    const onSearch = debounce((e) => {
      userEmail.value = e;
      currentPage.value = 1;
      getListLogs({
        page: currentPage.value || 1,
        pageSize,
        dateStart: date.value[0].unix(),
        dateEnd: date.value[1].unix(),
        userEmail: e
      });
    }, 1000);

    const pagination = computed(() => ({
      total: totalItem.value,
      current: currentPage.value,
      pageSize: pageSize,
    }));

    const handleTableChange = (page: Pagination) => {
      currentPage.value = page?.current;
      getListLogs({
        page: currentPage.value || 1,
        pageSize,
        dateStart: date.value[0].unix(),
        dateEnd: date.value[1].unix(),
        userEmail: userEmail.value
      });

    };

    const getListLogs = ({
                           page,
                           pageSize,
                           dateStart,
                           dateEnd,
                           userEmail
                         }: { page: number, pageSize: number, dateStart: number, dateEnd: number, userEmail: string }) => {
      isLoading.value = true;
      getListLogsApi({
        page: page,
        pageSize: pageSize,
        dateStart: dateStart,
        dateEnd: dateEnd,
        userEmail: userEmail
      }).then((res) => {
        isLoading.value = false;
        rawData.value = res.data.data;
        totalItem.value = res.data.totalItem;
      }).catch((e) => {
        isLoading.value = false;
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

    const renderTime = (data: string | undefined) => {
      if (!data) return null;
      return moment(data).format("HH:mm:ss - DD/MM/YYYY");
    };

    const handleChangeDate = (dateOrg: string, dateString: string) => {
      if (!dateOrg || !dateString) return;
      getListLogs({
        page: currentPage.value || 1,
        pageSize,
        dateStart: moment(dateString[0], dateFormat).startOf("day").unix(),
        dateEnd: moment(dateString[1], dateFormat).endOf("day").unix(),
        userEmail: userEmail.value
      });
    };

    /*------------------------------- hooks -----------------------------*/
    onMounted(() => getListLogs({
      page: currentPage.value || 1,
      pageSize,
      dateStart: date.value[0].unix(),
      dateEnd: date.value[1].unix(),
      userEmail: userEmail.value,
    }));
    watch(userEmail, onSearch);
    watch(rawData, convertDataToTable);

    return {
      columns,
      dataTable,
      pagination,
      date,
      userEmail,
      dateFormat,
      isLoading,
      imageFallback,
      handleTableChange,
      renderTime,
      handleChangeDate
    };
  }
});
</script>

<style scoped lang="scss">
.logs-container {
  .logs-options-bar {
    margin-bottom: 20px;
  }
}

.ant-table-striped :deep(.table-striped) td {
  background-color: #b3e5ff;
}

.ant-table-striped :deep(.table-striped-reject) td {
  background-color: #ffe3b3;
}
.ant-table-striped :deep(.table-striped-delete) td {
  background-color: #ffb3c0;
}
</style>