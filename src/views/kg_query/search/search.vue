<template>
  <div class="search-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card>
          <el-input v-model="query" placeholder="搜索..." @keyup.enter="search">
            <template #append>
              <el-button type="primary" @click="search">搜索</el-button>
            </template>
          </el-input>
          <el-select v-model="filterType" placeholder="筛选类型" style="margin-top: 10px; width: 100%;">
            <el-option label="疾病" value="disease" />
            <el-option label="症状" value="symptom" />
            <el-option label="中药" value="herb" />
          </el-select>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card>
          <el-tabs v-model="activeTab">
            <el-tab-pane label="列表" name="list">
              <el-table :data="results" style="width: 100%">
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="type" label="类型" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="text" @click="viewDetail(scope.row.id)">详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
              <el-pagination layout="prev, pager, next" :total="total" @current-change="handlePageChange" />
            </el-tab-pane>
            <el-tab-pane label="图谱" name="graph">
              <div id="graphChart" style="height: 500px;"></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const query = ref('');
const filterType = ref('');
const results = ref([]);
const total = ref(0);
const activeTab = ref('list');
const route = useRoute();
const router = useRouter();

const search = async () => {
  const res = await axios.get('/api/graph/search', {
    params: { q: query.value, type: filterType.value, page: 1 }
  });
  results.value = res.data.results;
  total.value = res.data.total;
  renderGraph(res.data.graph);
};

const handlePageChange = (page) => {
  axios.get('/api/graph/search', { params: { q: query.value, type: filterType.value, page } })
    .then(res => { results.value = res.data.results; });
};

const viewDetail = (id) => {
  router.push(`/detail/${id}`);
};

const renderGraph = (graphData) => {
  const chartDom = document.getElementById('graphChart');
  const myChart = echarts.init(chartDom);
  const option = {
    series: [{
      type: 'graph',
      layout: 'force',
      data: graphData.nodes,
      links: graphData.links,
      roam: true,
      label: { show: true }
    }]
  };
  myChart.setOption(option);
};

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q;
    search();
  }
});
</script>

<style scoped>
.search-container {
  padding: 20px;
}
</style>
