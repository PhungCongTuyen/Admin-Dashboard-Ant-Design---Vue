<template>
  <div class="award-settings-container">
    <div class="award-settings-options-bar">
      <span class="award-settings-options-label">Search: </span>
      <a-input placeholder="Award's name" style="width: 200px" v-model:value="searchInput">
        <template #suffix>
          <search-outlined/>
        </template>
      </a-input>
      <a-modal
          width="700px"
          :title="titleOfModal"
          :visible="showModal"
          :confirm-loading="confirmLoading"
          @ok="handleOk"
          @cancel="handleCancel"
          :afterClose="handleResetModal"
          okText="Save"
      >
        <a-row>
          <a-col :span="8">
            <a-upload
                name="award"
                list-type="picture-card"
                :style="{width: '128px', maxHeight: '128px'}"
                :show-upload-list="false"
                :file-list="fileList"
                :custom-request="() => {return true}"
                :before-upload="beforeUpload"
                @change="handleUploadImage"
                accept="image/*"
            >
              <img v-if="imageURL" :src="imageURL" alt="avatar" :style="{width: '128px'}"/>
              <div v-else :style="{width: '128px', height: '128px'}">
                <plus-outlined :style="{transform: 'scale(1.5)', marginTop: '50px'}"/>
                <div class="ant-upload-text">
                  Upload
                </div>
              </div>
            </a-upload>
          </a-col>
          <a-col :span="16">
            <div :style="{fontWeight: 'bold'}">Name:</div>
            <a-input placeholder="Name of award..." v-model:value="awardName" :style="{marginBottom: '20px'}"/>
            <div :style="{fontWeight: 'bold'}">Description:</div>
            <a-textarea placeholder="Description..." v-model:value="awardDescription"
                        :auto-size="{ minRows: 2, maxRows: 10 }"/>
          </a-col>
        </a-row>
      </a-modal>
      <a-button type="primary" :style="{marginLeft: '10px'}" @click="onOpenModal('create', 'Create New Award')">
        <plus-circle-outlined/>
        Create New Award
      </a-button>
    </div>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }"
        bordered
        @change="handleTableChange"
        :pagination="pagination">
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
      </template>
      <template #actions="{record, index}">
        <a-button @click="onOpenModal('edit', 'Edit Award', record, index)" :style="{marginRight: '10px'}"
                  type="primary">Edit
        </a-button>
        <a-button @click="onDeleteRow(record, index)" danger type="primary">Delete</a-button>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import debounce from 'lodash/debounce';
import {Modal, message} from 'ant-design-vue';
import {defineComponent, watch, ref, computed} from "vue";
import {TableState, TableStateFilters} from 'ant-design-vue/es/table/interface';

type Pagination = TableState['pagination'];

interface RawData {
  name: string,
  description: string
}

//
// interface DataTable {
//   key?: string,
//   name?: string,
//   description?: string
// }

const columns = [
  {
    title: 'No.',
    key: 'index',
    align: 'center',
    width: 30,
    slots: {customRender: 'no'}
  },
  {
    title: "Award's Name",
    key: 'name',
    dataIndex: 'name',
    align: 'center',
    width: 100,
  },
  {
    title: "Award's Description",
    key: 'description',
    dataIndex: 'description',
    align: 'center',
    width: 200,
  },
  {
    title: "Award's Icon",
    key: 'icon',
    align: 'center',
    width: 100,
  },
  {
    title: "Actions",
    key: 'actions',
    align: 'center',
    width: 70,
    slots: {customRender: 'actions'}
  },
];

export default defineComponent({
  name: "AwardSettings",
  setup() {
    /*--------------------------- variables ---------------------------*/
    const rawData = [{name: 'pending', description: 'abciasjdoijaojasd'}, {
      name: 'penádasdasdasdasdding',
      description: 'abciasjdoádasdasdasdasdaijaojasd'
    }];
    const dataTable = rawData.map((prev: RawData, index: number) => {
      return {
        ...prev,
        key: index
      }
    });
    // const debouncedGetAnswer = () => _.debounce(search, 5000)
    const searchInput = ref<string>('');
    const typeModal = ref<string>('');
    const current = ref<number | undefined>(1);
    const pageSize = 20;
    const total = ref(dataTable.length);
    const titleOfModal = ref("Create New Award");
    const showModal = ref(false);
    const confirmLoading = ref(false);
    const imageURL = ref('');
    const fileList = ref([]);
    const awardName = ref("");
    const awardDescription = ref("");

    /*--------------------------- functions ---------------------------*/
    const pagination = computed(() => ({
      total: total.value,
      current: current.value,
      pageSize: pageSize,
    }));

    const onSearch = debounce((e) => console.log(e, "300 down"), 300);

    const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: any) => {
      current.value = page?.current
      console.log("page", page?.current);
      console.log("filters", filters);
      console.log("sorter", sorter);
    };

    const onOpenModal = (type: string, title: string, record?: any, index?: number) => {
      console.log(record);
      titleOfModal.value = title;
      typeModal.value = type;
      showModal.value = true;
      if (type === 'edit') {
        awardName.value = record.name
        awardDescription.value = record.description
      } else {
        awardName.value = ""
        awardDescription.value = ""
      }
      console.log(record, index);
    };

    const onDeleteRow = (record, index) => {
      Modal.confirm({
        title: `Do you want to delete this award?`,
        content: 'When clicked the OK button, this dialog will be closed after 1 second',
        onOk() {
          console.log("data", record);
          console.log("index", index);
        },
        onCancel() {
        },
      })
    };

    const handleResetModal = () => {
      fileList.value = [];
      imageURL.value = "";
    };

    const handleOk = () => {
      showModal.value = false;
    };

    const handleCancel = () => {
      showModal.value = false
    };
    // functions for upload image
    const handleUploadImage = (e) => {
      if (e.file.type !== 'image/jpeg' && e.file.type !== 'image/png') return;
      const reader = new FileReader();
      reader.onload = () => {
        imageURL.value = reader.result
      }
      reader.readAsDataURL(e.file.originFileObj);
    };

    const beforeUpload = (file) =>  {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('You can only upload JPG or PNG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Image must smaller than 2MB!');
      }
      return isJpgOrPng && isLt2M;
    };

    /*--------------------------- hooks ---------------------------*/
    watch(searchInput, onSearch);
    // watch(current, console.log('call api with current', current));

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
      handleTableChange,
      onDeleteRow,
      onOpenModal,
      handleResetModal,
      handleOk,
      handleUploadImage,
      beforeUpload,
      handleCancel
    }
  },
})
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