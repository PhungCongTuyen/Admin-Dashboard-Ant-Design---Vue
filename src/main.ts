import { createApp } from "vue";
import App from "./App.vue";
import router from "@/routes";
import store from "@/store/index";
import {
    Input,
    Button,
    Layout,
    Menu,
    Table,
    Select,
    Modal,
    Upload,
    Row,
    Col,
    Image,
    Dropdown,
    Form,
    Result,
    Checkbox,
} from "ant-design-vue";
import "ant-design-vue/dist/antd.css";
import "./assets/style.module..scss";
import {
    FileDoneOutlined,
    HomeOutlined,
    PictureOutlined,
    GiftOutlined,
    SettingOutlined,
    UserOutlined,
    DatabaseOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    PlusOutlined,
    PlusCircleOutlined,
    LogoutOutlined,
    SearchOutlined,
} from "@ant-design/icons-vue";

import DashboardLayout from "./layouts/DashboardLayout.vue";
import DefaultLayout from "./layouts/DefaultLayout.vue";
import AuthLayout from "./layouts/AuthLayout.vue";

const app = createApp(App);

app.component("layout-auth", AuthLayout);
app.component("layout-dashboard", DashboardLayout);
app.component("layout-default", DefaultLayout);
app.component(HomeOutlined.displayName, HomeOutlined);
app.component(PictureOutlined.displayName, PictureOutlined);
app.component(SettingOutlined.displayName, SettingOutlined);
app.component(GiftOutlined.displayName, GiftOutlined);
app.component(UserOutlined.displayName, UserOutlined);
app.component(DatabaseOutlined.displayName, DatabaseOutlined);
app.component(MenuFoldOutlined.displayName, MenuFoldOutlined);
app.component(MenuUnfoldOutlined.displayName, MenuUnfoldOutlined);
app.component(PlusOutlined.displayName, PlusOutlined);
app.component(PlusCircleOutlined.displayName, PlusCircleOutlined);
app.component(LogoutOutlined.displayName, LogoutOutlined);
app.component(SearchOutlined.displayName, SearchOutlined);
app.component(FileDoneOutlined.displayName, FileDoneOutlined);

app.use(store);
app.use(router);
app.use(Input);
app.use(Button);
app.use(Layout);
app.use(Menu);
app.use(Table);
app.use(Select);
app.use(Modal);
app.use(Upload);
app.use(Row);
app.use(Col);
app.use(Result);
app.use(Image);
app.use(Dropdown);
app.use(Form);
app.use(Checkbox);

app.mount("#app");
