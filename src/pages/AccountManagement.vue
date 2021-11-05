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
        <div :style="{fontWeight: 'bold'}">Email:</div>
        <a-input placeholder="Email..." v-model:value="username" :style="{marginBottom: '20px'}"
                 :disabled="typeModal === 'edit'" autoComplete="chrome-off" name="email"/>
        <div :style="{marginBottom: '20px'}" v-if="typeModal === 'edit'">
          <a-checkbox v-model:checked="isChangePassword">Change password</a-checkbox>
          <div v-if="isChangePassword">
            <div :style="{fontWeight: 'bold'}">Password:</div>
            <a-input-password class="auth-page-input" placeholder="Password....." type="password" autoComplete="chrome-off"
                              v-model:value="password"
                              :style="{marginBottom: '20px'}" name="password"/>
          </div>
        </div>
        <div v-if="typeModal !== 'edit'">
          <div :style="{fontWeight: 'bold'}">Password:</div>
          <a-input-password class="auth-page-input" placeholder="Password....." type="password" v-model:value="password"
                            :style="{marginBottom: '20px'}" autoComplete="chrome-off" name="password"/>
        </div>
        <div :style="{fontWeight: 'bold'}">Role:</div>
        <a-select
            v-model:value="role"
            :style="{width: '100%'}"
            :options="roleOptions"
        />
      </a-modal>
      <a-form autoComplete="false">
        <span>Search: </span>
        <a-input placeholder="Email..." style="width: 200px" v-model:value="searchInput" :style="{marginLeft: '10px'}"
                 autoComplete="off" name="search" :disabled="isLoading">
          <template #suffix>
            <search-outlined/>
          </template>
        </a-input>
        <a-button type="primary" :disabled="isLoading" :style="{marginLeft: '10px'}" @click="onOpenModal('create', 'Create New Account', null)">
          <plus-circle-outlined/>
          Create New Award
        </a-button>
      </a-form>
    </div>
    <a-table
        :columns="columns"
        :data-source="dataTable"
        :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }"
        bordered
        @change="handleTableChange"
        :pagination="pagination"
        size="small"
        :loading="isLoading"
    >
      <template #no="{ index }">
        <span>{{ (pagination.current - 1) * pagination.pageSize + index + 1 }}</span>
      </template>
      <template #actions="{record}">
        <a-button @click="onOpenModal('edit', 'Edit Account', record)" :style="{marginRight: '10px'}"
                  type="primary">Edit
        </a-button>
        <a-button @click="onDeleteRow(record)" danger type="primary">Delete</a-button>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts">
import {defineComponent, watch, ref, computed, onMounted} from "vue";
import {TableState, TableStateFilters} from "ant-design-vue/es/table/interface";
import debounce from "lodash/debounce";
import {message, Modal} from "ant-design-vue";
import {getListUserApi, createUserApi, editUserApi, deleteUserApi} from "@/services/apis/user.api";
import {isValidEmail} from "@/utils/validator";

type Pagination = TableState["pagination"];

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
    key: "index",
    align: "center",
    width: 20,
    slots: {customRender: "no"}
  },
  {
    title: "Email",
    key: "email",
    dataIndex: "email",
    align: "center",
    width: 100,
    sorter: true,
  },
  {
    title: "Role",
    key: "role",
    dataIndex: "role",
    align: "center",
    width: 100,
    sorter: true,
  },
  {
    title: "Actions",
    key: "actions",
    align: "center",
    width: 100,
    slots: {customRender: "actions"}
  },
];

const roleOptions = [
  {
    value: "admin",
    label: "Admin",
  },
  {
    value: "moderator",
    label: "Moderator",
  },
];


export default defineComponent({
  name: "AccountManagement",
  setup() {
    /*---------------------- variables ------------------------------*/
    //variables for display on table
    const rawData = ref<RawData[]>([]);
    const dataTable = ref<ConvertedRawData[]>([]);

    //variables for onChange in table
    const searchInput = ref<string>("");
    const sort = ref<string>("");
    const currentPage = ref<number | undefined>(1);
    const pageSize = 20;
    const totalItem = ref<number>(0);
    //variables for modals
    const showModal = ref<boolean>(false);
    const titleOfModal = ref<string>("");
    const username = ref<string>("");
    const password = ref<string>("");
    const role = ref<string>("");
    const id = ref<string>("");
    const typeModal = ref<string>("");
    const isLoading = ref<boolean>(false);
    const confirmLoading = ref<boolean>(false);
    const isChangePassword = ref<boolean>(false);

    /*--------------------- functions ------------------------------*/
    const onSearch = debounce((e) => {
      searchInput.value = e;
      currentPage.value = 1;
      getListUser({page: currentPage.value || 1, pageSize, sort: sort.value, search: e});
    }, 1000);

    const pagination = computed(() => ({
      total: totalItem.value,
      current: currentPage.value,
      pageSize: pageSize,
    }));

    const handleTableChange = (page: Pagination, filters: TableStateFilters, sorter: Sorter) => {
      const sortOrder = sorter.order === "ascend" ? 1 : -1;
      sort.value = sorter.order ? `${sorter.field}: ${sortOrder}` : "";
      currentPage.value = page?.current;
      getListUser({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
    };

    const onOpenModal = (type: string, title: string, record: RawData) => {
      showModal.value = true;
      titleOfModal.value = title;
      typeModal.value = type;
      if (type === "edit") {
        username.value = record.email;
        password.value = "";
        role.value = record.role;
        id.value = record.id;
      } else {
        username.value = "";
        password.value = "";
        role.value = roleOptions[0].value;
      }
    };

    const onDeleteRow = (record: RawData) => {
      Modal.confirm({
        title: "Do you want to delete this account?",
        content: "When clicked the OK button, this account will be deleted",
        onOk() {
          deleteUserApi({id: record.id}).then((res) => {
            message.success(res.data.message);
            getListUser({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
          }).catch((e) => {
            message.error(e.response.data.message);
          });
        },
        onCancel() {
        },
      });
    };

    const handleResetModal = () => {
      username.value = "";
      password.value = "";
    };

    const editUser = () =>  {
      if (password.value === "" && isChangePassword.value) {
        confirmLoading.value = false;
        message.error("Password is required!");
        return;
      }
      editUserApi({password: isChangePassword.value ? password.value : undefined, role: role.value, id: id.value}).then((res) => {
        message.success(`Edit account ${res.data.email} success!`);
        confirmLoading.value = false;
        showModal.value = false;
        getListUser({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
      }).catch((e) => {
        message.error(e.response.data.message);
        confirmLoading.value = false;
      });
    };

    const createUser = () => {
      if (!isValidEmail(username.value)) {
        message.error("Invalid Email. Please try again!");
        confirmLoading.value = false;
        return;
      }
      if (!password.value) {
        message.error("Password is required!");
        confirmLoading.value = false;
        return;
      }
      createUserApi({email: username.value, password: password.value, role: role.value}).then((res) => {
        message.success(`Create account ${res.data.email} success!`);
        confirmLoading.value = false;
        showModal.value = false;
        getListUser({page: currentPage.value || 1, pageSize, sort: sort.value, search: searchInput.value});
      }).catch((e) => {
        message.error(e.response.data.message);
        confirmLoading.value = false;
      });
    };

    const handleOk = () => {
      confirmLoading.value = true;
      if (typeModal.value === "edit") {
        editUser();
      } else {
        createUser();
      }
    };

    const handleCancel = () => {
      showModal.value = false;
      isChangePassword.value = false;
    };

    const getListUser = ({
                           page,
                           pageSize,
                           sort,
                           search
                         }: { page: number, pageSize: number, sort: string, search: string }) => {
      isLoading.value = true;
      getListUserApi({
        page: page,
        pageSize,
        sort: sort,
        search: search
      }).then((res) => {
        isLoading.value = false;
        rawData.value = res.data.data;
        totalItem.value = res.data.totalItem;
      }).catch((e) => {
        isLoading.value = false;
        message.error(e.response.data.message);
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

    /*----------------------- hooks --------------------------------------*/
    onMounted(() => getListUser({
      page: currentPage.value || 1,
      pageSize,
      sort: sort.value,
      search: searchInput.value
    }));
    watch(searchInput, onSearch);
    watch(rawData, convertDataToTable);

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
      isLoading,
      isChangePassword,
      onOpenModal,
      handleResetModal,
      handleOk,
      handleCancel,
      handleTableChange,
      onDeleteRow
    };
  }
});
</script>

<style scoped lang="scss">
.account-management-container {
  .account-management-options-bar {

    margin-bottom: 20px;
  }
}
</style>