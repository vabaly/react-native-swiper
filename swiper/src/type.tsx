/**
 * @file 类型定义
 */

import { StyleProp, ViewStyle, NativeScrollPoint } from 'react-native'

export enum AutoplayDirection {
  Before,
  After,
}

export interface PaginationConfig {
  // 控件的展示与否
  // 是否展示分页指示器
  showsPagination?: boolean

  // 控件的设置
  // 自定义分页指示器的渲染，使用了此项，其他设置分页指示器的属性就无效了
  renderPagination?: (index: number, total: number) => JSX.Element
  // 没有高亮显示的指示点的样式
  dotStyle?: StyleProp<ViewStyle>
  // 没有高亮的指示点的颜色，如果设置了上面的样式，则设置颜色无效
  dotColor?: string
  // 高亮显示的指示点的样式，一般滚到第几屏就是第几个指示点高亮
  activeDotStyle?: StyleProp<ViewStyle>
  // 高亮的指示点的颜色，如果设置了上面的样式，则设置颜色无效
  activeDotColor?: string
}

// Swiper 组件接受的属性
export interface SwiperProps extends PaginationConfig {
  // 必须得传入子组件
  children: JSX.Element | JSX.Element[]

  // 特性的启用与否
  // 是否循环播放
  loop?: boolean
  // 是否自动播放
  autoplay?: boolean

  // 特性的设置

  // 自动播放的特性设置
  // 自动播放的间隔时间
  autoplayTimeout?: number
  // 自动播放的方向，有向前和向后两种，如果是水平的，就是向左和向右，如果是竖直的，就是向上和向下
  autoplayDirection?: AutoplayDirection

  // 组件的设置
  // 初始状态展示第几屏
  index?: number
  // 希望 Swiper 占用的宽度
  width?: number
  // 希望 Swiper 占用的高度
  height?: number
  // Swiper 根组件的样式
  style?: StyleProp<ViewStyle>

  // 滚动容器的设置，滚动容器实际上就是一个 ScrollView 组件，这些属性基本上就是暴露出来 ScrollView 本身的属性
  // 是否是水平滚动，默认 true
  horizontal?: boolean
  // 是否启用分页滚动，即一屏一屏的滚动，默认 true
  pagingEnabled?: boolean
  // 滚动时是否显示水平滚动条，默认 false
  showsHorizontalScrollIndicator?: boolean
  // 滚动时是否显示垂直滚动条，默认 false
  showsVerticalScrollIndicator?: boolean
  // iOS 中滑动到边缘是否发生回弹效果，默认 false
  bounces?: boolean
  // iOS 中点击状态栏的时候是否自动滚动到顶部，默认 false
  scrollsToTop?: boolean
  // 提升滚动性能用的，默认 true
  removeClippedSubviews?: boolean
  // 主要是解决 iOS 滚动时出现滚动条的问题，默认 false
  automaticallyAdjustContentInsets?: boolean
  // ScrollView 包裹的滚动实体的样式
  containerStyle?: StyleProp<ViewStyle>
  // 滚动容器的样式设置
  scrollViewStyle?: StyleProp<ViewStyle>

  // 对外暴露出来的事件
  // 从一屏滚到另一屏导致 index 发生变化时触发
  onIndexChanged?: (index: number) => void
  // 开始滚动那一刻触发
  onScrollBeginDrag?: () => void
  // 滚动动画结束的那一刻触发
  onMomentumScrollEnd?: () => void
}

// 手动触发动画结束事件时的事件结构
export interface CustomMomentumScrollEndEvent {
  nativeEvent: {
    contentOffset: NativeScrollPoint
  }
}
