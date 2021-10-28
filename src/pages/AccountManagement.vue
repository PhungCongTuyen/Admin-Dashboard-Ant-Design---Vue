<template>
  <div class="account-management-container">
    <div class="account-management-options-bar">
      <a-modal
          :title="titleOfModal"
          :visible="showModal"
          :confirm-loading="confirmLoading"
          @ok="handleOk"
          @cancel="handleCancel"
          :afterClose="handleResetModal"
          okText="Save"
      >
        <div :style="{fontWeight: 'bold'}">Username:</div>
        <a-input placeholder="Username..." v-model:value="username" :style="{marginBottom: '20px'}"
                 :disabled="typeModal === 'edit'"/>
        <div :style="{fontWeight: 'bold'}">Password:</div>
        <a-input-password class="auth-page-input" placeholder="Password....." type="password" v-model:value="password"
                          :style="{marginBottom: '20px'}"/>
        <div :style="{fontWeight: 'bold'}">Role:</div>
        <a-select
            v-model:value="role"
            :style="{width: '100%'}"
            :options="roleOptions"
            @change="handleChangeFilter"
        />
      </a-modal>
      <span>Search: </span>
      <a-input placeholder="Username..." style="width: 200px" v-model:value="searchInput" :style="{marginLeft: '10px'}">
        <template #suffix>
          <search-outlined/>
        </template>
      </a-input>
      <a-button type="primary" :style="{marginLeft: '10px'}" @click="onOpenModal('create', 'Create New Account')">
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
import {defineComponent, watch, ref, computed} from "vue";
import {TableState, TableStateFilters} from 'ant-design-vue/es/table/interface';
import debounce from "lodash/debounce";

type Pagination = TableState['pagination'];

interface RawData {
  name: string,
  description: string
}

const columns = [
  {
    title: 'No.',
    key: 'index',
    align: 'center',
    width: 20,
    slots: {customRender: 'no'}
  },
  {
    title: "Username",
    key: 'username',
    dataIndex: 'username',
    align: 'center',
    width: 100,
  },
  {
    title: "Role",
    key: 'role',
    dataIndex: 'role',
    align: 'center',
    width: 100,
  },
  {
    title: "Actions",
    key: 'actions',
    align: 'center',
    width: 100,
    slots: {customRender: 'actions'}
  },
];

const roleOptions = [
  {
    value: 'admin',
    label: 'Admin',
  },
  {
    value: 'moderator',
    label: 'Moderator',
  },
];


export default defineComponent({
  name: "AccountManagement",
  setup() {
    /*---------------------- variables ------------------------------*/
    const rawData = [{username: 'ádasdasd', role: 'Moderator'}, {
      username: 'penádasdasdasdasdding',
      role: 'Admin'
    }];
    const dataTable = rawData.map((prev: RawData, index: number) => {
      return {
        ...prev,
        key: index
      }
    });
    // const debouncedGetAnswer = () => _.debounce(search, 5000)
    const searchInput = ref<string>('');
    const current = ref<number | undefined>(1);
    const pageSize = 20;
    const total = ref(dataTable.length);
    const showModal = ref<boolean>(false);
    const titleOfModal = ref<string>("Create New Account");
    const username = ref<string>("");
    const password = ref<string>("");
    const role = ref<string>("");
    const typeModal = ref<string>("");
    const confirmLoading = ref<boolean>(false);

    /*--------------------- functions ------------------------------*/
    const onSearch = debounce((e) => console.log(e, "300 down"), 300);

    const pagination = computed(() => ({
      total: total.value,
      current: current.value,
      pageSize: pageSize,
    }));

    const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: any) => {
      current.value = page?.current
      console.log("page", page?.current);
      console.log("filters", filters);
      console.log("sorter", sorter);
    };

    const onOpenModal = (type: string, title: string, record?: any, index?: number) => {
      showModal.value = true
      titleOfModal.value = title;
      typeModal.value = type;
      showModal.value = true;
      if (type === 'edit') {
        username.value = record.username;
        password.value = record.password;
        role.value = record.role
      } else {
        username.value = ""
        password.value = ""
        role.value = roleOptions[0].value
      }
      console.log(record, index);
    }

    const handleResetModal = () => {
      username.value = "";
      password.value = "";
    };

    const handleOk = () => {
      showModal.value = false;
    };

    const handleCancel = () => {
      showModal.value = false
    };

    const handleChangeFilter = (value: string) => {
      console.log(value);
    };
    /*----------------------- hooks --------------------------------------*/

    watch(searchInput, onSearch);

    return {
      searchInput,
      roleOptions,
      columns,
      dataTable,
      showModal,
      titleOfModal,
      confirmLoading,
      username,
      role,
      password,
      typeModal,
      pagination,
      onOpenModal,
      handleResetModal,
      handleOk,
      handleCancel,
      handleTableChange,
      handleChangeFilter
    }
  }
})
</script>

<style scoped lang="scss">
.account-management-container {
  .account-management-options-bar {

    margin-bottom: 20px;
  }
}
</style>