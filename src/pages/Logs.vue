<template>
  <div class="logs-container">
    <a-table :columns="columns" :data-source="dataTable" :scroll="{ x: 1366, y: 'calc(100vh - 350px)' }" bordered size="small"
             @change="onTableSort"
             :pagination="{current, total, pageSize, onChange}">
    </a-table>
  </div>
</template>

<script>
export default {
  name: "Logs",
  computed: {
    columns() {
      return [
        {
          title: 'No.',
          key: 'index',
          align: 'center',
          width: 100,
          customRender: (text, record, index) => {
            return index + 1;
          }
        },
        {
          title: 'Time',
          key: 'time',
          align: 'center',
          width: 300,
          sorter: true,
        },
        {
          title: "Actions",
          key: 'action',
          align: 'center',
        },
      ];
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
      pageSize:12,
      rawData,
      dataTable,
      value: "pending",
    }
  },
  methods: {
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
.logs-container {

}
</style>