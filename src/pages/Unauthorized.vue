<template>
  <a-result status="403" title="403" sub-title="Sorry, you do not have permission to enter this page.">
    <template #extra>
      <router-link class="ant-btn ant-btn-primary" to="/images-management">Back</router-link>
    </template>
  </a-result>
</template>