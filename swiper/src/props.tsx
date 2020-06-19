/**
 * @file 默认的属性
 */

import { SwiperProps, AutoplayDirection } from './type'

const defaultSwiperProps: Partial<SwiperProps> = {
  horizontal: true,
  pagingEnabled: true,
  showsHorizontalScrollIndicator: false,
  showsVerticalScrollIndicator: false,
  bounces: false,
  scrollsToTop: false,
  removeClippedSubviews: true,
  automaticallyAdjustContentInsets: false,
  showsPagination: true,
  loop: true,
  autoplay: true,
  autoplayTimeout: 2.5,
  autoplayDirection: AutoplayDirection.After,
  index: 0,
  onIndexChanged: () => null,
}

export default defaultSwiperProps
