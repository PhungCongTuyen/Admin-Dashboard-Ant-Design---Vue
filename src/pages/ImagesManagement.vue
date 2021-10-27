<template>
  <div class="images-management-container">
    <div class="images-management-options-bar">
      <span class="images-management-options-label">Filter:</span>
      <a-select :default-value="value" style="width: 120px" @change="handleChangeFilter">
        <a-select-option value="pending">
          Pending
        </a-select-option>
        <a-select-option value="approved">
          Approved
        </a-select-option>
        <a-select-option value="rejected">
          Rejected
        </a-select-option>
        <a-select-option value="deleted">
          Deleted
        </a-select-option>
      </a-select>
    </div>
    <a-table :columns="columns" :data-source="dataTable" :scroll="{ x: 1700, y: 'calc(100vh - 350px)' }" bordered
             @change="onTableSort"
             :pagination="{current, total, pageSize, onChange}">
      <div slot="action" slot-scope="text, record, index">
        <a-button v-if="record.status === 'pending'" @click="showConfirm('approve', record, index)"
                  :style="{marginRight: '10px'}" type="primary">Approve
        </a-button>
        <a-button v-if="record.status === 'pending'" @click="showConfirm('reject', record, index)"
                  :style="{marginRight: '10px'}" type="danger" ghost>Reject
        </a-button>
        <a-button @click="showConfirm('delete', record, index)" type="danger">Delete</a-button>
      </div>
    </a-table>
  </div>
</template>

<script>

export default {
  name: "ImagesManagement",
  computed: {
    columns() {
      const columns = [
        {
          title: 'No.',
          key: 'index',
          align: 'center',
          width: 50,
          customRender: (text, record, index) => {
            return (this.current - 1) * this.pageSize + index + 1;
          }
        },
        {
          title: 'Thumbnail',
          key: 'url',
          align: 'center',
          width: 150,
          // customRender: (text, record, index) => {
          //   return index + 1;
          // }
        },
        {
          title: "Likes",
          key: 'likes',
          align: 'center',
          width: 100,
          sorter: true,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: "Owner's Email",
          key: 'email',
          align: 'center',
          width: 200,
        },
        {
          title: "Status",
          key: 'status',
          dataIndex: 'status',
          align: 'center',
          width: 100,
        },
        {
          title: "Publish Time",
          key: 'time',
          align: 'center',
          width: 150,
          sorter: true,
          sortDirections: ['ascend', 'descend']
        },
        {
          title: "Updated by",
          key: 'updatedBy',
          align: 'center',
          width: 150,
        },
        {
          title: "Actions",
          key: 'action',
          align: 'center',
          width: 200,
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
  updated() {

  },
  data() {
    const rawData = [{status: 'pending'}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}, {}];
    const dataTable = [];
    return {
      current: 1,
      total: dataTable?.length,
      pageSize: 12,
      rawData,
      dataTable,
      value: "pending",
    }
  },
  methods: {
    renderModalIcon(type) {
      switch (type) {
        case 'approve':
          return <a-icon type="check-circle" theme="twoTone" two-tone-color="#52c41a"/>
        case 'reject':
          return <a-icon type="minus-circle" theme="twoTone" two-tone-color="#eb2f96"/>
        case 'delete':
          return <a-icon type="close-circle" theme="twoTone" two-tone-color="#eb4034"/>
        default:
          return null
      }
    },
    handleChangeFilter(value) {
      this.value = value
    },
    showConfirm(type, data, index) {
      this.$confirm({
        icon: () => this.renderModalIcon(type),
        title: `Do you want to ${type} this item?`,
        content: 'When clicked the OK button, this dialog will be closed after 1 second',
        onOk() {
          console.log(type);
          console.log("data", data);
          console.log("index", index);
        },
        onCancel() {
        },
      })
    },
    onChange(selectedPage) {
      this.current = selectedPage
    },
    onTableSort(props, _, sort) {
      console.log(sort);
    },
    handleSort(type, sort) {
      console.log(type, sort)
    }
  }
}
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