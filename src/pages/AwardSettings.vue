<template>
  <div class="award-settings-container">
    <div class="award-settings-options-bar">
      <span class="award-settings-options-label">Search: </span>
      <a-input placeholder="Award's name" style="width: 200px" @search="onSearch" v-model="searchInput">
        <a-icon slot="suffix" type="search"/>
      </a-input>
      <a-modal
          width="700px"
          :title="titleOfModal"
          :visible="showModal"
          :confirm-loading="confirmLoading"
          @ok="handleOk"
          @cancel="handleCancel"
          :afterClose="handleResetModal"
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
                <a-icon type="plus" :style="{marginTop: '40%'}"/>
                <div class="ant-upload-text">
                  Upload
                </div>
              </div>
            </a-upload>
          </a-col>
          <a-col :span="16">
            <div :style="{fontWeight: 'bold'}">Name:</div>
            <a-input placeholder="Name of award..." v-model="awardName" :style="{marginBottom: '20px'}"/>
            <div :style="{fontWeight: 'bold'}">Description:</div>
            <a-textarea placeholder="Description..." v-model="awardDescription" :auto-size="{ minRows: 2, maxRows: 10 }"/>
          </a-col>
        </a-row>
      </a-modal>
      <a-button type="primary" :style="{marginLeft: '10px'}" @click="onOpenModal('create', 'Create New Award')">
        <a-icon type="plus-circle"/>
        Create New Award
      </a-button>
    </div>
    <a-table :columns="columns" :data-source="dataTable" :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }" bordered
             @change="onTableSort"
             :pagination="{current, total, pageSize, onChangePage}">
      <div slot="action" slot-scope="text, record, index">
        <a-button @click="onOpenModal('edit', 'Edit Award', record, index)" :style="{marginRight: '10px'}"
                  type="primary">Edit
        </a-button>
        <a-button @click="onDeleteRow(record, index)" type="danger">Delete</a-button>
      </div>
    </a-table>
  </div>
</template>

<script>
import _ from 'lodash';

export default {
  name: "AwardSettings",
  computed: {
    columns() {
      const columns = [
        {
          title: 'No.',
          key: 'index',
          align: 'center',
          width: 30,
          customRender: (text, record, index) => {
            return (this.current - 1) * this.pageSize + index + 1;
          }
        },
        {
          title: "Award's Name",
          key: 'name',
          dataIndex: 'name',
          align: 'center',
          width: 100,
          // customRender: (text, record, index) => {
          //   return index + 1;
          // }
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
          key: 'action',
          align: 'center',
          width: 70,
          scopedSlots: {customRender: 'action'}
        },
      ];
      return columns;
    }
  },
  mounted() {
    this.dataTable = this.rawData.map((prev, index) => {
      return {
        ...prev,
        key: index
      }
    })
  },
  data() {
    const rawData = [{name: 'pending', description: 'abciasjdoijaojasd'}, {name: 'penádasdasdasdasdding', description: 'abciasjdoádasdasdasdasdaijaojasd'}];
    const dataTable = [];
    return {
      searchInput: '',
      current: 1,
      total: dataTable?.length,
      pageSize: 20,
      rawData,
      dataTable,
      titleOfModal: "Create New Award",
      showModal: false,
      confirmLoading: false,
      imageURL: "",
      fileList: [],
      awardName: "",
      awardDescription: "",
    }
  },
  created: function () {
    this.debouncedGetAnswer = _.debounce(this.onSearch, 1000)
  },
  watch: {
    searchInput: function () {
      this.debouncedGetAnswer()
    }
  },
  methods: {
    // functions for table
    onSearch() {
      console.log(this.searchInput);
    },
    onChangePage(selectedPage) {
      this.current = selectedPage
    },
    onTableSort(props, _, sort) {
      console.log(sort);
    },
    handleSort(type, sort) {
      console.log(type, sort)
    },
    // functions for modal
    onOpenModal(type, title, record, index) {
      console.log(record);
      this.titleOfModal = title;
      this.type = type;
      this.showModal = true;
      if (type === 'edit') {
        this.awardName = record.name
        this.awardDescription = record.description
      } else {
        this.awardName = ""
        this.awardDescription = ""
      }
      console.log(record, index);
    },
    onDeleteRow(record, index) {
      this.$confirm({
        title: `Do you want to delete this award?`,
        content: 'When clicked the OK button, this dialog will be closed after 1 second',
        onOk() {
          console.log("data", record);
          console.log("index", index);
        },
        onCancel() {
        },
      })
    },
    handleOk() {
      this.showModal = false;
    },
    handleCancel() {
      this.showModal = false
    },
    handleResetModal() {
      this.fileList = [];
      this.imageURL = "";
    },
    // functions for upload image
    handleUploadImage(e) {
      if (e.file.type !== 'image/jpeg' && e.file.type !== 'image/png') return;
      const reader = new FileReader();
      reader.onload = () => {
        this.imageURL = reader.result
      }
      reader.readAsDataURL(e.file.originFileObj);
    },
    beforeUpload(file) {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        this.$message.error('You can only upload JPG or PNG file!');
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        this.$message.error('Image must smaller than 2MB!');
      }
      return isJpgOrPng && isLt2M;
    },
  }
}
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