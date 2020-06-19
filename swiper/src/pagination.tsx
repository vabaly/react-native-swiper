/**
 * @file 轮播组件的指示器部分
 */
import React from 'react'
import { View, StyleSheet } from 'react-native'
import { PaginationConfig } from './type'

enum DotColor {
  Dark = 'rgba(0, 0, 0, .2)',
  Light = '#007aff',
}

const styles = StyleSheet.create({
  // 默认情况下指示器位于底部中间 25dp 处
  pagination: {
    position: 'absolute',
    bottom: 25,
    left: 0,
    right: 0,
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 3,
    marginRight: 3,
    marginTop: 3,
    marginBottom: 3,
    backgroundColor: DotColor.Dark,
  },

  dotActive: {
    backgroundColor: DotColor.Light,
  },
})

// 组件传入的属性
interface PaginationProps extends PaginationConfig {
  total: number
  index: number
}

// 悬浮在底部的指示器
export const Pagination = (props: PaginationProps) => {
  const { total, index, renderPagination } = props

  // 会产生 [false, false, ...] 这样一个长度为 total 的数组，其中索引为 index 的值是 true
  const dotsStatus = Array(total)
    .fill(false)
    .map((status, statusIndex) => (index === statusIndex ? true : status))
  const isShowPagination = props.showsPagination && total > 1

  // 普通指示点的样式
  const dotStyle = [
    styles.dot,
    props.dotColor ? { backgroundColor: props.dotColor } : {},
    props.dotStyle,
  ]

  const dotActiveStyle = [
    styles.dot,
    styles.dotActive,
    props.activeDotColor ? { backgroundColor: props.activeDotColor } : {},
    props.activeDotStyle,
  ]

  if (isShowPagination) {
    // 允许自定义样式
    if (renderPagination) {
      return renderPagination(index, total)
    } else {
      return (
        <View pointerEvents="none" style={styles.pagination}>
          {dotsStatus.map((status, key) => {
            return status ? (
              <View key={key} style={dotActiveStyle} />
            ) : (
              <View key={key} style={dotStyle} />
            )
          })}
        </View>
      )
    }
  } else {
    return null
  }
}
