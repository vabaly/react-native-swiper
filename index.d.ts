import {
  ViewStyle,
  StyleProp,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ScrollViewProps
} from 'react-native'
import { Component } from 'react'

declare module 'react-native-swiper' {
  interface SwiperState {
    autoplayEnd: false
    loopJump: false
    width: number
    height: number
    offset: {
      x: number
      y: number
    }
    total: number
    index: number
    dir: 'x' | 'y'
  }

  interface SwiperInternals extends SwiperState {
    isScrolling: boolean
  }

  // SwiperProps 都将作为 ScrollView 的属性，这就是为什么 SwiperProps 继承自 ScrollViewProps
  interface SwiperProps
    extends Omit<ScrollViewProps, 'onScrollBeginDrag' | 'onMomentumScrollEnd'> {
    // Basic
    // If true, the scroll view's children are arranged horizontally in a row instead of vertically in a column.
    horizontal?: boolean
    // If no specify default enable fullscreen mode by flex: 1. 是否循环
    loop?: boolean
    // Index number of initial slide. 初始状态时展示第几张幻灯片，从 0 开始
    index?: number
    // Set to true make control buttons visible. 是否展示左右箭头
    showsButtons?: boolean
    // Set to false to disable continuous loop mode.
    autoplay?: boolean
    // Called with the new index when the user swiped，当幻灯片索引更新时触发，只是数据变了，视觉可能还没变
    onIndexChanged?: (index: number) => void

    // Custom basic style & content
    // Set to true enable auto play mode.
    width?: number
    // If no specify default fullscreen mode by flex: 1.
    height?: number
    // 自定义 ScollView 的样式，即在 Swiper 根组件和每张幻灯片的根组件之间的那个 ScrollView 组件
    scrollViewStyle: StyleProp<ViewStyle>
    // See default style in source. 自定义每张幻灯片的根组件的样式
    style?: StyleProp<ViewStyle>
    // Customize the View container. 自定义 Swiper 根组件的样式
    containerStyle?: StyleProp<ViewStyle>
    // Only load current index slide , loadMinimalSize slides before and after.
    loadMinimal?: boolean
    // see loadMinimal
    loadMinimalSize?: number
    // Custom loader to display when slides aren't loaded
    loadMinimalLoader?: React.ReactNode

    // Pagination
    // Set to true make pagination visible.
    // 是否展示指示器
    showsPagination?: boolean
    // Custom styles will merge with the default styles. 指示器根组件的样式
    paginationStyle?: StyleProp<ViewStyle>
    // Complete control how to render pagination with three params (index, total, context) ref to this.state.index / this.state.total / this, For example: show numbers instead of dots.
    // 自定义指示器的展示，通过当前展示的幻灯片序号，总共有多少个幻灯片，以及 swiper 对象本身这几个参数来自定义
    renderPagination?: (
      index: number,
      total: number,
      swiper: Swiper
    ) => React.ReactNode
    // Allow custom the dot element. 自定义指示点的组件
    dot?: React.ReactNode
    // Allow custom the active-dot element. 自定义激活的指示点组件
    activeDot?: React.ReactNode
    // Allow custom the active-dot element. 自定义所有指示点的样式
    dotStyle?: StyleProp<ViewStyle>
    // Allow custom the active-dot element. 自定义所有指示点的颜色
    dotColor?: string
    // Allow custom the active-dot element. 自定义激活的指示点颜色
    activeDotColor?: string
    // Allow custom the active-dot element. 自定义激活的指示点样式
    activeDotStyle?: StyleProp<ViewStyle>

    // Autoplay
    // Delay between auto play transitions (in second).
    autoplayTimeout?: number
    // Cycle direction control.
    autoplayDirection?: boolean

    // Control buttons
    // Set to true make control buttons visible.
    buttonWrapperStyle?: StyleProp<ViewStyle>
    // Allow custom the next button.
    nextButton?: React.ReactNode
    // Allow custom the prev button. 自定义跳至前一个幻灯片的按钮
    prevButton?: React.ReactNode
    // 是否让跳至前一个幻灯片的按钮不响应任何交互事件
    disablePrevButton?: boolean

    // Supported ScrollResponder
    // When animation begins after letting up，滚动开始的事件监听
    onScrollBeginDrag?: (
      e: NativeSyntheticEvent<NativeScrollEvent>,
      state: SwiperInternals,
      swiper: Swiper
    ) => void
    // Makes no sense why this occurs first during bounce
    onMomentumScrollEnd?: (
      e: NativeSyntheticEvent<NativeScrollEvent>,
      state: SwiperInternals,
      swiper: Swiper
    ) => void
    // Immediately after onMomentumScrollEnd
    onTouchStartCapture?: any
    // Same, but bubble phase
    onTouchStart?: any
    // You could hold the touch start for a long time
    onTouchEnd?: any
    // When lifting up - you could pause forever before * lifting
    onResponderRelease?: any

    // If true, the scroll view stops on multiples of the scroll view's size when scrolling. This can be used for
    // horizontal pagination.
    pagingEnabled?: boolean
    // Set to true if you want to show horizontal scroll bar.
    showsHorizontalScrollIndicator?: boolean
    // Set to true if you want to show vertical scroll bar.
    showsVerticalScrollIndicator?: boolean
    // If true, the scroll view bounces when it reaches the end of the content if the content is larger then the
    // scroll view along the axis of the scroll direction. If false, it disables all bouncing even if the
    // alwaysBounce* props are true.
    bounces?: boolean
    // If true, the scroll view scrolls to top when the status bar is tapped.
    scrollsToTop?: boolean
    // If true, offscreen child views (whose overflow value is hidden) are removed from their native backing
    // superview when offscreen. This canimprove scrolling performance on long lists.
    removeClippedSubviews?: boolean
    // Set to true if you need adjust content insets automation.
    automaticallyAdjustContentInsets?: boolean
    // Enables/Disables swiping
    scrollEnabled?: boolean
  }

  export default class Swiper extends Component<SwiperProps, SwiperState> {
    scrollBy: (index?: number, animated?: boolean) => void
    scrollTo: (index: number, animated?: boolean) => void
  }
}
