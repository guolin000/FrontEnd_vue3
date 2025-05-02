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

    <el-card class="wordcloud-card">
      <h3 class="wordcloud-title">知识图谱词云</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="wordcloud-container">
        <div ref="wordcloudChart" class="wordcloud-chart"></div>
      </div>
      <div v-if="!loading && wordcloudData.length === 0" class="no-data">暂无词云数据</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { Search } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import 'echarts-wordcloud'; // 引入词云插件
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
const wordcloudData = ref([]);
const loading = ref(true);
const wordcloudChart = ref(null);
const router = useRouter();

const fetchOverview = async () => {
  try {
    const res = await requestUtil.get('kg/overview');
    overview.value = res.data;
  } catch (error) {
    console.error('Error fetching overview:', error);
    ElMessage.error('获取概览数据失败');
  }
};

const fetchWordcloudData = async () => {
  try {
    loading.value = true;
    const res = await requestUtil.get('kg/wordcloud');
    console.log('Fetched wordcloud data:', res.data);
    if (res.data.error) {
      throw new Error(res.data.error);
    }
    wordcloudData.value = res.data.data || [];
    await nextTick();
    initWordCloud();
  } catch (error) {
    console.error('Error fetching wordcloud:', error);
    ElMessage.error('获取词云数据失败: ' + (error.message || '未知错误'));
    wordcloudData.value = [];
  } finally {
    loading.value = false;
  }
};

const initWordCloud = () => {
  if (!wordcloudChart.value) return;

  const chart = echarts.init(wordcloudChart.value);
  const option = {
    tooltip: {
      show: true,
    },
    series: [{
      type: 'wordCloud',
      shape: 'circle',
      sizeRange: [12, 50], // 字体大小范围
      rotationRange: [-45, 0, 45, 90], // 旋转角度
      gridSize: 2,
      drawOutOfBound: true,
      textStyle: {
        fontFamily: 'Arial, sans-serif',
        fontWeight: 'bold',
        color: function () {
          const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96c93d', '#f7d794', '#ff9f43'];
          return colors[Math.floor(Math.random() * colors.length)];
        }
      },
      data: wordcloudData.value.map(item => ({
        name: item.name,
        value: item.value,
      }))
    }]
  };
  chart.setOption(option);
  window.addEventListener('resize', () => chart.resize());
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
  fetchWordcloudData();
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.title {
  font-family: '宋体', serif;
  font-size: 28px;
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
  background: #fff;
  border-radius: 8px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
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

.wordcloud-card {
  margin-top: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.wordcloud-title {
  font-family: '楷体', serif;
  font-size: 22px;
  color: #303133;
  text-align: center;
  margin: 15px 0;
  background: linear-gradient(to right, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  color: transparent;
}

.wordcloud-container {
  width: 100%;
  height: 450px;
}

.wordcloud-chart {
  width: 100%;
  height: 100%;
}

.loading,
.no-data {
  text-align: center;
  font-size: 16px;
  color: #606266;
  padding: 20px;
}
</style>
