# 增量更新包（相对 export/ v2.0）

> 打包时间：2026-07-01（第二次）

## 本次改动范围

### entity-builders.js
- NPU / Die 底座高度降低（0.1→0.04），更精致
- Port 图元端口重叠彻底修复：重新计算 4×UB cage + RDMA cage 的 x 轴布局，消除物理重叠
- NIC 散热鳍片降低高度（0.10→0.055）、加密片数，比例更贴近真实网卡散热器
- Die 网格线 → 改为功能区色块 floorplan（计算簇/缓存/IO/控制逻辑），语义更清晰
- AI Core AIC 区网格线 → 改为 5×4 离散 Cube 方块阵列，直接表达"Cube 计算单元"
- Blade / AI Core / Port / NIC 的灰色层级加深（MAIN/DEEP/LITE/METAL 分层更丰富，减少"发白"观感）
- 新增暖色点缀：BRASS(#B8A06A) 黄铜、COPPER(#A07860) 铜色，用于螺丝、连接点、D2D桥、分隔线等精密结构细节（不与状态色冲突）
- 修复多处 z-fighting 面重叠（stack 底部、UB switch cage 等）

### 硬件图元库.dc.html（新增，合并版）
- 原「硬件图元设计库」(3D) + 「硬件图元图标库」(2D) 合并为单一入口，顶部 Tab 切换
- 右侧统一 Inspector 面板（实体信息 + 状态切换 5 态：默认/空闲/告警/繁忙/离线）
- 状态色应用方式：从"仅点缀"改为"主体淡着色 + 关键区域高亮"（SuperPod/Rack→高亮内部刀片，Blade→高亮 NPU/CPU，NPU/CPU→高亮中心芯片，Die/AICore/Tile→高亮内部小方块）

### 层级连线样式探索.dc.html（新增，连线样式设计探索文档）
- Turn 1-6 共 6 轮连线样式探索：树形层级、真实图元+连线状态、bus-wiring 深化、流量模式切换+悬浮卡片、中心枢纽胶囊管、精确复刻用户提供的「连线样式 Pattern 参考」三层结构（白色 casing + 彩色 glow 核心 + 流动暗点，按铜缆/光纤/长距光纤/D2D 四类区分）
- 可作为后续拓扑视图连线样式的设计参考基线

## 未变更
- pattern.json / uxspec.md / README.md（主库文档，未涉及本轮改动的部分内容仍适用，如需同步请参考 export/ 内旧版）
- 昇腾超节点 3D拓扑.dc.html（拓扑集成仍待后续任务）
