<template>
  <div class="home-container">
    <el-card class="welcome-card">
      <h2>中医疫病知识图谱</h2>
      <p>探索中医疫病、症状与治疗的知识网络</p>
      <el-input v-model="searchQuery" placeholder="输入疾病、症状或中药" style="width: 300px;">
        <template #append>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
        </template>
      </el-input>
    </el-card>
    <el-row :gutter="20">
      <el-col :span="12">
        <el-card>
          <h3>统计信息</h3>
          <div id="statsChart" style="height: 300px;"></div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <h3>最新查询</h3>
          <el-table :data="recentQueries" style="width: 100%">
            <el-table-column prop="query" label="查询内容" />
            <el-table-column prop="time" label="查询时间" />
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import { useRouter } from 'vue-router';

const searchQuery = ref('');
const recentQueries = ref([{ query: '感冒', time: '2025-03-05 10:00' }]);
const router = useRouter();

const handleSearch = () => {
  router.push({ path: '/search', query: { q: searchQuery.value } });
};

onMounted(() => {
  const chartDom = document.getElementById('statsChart');
  const myChart = echarts.init(chartDom);
  const option = {
    title: { text: '知识图谱统计' },
    series: [{
      type: 'pie',
      data: [
        { value: 335, name: '疾病' },
        { value: 310, name: '症状' },
        { value: 234, name: '中药' }
      ],
      roseType: 'radius'
    }]
  };
  myChart.setOption(option);
});
</script>

<style scoped>
.home-container {
  padding: 20px;
}
.welcome-card {
  text-align: center;
  margin-bottom: 20px;
}
</style>
