<template>
  <div class="overview-container">
    <el-card class="header-card">
      <h1 class="title">中医疫病知识图谱概览</h1>
      <el-input v-model="searchQuery" placeholder="输入关键词搜索" style="width: 300px;">
        <template #append>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </el-card>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">总实体数量</h3>
          <p class="stat-value">{{ overview.total_nodes }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">总关系数量</h3>
          <p class="stat-value">{{ overview.total_rels }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">实体类型数量</h3>
          <p class="stat-value">{{ overview.node_types }}</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">关系类型数量</h3>
          <p class="stat-value">{{ overview.rel_types }}</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search } from '@element-plus/icons-vue';
import requestUtil from '@/utils/request';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const searchQuery = ref('');
const overview = ref({
  total_nodes: 0,
  total_rels: 0,
  node_types: 0,
  rel_types: 0,
});
const router = useRouter();

const fetchOverview = async () => {
  try {
    const res = await requestUtil.get('kg/overview');
    overview.value = res.data;
  } catch (error) {
    ElMessage.error('获取概览数据失败');
  }
};

const handleSearch = () => {
  if (!searchQuery.value) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  router.push({ path: '/search', query: { q: searchQuery.value } });
};

onMounted(() => {
  fetchOverview();
});
</script>

<style scoped>
.overview-container {
  padding: 20px;
  background: #f5f7fa;
}

.header-card {
  text-align: center;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
}

.title {
  font-family: '宋体', serif;
  font-size: 28px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-title {
  font-family: '楷体', serif;
  font-size: 18px;
  color: #606266;
}

.stat-value {
  font-family: 'Arial', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}
</style>
