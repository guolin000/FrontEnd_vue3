<!-- src/views/book/BookDetail.vue -->
<template>
  <div class="book-detail">
<!--    <el-button type="primary" @click="router.back()">返回</el-button>-->
    <div class="book-content">
      <h1>{{ book.title }}</h1>
      <div class="meta">
        <p>作者：{{ book.author }}</p>
        <p>朝代：{{ book.dynasty }}</p>
      </div>
      <el-image :src="book.cover" class="cover-image" fit="contain" />
      <div class="content" v-html="bookContent"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import requestUtil from '@/utils/request';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const book = ref({});
const bookContent = ref('');

const fetchBook = async () => {
  try {
    const res = await requestUtil.get(`/book/books/${route.params.id}/`);
    book.value = res.data;
    if (book.value.content) {
      bookContent.value = book.value.content.replace(/\n/g, '<br>');
    }
  } catch (error) {
    ElMessage.error('无法加载书籍信息');
    console.error(error);
  }
};

onMounted(fetchBook);
</script>

<style scoped>
.book-detail {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}
.book-content {
  margin-top: 20px;
}
h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
}
.meta p {
  font-size: 16px;
  color: #666;
  margin: 5px 0;
}
.cover-image {
  max-width: 200px;
  margin: 20px 0;
  border-radius: 4px;
}
.content {
  margin-top: 20px;
  line-height: 1.8;
  font-size: 16px;
  color: #444;
  text-align: justify;
  padding: 20px;
  background: #f9f9f9;
  border-radius: 4px;
}
</style>
