/**
 * @file 渐进式轮播组件
 */
import React, { useState, useRef, useEffect } from 'react'
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
  NativeScrollPoint,
  LayoutChangeEvent,
  Platform,
} from 'react-native'
import { Pagination } from './pagination'
import {
  SwiperProps,
  AutoplayDirection,
  CustomMomentumScrollEndEvent,
} from './type'
import defaultSwiperProps from './props'

declare function setTimeout(handler: any, timeout?: any, ...args: any[]): number

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },

  // 这是一个神奇的 BUG，只有在 ScrollView 嵌套的组件上加了这个样式，ScrollView 的 pagingEnabled 才会生效
  // 并且还能够正确触发 onScrollBeginDrag，onScrollEndDrag，onMomentumScrollEnd 事件 -_-!!
  transparent: {
    backgroundColor: 'transparent',
  },
})

function getWindowWidth() {
  return Dimensions.get('window').width
}

function getWindowHeight() {
  return Dimensions.get('window').height
}

// 过滤传进来的嵌套组件，并统一成数组的形式
function normalizeChildren(
  children: JSX.Element | JSX.Element[],
): JSX.Element[] {
  let childrenNormalized: JSX.Element[]

  if (Array.isArray(children)) {
    childrenNormalized = children
  } else {
    childrenNormalized = [children]
  }

  // 过滤掉空节点
  childrenNormalized = childrenNormalized.filter(child => child)

  return childrenNormalized
}

// Swiper 组件最外层是一个 View 组件，此组件在代码中叫 container，
// container 又包裹一个 ScrollView 组件，该组件在代码中叫 scrollView
// ScrollView 组件又包裹一个隐藏的内容包裹组件，内容包裹组件在 ScrollView 中滑动，内容包裹组件在代码中叫 scrollViewContainer
// 内容包裹组件里面就是一个个轮播组件，这些轮播组件有点像幻灯片，所以称作 slider
// 用户嵌套在 Swiper 组件中的组件就分别包裹在这些 slider 组件中，用户嵌套的组件通过 props.children 传进来
export function Swiper(props: SwiperProps) {
  const inititalProps = {
    ...defaultSwiperProps,
    ...props,
  }
  const initialIndex = inititalProps.index || 0
  const inititalWidth = inititalProps.width || getWindowWidth()
  const inititalHeight = inititalProps.height || getWindowHeight()
  const { horizontal } = inititalProps

  // index 代表指示器展示的激活的点序号，这个序号由滚动到的 slider 的序号决定，slider 的序号则是通过偏移量计算获得
  const [index, setIndex] = useState(initialIndex)
  // 实际渲染出来的宽度
  const [width, setWidth] = useState(inititalWidth)
  // 实际渲染出来的高度
  const [height, setHeight] = useState(inititalHeight)
  // 是否需要跳转
  const [loopJump, setLoopJump] = useState(false)

  const scrollView = useRef<ScrollView>(null)
  const inititalRender = useRef(true)
  // 实际的偏移量
  const offset = useRef<NativeScrollPoint>({
    x: horizontal ? width * index : 0,
    y: horizontal ? 0 : height * index,
  })
  // 是否正在滚动，正在滚动就不会触发自动滚动
  const isScrolling = useRef(false)
  // 是否自动播放结束，如果在非循环的情况下，滚到了两头，就播放结束了
  const autoplayEnd = useRef(false)
  // 循环轮播时的跳转计时器，需要计时器的原因是这样才能使得动画流畅
  const jumpTimer = useRef(0)
  const autoplayTimer = useRef(0)

  // 处理后的子组件
  const children = normalizeChildren(props.children)
  const total = children.length
  const containerSize = { width, height }
  const sliderSize = containerSize
  // 哪个方向的偏移量是需要改变的，horizontal === true 就是 x
  const offsetDirection = horizontal ? 'x' : 'y'
  const offsetStep = horizontal ? width : height
  // 是否需要循环轮播
  const isLoop = inititalProps.loop && total > 1
  // 实际渲染的元素
  const firstChild = children[0]
  const lastChild = children[children.length - 1]
  // 当选择循环轮播时，前后需要加一个元素方便平滑过渡
  const renderChildren = isLoop
    ? [lastChild, ...children, firstChild]
    : children

  // 首次加载后，纠正初始的偏移量，偏移量存在的条件是多个嵌套组件，在此条件下：
  // 1. 如果是非循环轮播，则是正确的 width 或 height 乘以 index
  // 2. 如果是循环轮播，则是正确的 width 或 height 乘以 index + 1，因为前面多塞了一个元素
  function correctInitialOffset(correctWidth: number, correctHeight: number) {
    if (total > 1) {
      // 权重
      let weight = index

      if (isLoop) {
        weight++
      }

      const correctOffset = {
        x: horizontal ? correctWidth * weight : 0,
        y: horizontal ? 0 : correctHeight * weight,
      }

      // 如果是首次加载，就纠正一下
      if (inititalRender.current && scrollView.current) {
        offset.current = correctOffset
        scrollView.current.scrollTo({
          ...correctOffset,
          animated: false,
        })
        inititalRender.current = false
      }
    }
  }

  // 根据当前的偏移量来计算 index
  function updateIndex(currentOffset: NativeScrollPoint) {
    const delta =
      currentOffset[offsetDirection] - offset.current[offsetDirection]

    // 发生了偏移才改变
    if (delta !== 0) {
      // pagingEnabled 的功能也是建立在 delta / step 四舍五入后判断是滚动到下一个还是保持不变
      let currentIndex = index + Math.round(delta / offsetStep)
      let isLoopJump = false

      offset.current = currentOffset

      // 如果当前是循环轮播，且滚动到了前后两个，那么此时的 index 就需要更新为原 children 中的那个 index，以便指示器正确显示
      // 同时需要更新 offset.current，以便后续跳转时使用
      if (isLoop) {
        if (currentIndex <= -1) {
          // 滚动到最前面那个，实际上就是原 children 最后那一个
          currentIndex = total - 1
          offset.current[offsetDirection] = offsetStep * total
          isLoopJump = true
        } else if (currentIndex >= total) {
          // 滚动到最后面那个，实际上就是原 children 最前面那个
          currentIndex = 0
          offset.current[offsetDirection] = offsetStep
          isLoopJump = true
        }
      }

      setIndex(currentIndex)
      setLoopJump(isLoopJump)
    }
  }

  // 根据 index 差值滚动组件
  function scrollBy(deltaIndex: number, animated = true) {
    // 如果正在滚动，或者不需要滚动，就不执行滚动了
    if (isScrolling.current || total <= 1 || !scrollView.current) {
      return
    }

    const nextIndex = index + deltaIndex
    // 偏移量的权重
    const weight = isLoop ? nextIndex + 1 : nextIndex
    const nextOffset = {
      x: 0,
      y: 0,
    }
    nextOffset[offsetDirection] = weight * offsetStep

    // 滚动
    scrollView.current.scrollTo({
      ...nextOffset,
      animated,
    })

    // 更新滚动状态
    isScrolling.current = true
    autoplayEnd.current = false

    // iOS 平台下，运行 scrollTo 后会触发动画开始和结束
    // Android 不会，所以 Android 需要手动触发
    if (!animated || Platform.OS !== 'ios') {
      setImmediate(() => {
        const event: CustomMomentumScrollEndEvent = {
          nativeEvent: {
            contentOffset: nextOffset,
          },
        }
        handleMomentumScrollEnd(event)
      })
    }
  }

  // 设置自动播放
  function autoplay() {
    if (total <= 1 || !inititalProps.autoplay || isScrolling.current) {
      return
    }

    // 隔一段时间再执行自动播放
    const { autoplayTimeout = 2.5 } = inititalProps

    // 只允许有一个定时器存在
    autoplayTimer.current && clearTimeout(autoplayTimer.current)
    autoplayTimer.current = setTimeout(() => {
      // 最后一屏
      const { autoplayDirection } = inititalProps
      const lastIndex =
        autoplayDirection === AutoplayDirection.Before ? 0 : total - 1
      if (
        // 非循环播放
        !isLoop &&
        // 且到达最后一屏时，就表示播放结束了
        index === lastIndex
      ) {
        autoplayEnd.current = true
        return
      } else {
        // 其他情况就滚动一下，往前滚还是往后滚，由方向决定
        const deltaIndex =
          autoplayDirection === AutoplayDirection.Before ? -1 : 1
        scrollBy(deltaIndex)
      }
    }, autoplayTimeout * 1000)
  }

  // 页面加载完之后，要干两件事：
  // 1. 将渲染的实际宽高，并纠正 state 中的
  // 2. 计算正确的初始偏移量，并纠正 state 中的
  function handleLayout(event: LayoutChangeEvent) {
    const {
      width: correctWidth,
      height: correctHeight,
    } = event.nativeEvent.layout

    correctInitialOffset(correctWidth, correctHeight)

    // 纠正为实际宽高
    setWidth(correctWidth)
    setHeight(correctHeight)
  }

  // 用户开始滚动时，滚动中的状态变为 true，就无法自动播放了
  function handleScrollBeginDrag() {
    isScrolling.current = true

    // 触发用户的回调
    inititalProps.onScrollBeginDrag && inititalProps.onScrollBeginDrag()
  }

  // 用户如果是在两头滚，且不是循环播放的时候，是滚不动的，所以位置没变，自然也没有动画结束这个事件被触发
  // 所以，取消滚动中的状态的操作得在此事件做
  function handleScrollEndDrag(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const contentOffset = event.nativeEvent.contentOffset
    const currentPosition = contentOffset[offsetDirection]
    const prevPosition = offset.current[offsetDirection]

    if (
      currentPosition === prevPosition &&
      (index === 0 || index === total - 1)
    ) {
      isScrolling.current = false
    }
  }

  // 滚动动画结束时，做以下事情：
  // 1. 计算出滚动到了第几个 slider，从 0 开始计算的
  function handleMomentumScrollEnd(
    event:
      | NativeSyntheticEvent<NativeScrollEvent>
      | CustomMomentumScrollEndEvent,
  ) {
    // 滚动结束了，自动播放将可以开始了
    isScrolling.current = false

    const currentOffset = event.nativeEvent.contentOffset

    updateIndex(currentOffset)

    // 每次动画结束时再次运行自动播放
    // 由于自动播放结束又回引起动画结束，所以形成了循环，从而一直播放下去
    // console.log('autoplay')
    // autoplay()
  }

  // 首次渲染设置自动播放
  useEffect(() => autoplay(), [index])

  // 当 loopJump 更新后，如果是 true，说明需要手动跳转至正确的 offset，以便能够循环轮播下去
  // 跳转至正确的位置，根据 index 实时计算位置
  useEffect(() => {
    if (loopJump && scrollView.current) {
      // 300 ms 是个重要的参数
      const timeout = 0
      const scrollViewInstance = scrollView.current

      jumpTimer.current = setTimeout(() => {
        const scrollConfig = {
          x: 0,
          y: 0,
          animated: false,
        }

        // 如果在 index === 0 的地方，就要真的跳转至 renderIndex === 1 的地方
        if (index === 0) {
          scrollConfig[offsetDirection] = offsetStep
        } else if (index === total - 1) {
          scrollConfig[offsetDirection] = offsetStep * total
        }

        scrollViewInstance.scrollTo(scrollConfig)
      }, timeout)
    }

    return () => {
      clearTimeout(jumpTimer.current)
    }
  }, [loopJump, index, offsetStep, offsetDirection, total])

  return (
    <View style={[containerSize, props.style]} onLayout={handleLayout}>
      <ScrollView
        ref={scrollView}
        style={[styles.scrollView, props.scrollViewStyle]}
        contentContainerStyle={[props.containerStyle]}
        horizontal={inititalProps.horizontal}
        pagingEnabled={inititalProps.pagingEnabled}
        showsVerticalScrollIndicator={
          inititalProps.showsHorizontalScrollIndicator
        }
        showsHorizontalScrollIndicator={
          inititalProps.showsHorizontalScrollIndicator
        }
        // iOS 中滑动到边缘不发生回弹效果
        bounces={inititalProps.bounces}
        // iOS 中点击状态栏的时候不自动滚动到顶部
        scrollsToTop={inititalProps.scrollsToTop}
        // 提升滚动性能用的
        removeClippedSubviews={inititalProps.removeClippedSubviews}
        // 解决 iOS 滚动时出现滚动条的问题
        automaticallyAdjustContentInsets={
          inititalProps.automaticallyAdjustContentInsets
        }
        onScrollBeginDrag={handleScrollBeginDrag}
        onScrollEndDrag={handleScrollEndDrag}
        onMomentumScrollEnd={handleMomentumScrollEnd}
      >
        {renderChildren.map((child, childIndex) => (
          <View key={childIndex} style={[styles.transparent, sliderSize]}>
            {child}
          </View>
        ))}
      </ScrollView>

      <Pagination
        total={total}
        index={index}
        showsPagination={inititalProps.showsPagination}
        renderPagination={inititalProps.renderPagination}
        dotStyle={inititalProps.dotStyle}
        dotColor={inititalProps.dotColor}
        activeDotStyle={inititalProps.activeDotStyle}
        activeDotColor={inititalProps.activeDotColor}
      />
    </View>
  )
}

// export types
export { SwiperProps }
