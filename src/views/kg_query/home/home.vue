<template>
  <div class="overview-container">
    <el-card class="header-card">
      <h1 class="title">中医疫病知识图谱概览</h1>
    </el-card>

    <el-row :gutter="10">
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">总实体数量</h3>
          <p class="stat-value">12592</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">总关系数量</h3>
          <p class="stat-value">8080</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">实体类型数量</h3>
          <p class="stat-value">17</p>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <h3 class="stat-title">关系类型数量</h3>
          <p class="stat-value">19</p>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="graph-card">
      <h3 class="graph-title">知识图谱类型概览</h3>
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else class="graph-container">
        <div ref="graphChart" class="graph-chart"></div>
      </div>
      <div v-if="!loading && graphData.entities.length === 0" class="no-data">暂无图谱数据</div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';

const loading = ref(true);
const graphChart = ref(null);
const graphData = ref({
  entities: [
    {text: '症状', type: '症状'},
    {text: '中医疾病', type: '中医疾病'},
    {text: '方剂', type: '方剂'},
    {text: '中药', type: '中药'},
    {text: '病因', type: '病因'},
    {text: '用法', type: '用法'},
    {text: '治法', type: '治法'},
    {text: '功效', type: '功效'},
    {text: '炮制方法', type: '炮制方法'},
    {text: '服法', type: '服法'},
    {text: '人物', type: '人物'},
    {text: '病机', type: '病机'},
    {text: '煎法', type: '煎法'},
    // {text: '脉象', type: '脉象'},
    {text: '加减化裁', type: '加减化裁'},
    {text: '人群', type: '人群'},
    {text: '著作', type: '著作'},
    {text: '预后', type: '预后'},
  ],
  relations: [
    {source: '方剂', target: '中药', type: '由…组成'},
    {source: '方剂', target: '用法', type: '用法'},
    {source: '中医疾病', target: '症状', type: '症状'},
    {source: '中药', target: '炮制方法', type: '炮制方法'},
    {source: '方剂', target: '服法', type: '服法'},
    {source: '方剂', target: '煎法', type: '煎法'},
    {source: '方剂', target: '症状', type: '适应症状'},
    {source: '方剂', target: '中医疾病', type: '适用疾病'},
    {source: '中医疾病', target: '病机', type: '病机'},
    {source: '中医疾病', target: '病因', type: '病因'},
    {source: '中医疾病', target: '治法', type: '治法'},
    {source: '中医疾病', target: '预后', type: '预后'},
    {source: '方剂', target: '加减化裁', type: '加减化裁'},
    {source: '中药', target: '功效', type: '功效'},
    {source: '方剂', target: '功效', type: '功效'},
    {source: '中医疾病', target: '中药', type: '治疗用药'},
    {source: '中医疾病', target: '方剂', type: '治疗用方'},
    {source: '症状', target: '人群', type: '发病人群'},
    {source: '著作', target: '人物', type: '作者'},
  ]
});

const initGraph = () => {
  if (!graphChart.value) {
    console.error('图表容器未找到');
    ElMessage.error('图表容器初始化失败');
    return;
  }

  console.log('初始化图表，容器：', graphChart.value);
  const chart = echarts.init(graphChart.value);
  const colorMap = {
    '症状': '#1890ff',
    '中医疾病': '#2f54eb',
    '方剂': '#52c41a',
    '中药': '#fa8c16',
    '病因': '#eb2f96',
    '用法': '#13c2c2',
    '治法': '#f5222d',
    '功效': '#faad14',
    '炮制方法': '#722ed1',
    '服法': '#eb2f96',
    '人物': '#597ef7',
    '病机': '#f759ab',
    '煎法': '#95de64',
    // '脉象': '#ffec3d',
    '加减化裁': '#b37feb',
    '人群': '#ff7875',
    '著作': '#5cdbd3',
    '预后': '#d9d9d9',
    'OTHER': '#595959'
  };

  const option = {
    title: {
      text: '中医疫病实体与关系类型',
      textStyle: {
        fontSize: 22,
        color: '#333',
        fontWeight: 'bold'
      },
      padding: [10, 20]
    },
    tooltip: {
      formatter: (params) => {
        if (params.dataType === 'node') {
          return `实体: ${params.name}<br>类型: ${params.data.category}`;
        } else {
          return `关系: ${params.data.label.formatter}`;
        }
      }
    },
    legend: {
      data: [...new Set(graphData.value.entities.map((e) => e.type))],
      bottom: 10,
      textStyle: {
        fontSize: 14,
        color: '#333'
      }
    },
    series: [
      {
        type: 'graph',
        layout: 'force',
        data: graphData.value.entities.map((entity) => ({
          name: entity.text,
          category: entity.type,
          symbolSize: 50,
          draggable: true,
          itemStyle: {
            color: colorMap[entity.type] || colorMap.OTHER,
            borderColor: '#333',
            borderWidth: 2.5,
            shadowColor: 'rgba(0, 0, 0, 0.3)',
            shadowBlur: 12
          },
          label: {
            show: true,
            fontSize: 16,
            color: '#000',
            fontWeight: 'bold',
            position: 'bottom'
          }
        })),
        links: graphData.value.relations.map((rel) => ({
          source: rel.source,
          target: rel.target,
          label: {
            show: true,
            formatter: rel.type,
            fontSize: 14,
            color: '#000',
            fontWeight: 'bold',
            position: 'middle',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            padding: 4
          },
          lineStyle: {
            color: '#555',
            width: 2.5
          }
        })),
        categories: [...new Set(graphData.value.entities.map((e) => e.type))].map((type) => ({
          name: type
        })),
        roam: true,
        label: {
          show: true,
          position: 'bottom',
          fontSize: 16,
          color: '#000'
        },
        force: {
          repulsion: 410, // 增加斥力
          edgeLength: [130, 150], // 增加边长度
          gravity: 0.03 // 减小重力
        },
        edgeLabel: {
          show: true,
          formatter: '{c}',
          fontSize: 14,
          color: '#000'
        },
        emphasis: {
          focus: 'adjacency',
          lineStyle: {
            width: 5,
            color: '#000'
          }
        }
      }
    ]
  };

  console.log('设置图表选项：', option);
  chart.setOption(option);
  window.addEventListener('resize', () => {
    console.log('调整图表大小');
    chart.resize();
  });
};

onMounted(async () => {
  try {
    loading.value = true;
    await nextTick();
    // 延迟初始化以确保 DOM 渲染完成
    setTimeout(() => {
      console.log('开始初始化图表');
      initGraph();
    }, 100);
  } catch (error) {
    console.error('初始化图表失败:', error);
    ElMessage.error('初始化图谱失败');
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.overview-container {
  padding: 20px;
  background: #f5f7fa;
}

.header-card {
  text-align: center;
  margin-bottom: 10px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 60px;
}

.title {
  font-family: '宋体', serif;
  font-size: 28px;
  margin-bottom: 10px;
}

.stat-card {
  text-align: center;
  transition: all 0.3s;
  background: #fff;
  border-radius: 8px;
  height: 80px;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.stat-title {
  font-family: '楷体', serif;
  font-size: 18px;
  color: #606266;
  margin-top: -10px;
}

.stat-value {
  font-family: 'Arial', sans-serif;
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
}

.graph-card {
  margin-top: 10px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  height: 550px;
}

.graph-title {
  font-family: '楷体', serif;
  font-size: 22px;
  color: #303133;
  text-align: center;
  //margin: 15px 0;
  background: linear-gradient(to right, #ff6b6b, #4ecdc4);
  -webkit-background-clip: text;
  color: transparent;
}

.graph-container {
  width: 100%;
  height: 480px;
}

.graph-chart {
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
