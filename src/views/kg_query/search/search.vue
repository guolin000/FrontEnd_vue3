<template>
  <div class="search-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="search-card">
          <el-input v-model="query" placeholder="输入疾病、症状或中药" @keyup.enter="search">
            <template #append>
              <el-button type="primary" :icon="Search" @click="search">搜索</el-button>
            </template>
          </el-input>
          <el-button type="link" :icon="RefreshRight" @click="reset" style="margin-top: 10px;">重置</el-button>
        </el-card>
      </el-col>
      <el-col :span="18">
        <el-card style="height: 800px">
          <el-tabs v-model="activeTab" @tab-click="handleTabClick">
            <el-tab-pane label="列表" name="list">
              <el-table :data="results" style="width: 100%">
                <el-table-column prop="name" label="名称" />
                <el-table-column prop="type" label="类型" />
                <el-table-column label="操作">
                  <template #default="scope">
                    <el-button type="link" :icon="Edit" @click="viewDetail(scope.row.id)">详情</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="图谱" name="graph">
              <div id="graphChart" style="width: 100%; height: 700px;"></div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Search, Edit, RefreshRight } from '@element-plus/icons-vue';
import * as echarts from 'echarts';
import requestUtil from '@/utils/request';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const query = ref('');
const results = ref([]);
const activeTab = ref('list');
const route = useRoute();
const router = useRouter();

const search = async () => {
  if (!query.value) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  try {
    console.log('查询关键词:', query.value);
    // 使用字符串拼接格式发送请求
    const res = await requestUtil.get(`/kg/search/?q=${encodeURIComponent(query.value)}`);
    console.log('后端返回数据:', res.data);
    results.value = res.data.nodes;
    if (activeTab.value === 'graph') renderGraph(res.data);
  } catch (error) {
    console.error('请求失败:', error);
    ElMessage.error('查询失败: ' + error.message);
  }
};

const reset = () => {
  query.value = '';
  results.value = [];
  const chart = echarts.getInstanceByDom(document.getElementById('graphChart'));
  if (chart) chart.clear();
};

const renderGraph = (graphData) => {
  const chartDom = document.getElementById('graphChart');
  const myChart = echarts.init(chartDom);
  const option = {
    title: {text: '知识图谱', left: 'center', textStyle: {fontFamily: '宋体', fontSize: 20}},
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `${params.data.type}: ${params.data.name}`;
        } else {
          return `关系: ${params.data.value}`;
        }
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: graphData.nodes.map(node => ({
        ...node,
        symbolSize: 20,
        itemStyle: {color: node.type === '疾病' ? '#ff6b6b' : node.type === '症状' ? '#4ecdc4' : '#45b7d1'}
      })),
      links: graphData.links,
      roam: true,
      label: {show: true, fontFamily: '楷体', fontSize: 14},
      force: {repulsion: 150, edgeLength: 120},
      edgeSymbol: ['circle', 'arrow'],
      edgeLabel: {
        show: true,
        formatter: '{c}', // 显示关系类型
        fontFamily: '楷体',
        fontSize: 12
      }
    }]
  };
  myChart.setOption(option);
};

const viewDetail = (id) => {
  router.push(`/detail/${id}`);
};

const handleTabClick = () => {
  if (activeTab.value === 'graph' && results.value.length) {
    search();
  }
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
  background: #f5f7fa;
}

.search-card {
  background: #fff;
  border-radius: 8px;
}

.el-table {
  font-family: '宋体', serif;
}

.el-tabs__item {
  font-family: '楷体', serif;
  font-size: 16px;
}
</style>
