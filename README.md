# 昇腾超节点 3D 拓扑设计库

> 导出时间：2026-07-01
> 版本：v2.0（黄铜/铜色点缀 + 面重叠修复 + SuperPoD 重建）

---

## 文件清单

| 文件 | 说明 |
|------|------|
| `entity-builders.js` | 13 个硬件图元的 Three.js 几何构建器（核心逻辑） |
| `icon-defs.js` | 13 个 2D SVG 图标定义（HWICONS.build） |
| `硬件图元设计库.dc.html` | 3D 图元展示库（13图元 × 6状态，浅/深色切换） |
| `硬件图元图标库.dc.html` | 2D 图标库（13图元 × 6状态网格） |
| `昇腾超节点3D拓扑.dc.html` | 全层级同屏 3D 拓扑视图 |
| `pattern.json` | 设计模式规范（图元 ID、层级关系、颜色体系） |
| `uxspec.md` | UX 规格文档（交互规则、状态定义、层级说明） |

---

## 图元清单（13个）

| ID | 名称 | 层级 | 说明 |
|----|------|------|------|
| `superpod` | SuperPoD / 超节点 | L7 | 机柜列阵 + UB 光纤天篷 |
| `rack` | 机架 | L6 | 标准 42U 机柜，含刀片槽 |
| `blade` | 刀片 | L5 | 计算刀片，含 NPU×8 + CPU |
| `npu` | NPU 昇腾 | L4 | 昇腾 950 风格，IHS + die 窗口 + BGA |
| `cpu` | CPU 鲲鹏 | L4 | 鲲鹏 920，LGA bracket + IHS + 安装螺丝 |
| `aicore` | AI Core | L3 | AIC 计算区 + AIV 向量区 + Scalar |
| `die` | Die + HBM | L3 | 双 die + HBM Stack + D2D 桥 |
| `hbm` | HBM Stack | L3 | 4 层堆叠 HBM，MAIN/DEEP 交替 |
| `nic` | NIC 网卡 | L4 | PCB + ASIC + 散热鳍片 |
| `lpo` | LPO 光模块 | L4 | 800G LPO，含光纤尾纤 |
| `port` | UB 端口组 | L4 | 4×UB cage + RDMA cage + LED 条 |
| `tile` | AI Core Tile | L2 | 最小计算单元，8×Cube 阵列 |
| `ubswitch` | UB 交换机 | L5 | 叶脊交换，密集端口面板 |

---

## 颜色体系

### 浅色模式（默认）

| Token | 色值 | 用途 |
|-------|------|------|
| `LITE` | #F7F8F8 | 最亮面（IHS 表面、高光） |
| `AIC` | #E9E9E9 | 亮色点缀（计算区） |
| `MAIN` | #CCCDD0 | 主体灰（大面积外壳） |
| `DEEP` | #C4C4C4 | 深色面（散热块、次级面） |
| `METAL` | #6F7072 | 深色金属（面板、笼架） |
| `DARK` | #3D3D3D | 最深（内腔、基底） |
| `BRASS` | #B8A06A | 黄铜点缀（螺丝、触点、分界线） |
| `COPPER` | #A07860 | 铜色点缀（D2D桥、基板边） |

### 状态色

| 状态 | 颜色 | 说明 |
|------|------|------|
| 默认 | #9a9a9a | 中性灰 LED |
| 空闲 | #04D793 | 绿色 |
| 告警 | #FFAA3B | 橙色 |
| 繁忙 | #FF4B7B | 红色 |
| 离线 | 全体 42% 透明度 | 置灰淡出 |

---

## SuperPoD 结构说明

参照 Atlas 950 / CloudMatrix384 真实形态：

- **8 个机柜**：6 计算柜（idx 0,1,3,4,6,7）+ 2 交换柜（idx 2,5）交替排列
- **UB 光纤天篷**：TubeGeometry 弧线从每个计算柜拱向两个交换柜，STATUS 着色
- **scale-out 出口**：从右侧交换柜引出 RDMA 光纤至外部 spine
- **视觉识别三要素**：深色高柜列 + 端口密集交换柜穿插 + 顶部发光光纤网

---

## Z-fighting 防控规则

所有图元遵循以下层叠原则，确保无面重叠：

1. **Body** 为基底，其他层均在其表面外偏移
2. **Panel** back face 距 body front ≥ 0.003 世界单位
3. **Cage/模块** back face 距 panel front ≥ 0.005 世界单位
4. **LED/标识** 距其依附面 ≥ 0.007 世界单位
5. **内嵌元素**（U槽、网格线）depth 不超出 body 边界（≤ body depth - 0.02）
6. **Rounded box（H.rb）** 同位置不叠加普通 box（H.bl/H.bm）

---

## 使用说明

### 在 HTML 中使用 entity-builders.js

```html
<script src="https://cdn.jsdelivr.net/npm/three@0.152/build/three.min.js"></script>
<script src="entity-builders.js"></script>
<script>
  // 构建 NPU 图元
  const scene = new THREE.Scene();
  const group = new THREE.Group();
  
  const C = { LITE:0xF7F8F8, MAIN:0xCCCDD0, DEEP:0xC4C4C4,
               METAL:0x6F7072, DARK:0x3D3D3D, BRASS:0xB8A06A,
               COPPER:0xA07860, STATUS:0x9a9a9a, /* ... */ };
  
  window.HWENT.npu(group, C, THREE, helpers);
  scene.add(group);
</script>
```

### icon-defs.js 使用

```js
// 生成 NPU SVG 图标（默认状态）
const svg = HWICONS.build('npu', 'default', 48);
document.body.appendChild(svg);

// 带状态的图标
const warnSvg = HWICONS.build('blade', 'warn', 48);
```

---

*本设计库基于 PTO Design System，颜色体系遵循 PTO 规范。*
