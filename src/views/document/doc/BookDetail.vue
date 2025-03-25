<!-- src/views/book/BookDetail.vue -->
<template>
  <div class="book-detail">
      <!-- 添加回退按钮 -->
    <el-button
      class="back-button"
      type="primary"
      @click="goBack"
    >
      返回
    </el-button>
    <div class="book-content">
      <h1>{{ book.title }}</h1>
      <div class="meta">
        <p>作者：{{ book.author }}</p>
        <p>朝代：{{ book.dynasty }}</p>
      </div>
      <el-image :src="book.cover" class="cover-image" fit="contain" />
      <div class="content" v-html="bookContent"></div>
    </div>
    <!-- 添加回到顶部按钮 -->
    <el-button
      class="back-to-top"
      type="primary"
      circle
      @click="scrollToTop"
    >
      ↑
    </el-button>
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


// 返回上一页的方法
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/'); // 回退到首页或其他默认页面
  }
};
// 获取滚动容器（假设是父组件的滚动容器）
const scrollToTop = () => {
  // 尝试获取最近的滚动容器
  const scrollContainer = document.querySelector('.el-main') || // Element Plus 布局常用类名
                         document.querySelector('.book-detail') ||
                         document.body;

  if (scrollContainer) {
    scrollContainer.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  } else {
    // 回退到 window
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
};

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
  position: relative;
}

.book-content {
  margin-top: 40px;
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

.back-to-top {
  position: fixed;
  right: 20px;
  bottom: 50px;
  width: 80px;
  height: 80px;
  font-size: 30px;
  padding: 0;
  z-index: 1000;
}
/* 回退按钮样式 */
.back-button {
  position: absolute;
  left: 30px;
  right: 30px;
  top: 20px;
  z-index: 1000;
  margin-bottom: 20px;
  margin-right: 50px;
}

</style>
