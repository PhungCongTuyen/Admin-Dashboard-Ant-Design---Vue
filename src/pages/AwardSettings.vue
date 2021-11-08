<template>
  <div class="award-settings-container">
    <div class="award-settings-options-bar">
      <span class="award-settings-options-label">Search: </span>
      <a-input
          v-model:value="searchInput"
          placeholder="Award's name"
          style="width: 200px"
          :disabled="isLoading"
      >
        <template #suffix>
          <search-outlined/>
        </template>
      </a-input>
      <a-modal
          width="700px"
          :title="titleOfModal"
          :visible="showModal"
          :confirm-loading="confirmLoading"
          :after-close="handleResetModal"
          ok-text="Save"
          @ok="handleOk"
          @cancel="handleCancel"
      >
        <a-row>
          <a-col :span="8">
            <a-upload
                name="award"
                list-type="picture-card"
                :style="{ width: '128px', maxHeight: '128px' }"
                :show-upload-list="false"
                :file-list="fileList"
                :custom-request="
                () => {
                  return true;
                }
              "
                :before-upload="beforeUpload"
                accept="image/*"
                @change="handleUploadImage"
            >
              <img
                  v-if="imageURL"
                  :src="imageURL"
                  alt="avatar"
                  :style="{ width: '128px' }"
              >
              <div
                  v-else
                  :style="{ width: '128px', height: '128px' }"
              >
                <plus-outlined
                    :style="{ transform: 'scale(1.5)', marginTop: '50px' }"
                />
                <div class="ant-upload-text">
                  Upload
                </div>
              </div>
            </a-upload>
          </a-col>
          <a-col :span="16">
            <div :style="{ fontWeight: 'bold' }">
              Name:
            </div>
            <a-input
                v-model:value="awardName"
                placeholder="Name of award..."
                :style="{ marginBottom: '20px' }"
            />
            <div :style="{ fontWeight: 'bold' }">
              Description:
            </div>
            <a-textarea
                v-model:value="awardDescription"
                placeholder="Description..."
                :auto-size="{ minRows: 2, maxRows: 10 }"
            />
          </a-col>
        </a-row>
      </a-modal>
      <a-button
          :disabled="isLoading"
          type="primary"
          :style="{ marginLeft: '10px' }"
          @click="onOpenModal('create', 'Create New Award')"
      >
        <plus-circle-outlined/>
        Create New Award
      </a-button>
    </div>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }"
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
        <a-button
            :style="{ marginRight: '10px' }"
            type="primary"
            @click="onOpenModal('edit', 'Edit Award', record)"
        >
          Edit
        </a-button>
        <a-button
            danger
            type="primary"
            @click="onDeleteRow(record.id)"
        >
          Delete
        </a-button>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import debounce from "lodash/debounce";
import {Modal, message} from "ant-design-vue";
import {defineComponent, watch, ref, computed, onMounted} from "vue";
import {getListAwardsApi, deleteAwardApi, createAwardApi, editAwardApi} from "@/services/apis/award.api";
import FallbackConstants from "@/constants/fallback.constants";
import {dataURItoBlob} from "@/utils/dataToUriBlob";
import {
  TableState,
  TableStateFilters,
} from "ant-design-vue/es/table/interface";

type Pagination = TableState["pagination"];

interface FileItem {
  uid: string;
  name?: string;
  status?: string;
  response?: string;
  url?: string;
  type?: string;
  size: number;
  originFileObj: any;
}

interface FileInfo {
  file: FileItem;
  fileList: FileItem[];
}

interface RawData {
  createdAt: string;
  deleted: boolean;
  description: string;
  id: string;
  link: string;
  name: string;
  updatedAt: string;
}

interface ConvertedData {
  key: number;
  createdAt: string;
  deleted: boolean;
  description: string;
  id: string;
  link: string;
  name: string;
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


const columns = [
  {
    title: "No.",
    key: "index",
    align: "center",
    width: 30,
    slots: {customRender: "no"},
  },
  {
    title: "Award's Name",
    key: "name",
    dataIndex: "name",
    align: "center",
    width: 100,
    sorter: true,
  },
  {
    title: "Award's Description",
    key: "description",
    dataIndex: "description",
    align: "center",
    width: 200,
    sorter: true,
  },
  {
    title: "Award's Icon",
    key: "link",
    dataIndex: "link",
    align: "center",
    width: 100,
    slots: {
      customRender: "image"
    }
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
    width: 70,
    slots: {customRender: "actions"},
  },
];

export default defineComponent({
  name: "AwardSettings",
  setup() {
    /*--------------------------- variables ---------------------------*/
    //variables for data table
    const rawData = ref<RawData[]>([]);
    const dataTable = ref<ConvertedData[]>([]);
    const searchInput = ref<string>("");
    const sort = ref<string>("");
    const isLoading = ref<boolean>(false);

    // variables for pagination
    const currentPage = ref<number | undefined>(1);
    const pageSize = 20;
    const totalItem = ref<number>(0);

    // variables for modal
    const awardName = ref<string>("");
    const awardDescription = ref<string>("");
    const typeModal = ref<string>("");
    const titleOfModal = ref("Create New Award");
    const showModal = ref(false);
    const confirmLoading = ref(false);
    const imageURL = ref<string>("");
    const id = ref<string>("");
    const fileList = ref<FileItem[]>([]);
    const imageFallback = FallbackConstants.IMAGE_FALLBACK;

    /*--------------------------- functions ---------------------------*/
    const pagination = computed(() => ({
      total: totalItem.value,
      current: currentPage.value,
      pageSize: pageSize,
    }));

    const onSearch = debounce((e) => {
      searchInput.value = e;
      currentPage.value = 1;
      getListAward({page: currentPage.value || 1, pageSize, sort: sort.value, search: e});
    }, 1000);

    const handleTableChange = (
        page: Pagination,
        filters: TableStateFilters,
        sorter: Sorter
    ) => {
      const sortOrder = sorter.order === "ascend" ? 1 : -1;
      sort.value = sorter.order ? `${sorter.field}:${sortOrder}` : "";
      currentPage.value = page?.current;
      getListAward({
        page: currentPage.value || 1,
        pageSize,
        sort: sort.value,
        search: searchInput.value
      });
    };

    const onOpenModal = (
        type: string,
        title: string,
        record?: any
    ) => {
      titleOfModal.value = title;
      typeModal.value = type;
      showModal.value = true;
      if (type === "edit") {
        id.value = record.id;
        imageURL.value = record.link;
        awardName.value = record.name;
        awardDescription.value = record.description;
      } else {
        id.value = "";
        imageURL.value = "";
        awardName.value = "";
        awardDescription.value = "";
      }
    };

    const onDeleteRow = (id: string) => {
      Modal.confirm({
        title: "Do you want to delete this award?",
        content:
            "When the OK button is clicked, this award will be deleted.",
        onOk() {
          isLoading.value = true;
          deleteAward({id: id});
        },
        onCancel() {
        },
      });
    };

    const handleResetModal = () => {
      fileList.value = [];
      imageURL.value = "";
      awardName.value = "";
      awardDescription.value = "";
    };

    const handleOk = () => {
      if (!awardName.value || !imageURL.value) {
        message.error("Award's name and Image are required!");
        return;
      }
      const formData = new FormData();
      const blob = dataURItoBlob(imageURL.value);
      const fileName = fileList.value[0].name;
      formData.append("name", awardName.value);
      formData.append("description", awardDescription.value);
      formData.append("image", blob, fileName);
      if (typeModal.value === "create") {
        createAwardApi(formData).then(() => {
          showModal.value = false;
          message.success("Create new award success!");
          getListAward({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
        }).catch((e) => {
          message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
        });
      } else {
        editAwardApi(formData, id.value).then(() => {
          showModal.value = false;
          message.success("Edit award success!");
          getListAward({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
        }).catch((e) => {
          message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
        });
      }
    };

    const handleCancel = () => {
      showModal.value = false;
    };

    // functions for upload image

    const handleUploadImage = (e: FileInfo) => {
      fileList.value = e.fileList;
      if (e.file.type !== "image/jpeg" && e.file.type !== "image/png") return;
      const reader = new FileReader();
      reader.onload = () => {
        imageURL.value = reader.result as string;
        console.log(btoa(reader.result as string));

      };
      reader.readAsDataURL(e.file.originFileObj);
    };

    const beforeUpload = (file: FileItem) => {
      const isJpgOrPng =
          file.type === "image/jpeg" || file.type === "image/png";
      if (!isJpgOrPng) {
        message.error("You can only upload JPG or PNG file!");
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error("Image must smaller than 2MB!");
      }
      return isJpgOrPng && isLt2M;
    };

    const convertDataToTable = () => {
      dataTable.value = rawData.value?.map((prev: RawData, index: number) => {
        return {
          ...prev,
          key: index
        };
      });
    };

    const getListAward = ({
                            page,
                            pageSize,
                            sort,
                            search
                          }: {
      page: number,
      pageSize: number,
      sort: string,
      search: string,
    }) => {
      isLoading.value = true;
      getListAwardsApi({
        page,
        pageSize,
        sort,
        search,
      }).then((res) => {
        rawData.value = res.data.data;
        totalItem.value = res.data.totalItem;
        isLoading.value = false;
      }).catch((e) => {
        isLoading.value = false;
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
      });
    };

    const deleteAward = ({id}: { id: string }) => {
      isLoading.value = true;
      deleteAwardApi({id: id}).then(() => {
        message.success("Deleted!");
        getListAward({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
      }).catch((e) => {
        message.error(typeof e.response.data.message === "string" ? e.response.data.message : "Bad Request!");
        isLoading.value = false;
      });
    };

    /*--------------------------- hooks ---------------------------*/
    onMounted(() => getListAward({
      page: currentPage.value || 1,
      pageSize,
      sort: sort.value,
      search: searchInput.value
    }));
    watch(searchInput, onSearch);
    watch(rawData, convertDataToTable);

    return {
      searchInput,
      dataTable,
      titleOfModal,
      showModal,
      confirmLoading,
      imageURL,
      fileList,
      awardName,
      awardDescription,
      columns,
      pagination,
      isLoading,
      imageFallback,
      handleTableChange,
      onDeleteRow,
      onOpenModal,
      handleResetModal,
      handleOk,
      handleUploadImage,
      beforeUpload,
      handleCancel,
    };
  },
});
</script>

<style scoped lang="scss">
.award-settings-container {
  .award-settings-options-bar {
    margin-bottom: 20px;
    display: flex;
    align-items: center;

    .award-settings-options-label {
      margin-right: 10px;
    }

    .award-name {
      margin-bottom: 20px;
    }
  }
}
</style>
