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
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
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
let myChart = null; // 保存 ECharts 实例

// 实体类型与颜色的映射
const entityColors = {
  '方剂': '#4ecdc4',
  '中医疾病': '#ff6b6b',
  '症状': '#ffa502',
  '服法': '#95e1d3',
  '用药禁忌': '#f94144',
  '煎法': '#45b7d1',
  '用法': '#a2cffe',
  '中药': '#2a9d8f',
  'default': '#d3d3d3'
};

const search = async () => {
  if (!query.value) {
    ElMessage.warning('请输入搜索关键词');
    return;
  }
  try {
    console.log('查询关键词:', query.value);
    const res = await requestUtil.get(`/kg/search/?q=${encodeURIComponent(query.value)}`);
    console.log('后端返回数据:', res.data);
    results.value = res.data.nodes || []; // 确保 nodes 不为 undefined
    if (activeTab.value === 'graph') {
      await nextTick(); // 等待 DOM 更新
      renderGraph(res.data);
    }
  } catch (error) {
    console.error('请求失败:', error);
    ElMessage.error('查询失败: ' + error.message);
  }
};

const reset = () => {
  query.value = '';
  results.value = [];
  if (myChart) {
    myChart.clear();
    myChart.dispose();
    myChart = null;
  }
};

const renderGraph = (graphData) => {
  const chartDom = document.getElementById('graphChart');
  if (!chartDom) {
    console.error('图表容器未找到');
    return;
  }

  // 如果容器不可见，延迟初始化
  if (chartDom.offsetParent === null) {
    console.warn('图表容器不可见，延迟初始化');
    setTimeout(() => renderGraph(graphData), 100);
    return;
  }

  // 销毁旧实例并初始化新实例
  if (myChart) {
    myChart.dispose();
  }
  myChart = echarts.init(chartDom);

  // 处理节点数据，提取类型
  const nodes = graphData.nodes || [];
  const uniqueTypes = [...new Set(nodes.map(node => node.type || '未知'))];
  const legendData = uniqueTypes; // 直接使用类型名称数组

  // 调试日志
  console.log('唯一实体类型:', uniqueTypes);
  console.log('图例数据:', legendData);
  console.log('节点数据:', nodes);

  const option = {
    title: { text: '知识图谱', left: 'center', textStyle: { fontFamily: 'Songti', fontSize: 20 } },
    legend: {
      data: legendData,
      left: 'left',
      top: 'top',
      icon: 'circle',
      textStyle: { fontFamily: 'Songti', fontSize: 14 }
    },
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `${params.data.type || '未知'}: ${params.data.name}`;
        } else {
          return `关系: ${params.data.value}`;
        }
      }
    },
    series: [{
      type: 'graph',
      layout: 'force',
      data: nodes.map(node => ({
        ...node,
        symbolSize: 20,
        itemStyle: { color: entityColors[node.type] || entityColors['default'] }
      })),
      links: graphData.links || [],
      roam: true,
      label: { show: true, fontFamily: 'Kaiti', fontSize: 14 },
      force: { repulsion: 150, edgeLength: 120 },
      edgeSymbol: ['circle', 'arrow'],
      edgeLabel: {
        show: true,
        formatter: '{c}',
        fontFamily: 'Kaiti',
        fontSize: 12
      }
    }]
  };

  myChart.setOption(option);
  console.log('ECharts 配置:', option);

  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    if (myChart) myChart.resize();
  });
};

const viewDetail = (id) => {
  router.push(`/detail/${id}`);
};

const handleTabClick = async () => {
  if (activeTab.value === 'graph' && results.value.length) {
    await nextTick(); // 等待 DOM 更新
    search();
  } else if (activeTab.value === 'list' && myChart) {
    myChart.dispose();
    myChart = null;
  }
};

onMounted(() => {
  if (route.query.q) {
    query.value = route.query.q;
    search();
  }
});

onUnmounted(() => {
  if (myChart) {
    myChart.dispose();
    myChart = null;
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
  font-family: 'Songti', serif;
}

.el-tabs__item {
  font-family: 'Kaiti', serif;
  font-size: 16px;
}
</style>
