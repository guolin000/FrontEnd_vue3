<template>
  <div class="container">
    <div class="left-panel" :style="{ width: leftWidth + 'px' }">
      <div class="input-section">
        <a-textarea
          v-model:value="inputText"
          placeholder="请输入需要抽取的文本"
          :rows="10"
        />
        <a-button
          type="primary"
          @click="predict"
          :loading="loading"
          class="predict-btn"
        >
          {{ loading ? '抽取中...' : '实体与关系抽取' }}
        </a-button>
      </div>
      <div class="result-section">
        <a-card v-if="resultData" hoverable>
          <pre>{{ JSON.stringify(resultData, null, 2) }}</pre>
        </a-card>
      </div>
    </div>
    <div class="splitter" @mousedown="startDragging"></div>
    <div class="right-panel">
      <div class="chart-container" ref="chartContainer"></div>
      <a-button type="primary" @click="saveData" class="save-btn">
        导出抽取数据
      </a-button>
    </div>
    <a-modal v-model:visible="loading" :footer="null" :closable="false" centered>
      <div class="loading-content">
        <a-spin size="large" />
        <p>正在加载...</p>
      </div>
    </a-modal>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import * as echarts from 'echarts';
import requestUtil from '@/utils/request';
import { message } from 'ant-design-vue';

export default {
  name: 'EntityRelation',
  setup() {
    const inputText = ref('');
    const resultData = ref(null);
    const loading = ref(false);
    const chartContainer = ref(null);
    const leftWidth = ref(500);
    const chartInstance = ref(null);

    // 初始化图谱
    const initChart = () => {
      if (chartContainer.value) {
        chartInstance.value = echarts.init(chartContainer.value);
        // 监听拖动事件
        chartInstance.value.on('mouseup', { dataType: 'node' }, (params) => {
          const option = chartInstance.value.getOption();
          const node = option.series[0].data[params.dataIndex];
          node.fixed = true; // 拖动后固定节点位置
          node.x = params.event.offsetX;
          node.y = params.event.offsetY;
          chartInstance.value.setOption(option);
        });
      } else {
        console.error('Chart container is not available');
      }
    };

    // 预测函数
    const predict = async () => {
      if (!inputText.value.trim()) {
        message.warning('请输入文本');
        return;
      }
      loading.value = true;
      try {
        const response = await requestUtil.post('/info_extract/predict', {
          text: inputText.value
        });
        if (response.data.code === 0) {
          resultData.value = response.data.data;
          updateChart(response.data.data);
        } else {
          throw new Error(response.data.message || '后端返回错误');
        }
      } catch (error) {
        message.error('预测失败：' + error.message);
        console.error('Prediction error:', error);
      } finally {
        loading.value = false;
      }
    };

    // 更新图谱
    const updateChart = (data) => {
      if (!data || !data.entities || !data.relations) {
        console.error('Invalid data for chart:', data);
        message.error('数据格式错误，无法生成图谱');
        return;
      }

      // 定义颜色映射，匹配后端的中文实体类型
      const colorMap = {
        '症状': '#1890ff', // 蓝色
        '中医疾病': '#2f54eb', // 深蓝
        '方剂': '#52c41a', // 绿色
        '中药': '#fa8c16', // 橙色
        '病因': '#eb2f96', // 粉色
        '用法': '#13c2c2', // 青色
        '治法': '#f5222d', // 红色
        '功效': '#faad14', // 黄色
        '炮制方法': '#722ed1', // 紫色
        '服法': '#eb2f96', // 粉色
        '人物': '#597ef7', // 浅蓝
        '病机': '#f759ab', // 玫瑰红
        '煎法': '#95de64', // 浅绿
        '脉象': '#ffec3d', // 浅黄
        '加减化裁': '#b37feb', // 淡紫
        '人群': '#ff7875', // 珊瑚红
        '著作': '#5cdbd3', // 海蓝
        '预后': '#d9d9d9', // 灰色
        'OTHER': '#595959' // 默认灰色
      };

      const option = {
        title: {
          text: '中医实体关系图谱',
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
          data: [...new Set(data.entities.map((e) => e.type))],
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
            data: data.entities.map((entity) => ({
              name: entity.text,
              category: entity.type,
              symbolSize: 50,
              draggable: true, // 启用节点拖动
              itemStyle: {
                color: colorMap[entity.type] || colorMap.OTHER,
                borderColor: '#333',
                borderWidth: 2.5,
                shadowColor: 'rgba(0, 0, 0, 0.3)',
                shadowBlur: 12
              },
              label: {
                fontSize: 16,
                color: '#000',
                fontWeight: 'bold',
                position: 'bottom'
              }
            })),
            links: data.relations.map((rel) => ({
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
            categories: [...new Set(data.entities.map((e) => e.type))].map((type) => ({
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
              repulsion: 300, // 增加间距以优化拖动体验
              edgeLength: [60, 120],
              gravity: 0.05 // 减小重力，使拖动更自由
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

      if (chartInstance.value) {
        chartInstance.value.setOption(option, true);
      } else {
        console.error('Chart instance is not initialized');
      }
    };

    // 导出数据为 JSON 文件
    const saveData = () => {
      if (!resultData.value) {
        message.warning('暂无预测数据可保存');
        return;
      }

      try {
        // 准备数据
        const saveData = {
          input_text: inputText.value,
          result: resultData.value,
          timestamp: new Date().toISOString()
        };

        // 生成时间戳（YYYYMMDDHHMMSS）
        const now = new Date();
        const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;
        const filename = `抽取结果_${timestamp}.json`;

        // 创建 JSON 文件
        const jsonString = JSON.stringify(saveData, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);

        // 触发下载
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        message.success('导出成功');
      } catch (error) {
        message.error('导出失败：' + error.message);
        console.error('Export error:', error);
      }
    };

    // 分割线拖动
    const startDragging = (e) => {
      const startX = e.clientX;
      const startWidth = leftWidth.value;
      const moveHandler = (moveEvent) => {
        leftWidth.value = Math.max(300, Math.min(800, startWidth + moveEvent.clientX - startX));
        if (chartInstance.value) {
          chartInstance.value.resize();
        }
      };
      const upHandler = () => {
        document.removeEventListener('mousemove', moveHandler);
        document.removeEventListener('mouseup', upHandler);
      };
      document.addEventListener('mousemove', moveHandler);
      document.addEventListener('mouseup', upHandler);
    };

    onMounted(() => {
      initChart();
    });

    return {
      inputText,
      resultData,
      loading,
      predict,
      saveData,
      chartContainer,
      leftWidth,
      startDragging
    };
  }
};
</script>

<style scoped>
.container {
  display: flex;
  height: 83vh;
  position: relative;
  background: #f5f5f5;
}

.left-panel {
  display: flex;
  flex-direction: column;
  transition: width 0.2s;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin: 10px;
}

.input-section {
  padding: 20px;
  flex: 0 0 auto;
}

.result-section {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.predict-btn {
  width: 100%;
  margin-top: 15px;
  //padding: 12px;
  font-size: 16px;
}

.right-panel {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  margin: 10px;
}

.chart-container {
  flex: 1;
  width: 100%;
  background: #fff;
  border: 2px solid #666;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 10px;
}

.save-btn {
  margin-top: 15px;
  //padding: 12px;
  font-size: 16px;
}

.splitter {
  width: 6px;
  background: #999;
  cursor: ew-resize;
  transition: background 0.2s;
}

.splitter:hover {
  background: #666;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-size: 14px;
  color: #333;
}
</style>
