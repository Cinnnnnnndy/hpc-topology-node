# 昇腾硬件图元图标库 · UX Spec
> PTO Design System — Hardware Entity Icons v1.0.0

---

## 1. 设计目标

本图标库为昇腾超节点（Ascend SuperPoD）架构中的 13 种硬件图元提供统一的视觉语言，用于拓扑图、监控面板、硬件选择器等场景。

**核心原则：**
- **形状即类型**：图元轮廓直接对应真实硬件形态（刀片扁平、机柜高立、CPU 方形 IHS+Bracket）
- **灰度即结构**：默认态全灰色层次，无色相语义；状态色仅表达运行时状态
- **状态集成**：LED / 状态色嵌入图标体内（不独立浮于图标外），随形变色

---

## 2. 图元层级体系

| Level | ID | 中文 | 英文 | 强调色 |
|---|---|---|---|---|
| L7 | `superpod` | SuperPoD | Super Node | #7C8DB8 |
| L6 | `rack` | 机柜 Rack | Server Rack | #78797d |
| L5 | `blade` | 刀片 Blade | Compute Node | #78797d |
| L4 | `npu` | NPU / rank | Ascend 950 Package | #4369EF |
| L3 | `die` | Die + HBM | Die Pair on Substrate | #FFAA3B |
| HBM | `hbm` | HBM Stack | High-Bandwidth Memory | #7C8DB8 |
| L2 | `aicore` | AI Core | DaVinci AI Core | #04D793 |
| L1 | `tile` | Tile | Compute Tile / SIMT Lane | #04D793 |
| 交换 | `ub_switch` | UB Switch | UB Spine / L2 Switch | #4369EF |
| CPU | `cpu` | CPU 鲲鹏 | Kunpeng 920 + LGA Socket | #78797d |
| 光模块 | `lpo` | LPO 800G | LPO Optical Module | #7C8DB8 |
| NIC | `nic` | NIC 擎天 | Qingtian NIC | #78797d |
| 端口 | `port` | 端口 Port | UB + RDMA Ports | #FFAA3B |

---

## 3. 颜色体系

### 3.1 调色板

#### 深色主题（默认）
| 名称 | 值 | 用途 |
|---|---|---|
| main | `#535151` | 主体结构面 |
| deep | `#5a5a5a` | 次要结构/凹陷 |
| lite | `#78797d` | 高光边缘/IHS |
| bg | `#313232` | 画布背景 |
| edge | `#181818` | 轮廓线 |

#### 浅色主题
| 名称 | 值 | 用途 |
|---|---|---|
| main | `#CCCDD0` | 主体结构面 |
| deep | `#C4C4C4` | 次要结构/凹陷 |
| lite | `#F7F8F8` | 高光边缘/IHS |
| bg | `#F0F1F1` | 画布背景 |
| edge | `#A0A0A0` | 轮廓线 |
| accent | `#E9E9E9` | 辅助高光 |
| metal | `#6F7072` | 金属深色 |
| dark | `#3D3D3D` | 深色结构元素 |

### 3.2 状态色（仅 LED 参数触发）
| 状态 | 色值 | 使用场景 |
|---|---|---|
| idle（空闲） | `#04D793` | 正常运行 |
| warn（告警） | `#FFAA3B` | 存在告警 |
| busy（繁忙） | `#FF4B7B` | 高负载/故障 |
| offline（离线） | `#5A6172` | 不可达 |

### 3.3 颜色使用原则
- 所有默认态使用灰色层次区分结构，**无色相差异**
- 区分不同功能区（AIC/AIV/Scalar）使用明度不同的灰，不使用绿色/紫色
- 状态色（绿/橙/红）**只**通过 `led` 参数传入，嵌入图标体内局部区域显示
- RDMA 端口区别于 UB 端口使用深灰（不使用紫色），通过形状和位置区分

---

## 4. 图标规格

### 4.1 基本参数
- **ViewBox**: `0 0 48 36`（宽高比 4:3）
- **格式**: SVG，通过 `HWICONS.build()` 返回 React element
- **推荐渲染尺寸**: 24×18、32×24、48×36、64×48px
- **最小渲染尺寸**: 16×12px

### 4.2 倒角规格（参考真实硬件）
| 图元 | 倒角 rx 值 | 对应真实规格 |
|---|---|---|
| CPU bracket | 3.5 | ~3mm LGA 外框 |
| CPU IHS | 2.5 | ~2mm IHS 边 |
| LPO 模块 | 3.5 | ~1mm QSFP-DD MSA |
| 交换板 | 1.5 | ~1.5mm 面板 |
| 刀片 | 1.5 | ~1.5mm 前面板 |
| NIC | 1.5 | ~1.5mm PCB 边 |

### 4.3 状态指示器位置（各图元）
| 图元 | 状态色位置 |
|---|---|
| superpod | 顶部交换桥架整体变色 |
| rack | 侧面 LED 光柱变色 |
| blade | 前面板 LED 条变色 |
| npu | die 窗口底部条带变色 |
| die | D2D 连接块变色 |
| hbm | 顶层高光条变色 |
| aicore | AIC 块底部条带变色 |
| tile | 激活格变色 |
| ub_switch | 首个端口点变色 |
| cpu | IHS 内面板底部条带变色 |
| lpo | 模块顶部 accent 条变色 |
| nic | 前面板底部条带变色 |
| port | 首个 UB 口内腔变色 |

---

## 5. 交互状态

### 5.1 六种状态定义

| 状态 key | 背景色叠加 | 边框 | LED颜色 | 标签色 |
|---|---|---|---|---|
| `default` | 无 | 无 | null | foreground-disabled |
| `hover` | rgba(120,121,125, 9%) | rgba(120,121,125, 30%) | null | foreground-muted |
| `selected` | rgba(67,105,239, 10%) | #4369EF 1px solid | null | #7c9ef8 |
| `idle` | 无 | 无 | #04D793 | #04D793 |
| `warn` | 无 | 无 | #FFAA3B | #FFAA3B |
| `busy` | 无 | 无 | #FF4B7B | #FF4B7B |

### 5.2 状态优先级
`busy` > `warn` > `idle` > `selected` > `hover` > `default`

（运行时状态优先于交互状态）

---

## 6. API 使用

### 6.1 引入
```html
<script src="icon-defs.js"></script>
```

### 6.2 调用
```js
// 参数：(entityId, ledColor, React, isLightMode)
const icon = window.HWICONS.build('npu', null, React, true);
// 返回 React SVG element，viewBox 0 0 48 36
```

### 6.3 状态示例
```js
// 默认
HWICONS.build('blade', null, React, true)

// 空闲（绿）
HWICONS.build('blade', '#04D793', React, true)

// 告警（橙）
HWICONS.build('blade', '#FFAA3B', React, true)

// 繁忙（红）
HWICONS.build('blade', '#FF4B7B', React, true)

// 离线（灰）
HWICONS.build('blade', '#5A6172', React, true)
```

### 6.4 在 React 组件中使用
```jsx
import React from 'react';
// icon-defs.js 挂载到 window.HWICONS

function EntityIcon({ id, status, light = true }) {
  const LED_MAP = {
    idle: '#04D793', warn: '#FFAA3B',
    busy: '#FF4B7B', offline: '#5A6172',
  };
  return (
    <div style={{ width: 48, height: 36 }}>
      {window.HWICONS.build(id, LED_MAP[status] || null, React, light)}
    </div>
  );
}
```

---

## 7. 3D 参考模型（entity-builders.js）

3D 模型库供设计师预览图元立体形态，不直接用于生产界面。

### 7.1 调用方式
```js
// 3D场景构建：传入 THREE.Group、颜色调色板、THREE命名空间、辅助函数对象
window.HWENT['npu'](group, colorPalette, THREE, helpers);
```

### 7.2 Helpers API
| 方法 | 签名 | 说明 |
|---|---|---|
| `bm` | `bm(w,h,d,c)` | 普通盒体 + 描边 |
| `rb` | `rb(w,h,d,r,c)` | 圆角盒体 + 描边 |
| `bl` | `bl(w,h,d,c)` | 基础 BasicMaterial 盒体 |
| `b` | `b(w,h,d)` | BoxGeometry |
| `s` | `s(c)` | MeshPhongMaterial |
| `k` | `k(c)` | MeshBasicMaterial |
| `cyl` | `cyl(rt,rb,h,sg)` | CylinderGeometry |

### 7.3 颜色参数（C 对象必须包含）
```js
const C = {
  MAIN, DEEP, LITE, DARK, GLINE, SWITCH,
  HBM, AIC, AIV, SCAL, GOLD,
  BLUE, GREEN, AMBER, RED, ACNT, EDGE
};
```

---

## 8. 文件清单

| 文件 | 用途 |
|---|---|
| `icon-defs.js` | 2D SVG 图标构建器（生产使用） |
| `entity-builders.js` | 3D Three.js 几何构建器（设计参考） |
| `硬件图元图标库.dc.html` | 2D 图标库设计文档（含 6 种状态） |
| `硬件图元设计库.dc.html` | 3D 等角视图设计文档 |
| `pattern.json` | 机器可读 pattern 契约 |
| `uxspec.md` | 本文档 |
| `README.md` | 仓库接入说明 |
