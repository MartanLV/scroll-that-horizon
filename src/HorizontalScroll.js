import Component from 'inferno-component';
import './HorizontalScroll.css';

export default class HorizontalScroll extends Component {
  Bar /* Ref Bar component */

  /**
   * dev
   */
  constructor(props) {
    super(props)
    window.Scroll = this
  }

  /**
   * invoked once Bar component is mounted
   */
  linkWithBar = _ => {
    this.updateConstants()
    this.Bar.Scroll = this
    window.addEventListener('resize', this.linkWithBar)

    // init
    this.positionCaret()
  }

  /**
   * on window resize recalc widths, trigger window.resize manually when a refresh needed
   */
  componentWillUnmount() {
    window.removeEventListener('resize', this.linkWithBar)
  }

  /**
   * it's possible to use just View, without Bar component
   */
  componentDidMount() {
    if (this.Bar = this.props.bar && this.props.bar.constructor == Function && this.props.bar()) {
      this.Bar._mounted && this.linkWithBar() || (this.Bar._linkWithView = this.linkWithBar)
    }
  }

  /**
   * on drag select zoom range, update selectNode styles
   */
  onSelect = e => {
    let deltaScroll = this.innerNode.scrollLeft - this._dragStartScrollLeft,
        deltaPixel = e.pageX - this._dragStartPageX + deltaScroll,
        dynamicProportion = (this._dragStartRelativePosX + deltaPixel) / this.innerNode.scrollWidth,
        left, right

    dynamicProportion < this._dragStartProportion
       && ([left, right] = [dynamicProportion, this._dragStartProportion])
       || ([left, right] = [this._dragStartProportion, dynamicProportion])

    right = 1 - right

    left < 0 && (left = 0)
    right < 0 && (right = 0)

    this.selectNode.style.left = left * 100 + '%'
    this.selectNode.style.right = right * 100 + '%'
  }

  /**
   * on drag select zoom range, store drag start position
   */
  onSelectStart = e => {
    this.zoomNode.style.width = `${this.ZOOM_AT_VIEW * 100}%` // TODO: where else to put this line ?

    this._dragStartScrollLeft = this.innerNode.scrollLeft
    this._dragStartRelativePosX = e.pageX - this.innerNode.getBoundingClientRect().left + this._dragStartScrollLeft
    this._dragStartPageX = e.pageX
    this._dragStartProportion = this._dragStartRelativePosX / this.innerNode.scrollWidth

    document.addEventListener('mousemove', this.onSelect)
    document.addEventListener('mouseup', this.onSelectEnd)
    document.addEventListener('keydown', this.onSelectCancel)
  }

  /**
   * during drag select allow to cancel by escape key
   */
  onSelectCancel = e => {
      e.keyCode === 27 && this.onSelectEnd(e)
  }

  /**
   * on drag select zoom range end, hide select node, zoom in, update
   */
  onSelectEnd = e => {
    document.removeEventListener('mousemove', this.onSelect)
    document.removeEventListener('mouseup', this.onSelectEnd)
    document.removeEventListener('keydown', this.onSelectCancel)

    if (e.constructor === MouseEvent) {
      let {left, right} = this.selectNode.style;

      left = parseFloat(left) / 100
      right = parseFloat(right) / 100

      this.setViewport({left, right})
    }

    // hide selectNode
    this.selectNode.style.left = '-100%'
    this.selectNode.style.right = '200%'
  }

  /**
   * adjuststs zoom and position
   */
  setViewport({left, right}) {
    const isClickTest = left + right;
    if (isNaN(isClickTest) || isClickTest === 1) return

    let partSelectedFromInnerWidth = 1 - left - right
    let imaginaryOuterWidth = partSelectedFromInnerWidth * this.innerNode.scrollWidth
    let newZoom = this.innerNode.scrollWidth / imaginaryOuterWidth

    if (newZoom <= 0) newZoom = 1

    this.zoomNode.style.width = `${newZoom * 100}%`
    this.innerNode.scrollLeft = this.innerNode.scrollWidth * left

    this.updateConstants()
    this.positionCaret()
  }

  /**
   * assign constants used thru out app, but they are not constant's, just capitalized properties
   */
  updateConstants() {
    this.VIEW_TO_BAR_PIXEL_K = this.Bar.mapNode.scrollWidth / this.outerNode.scrollWidth
    this.BAR_TO_VIEW_PIXEL_K = 1 / this.VIEW_TO_BAR_PIXEL_K
    this.ZOOM_AT_BAR = this.outerNode.scrollWidth / this.innerNode.scrollWidth
    this.ZOOM_AT_VIEW = 1 / this.ZOOM_AT_BAR
  }

  /**
   * as well position caret resize handles
   */
  positionCaret() {
    const left = this.ZOOM_AT_BAR * this.innerNode.scrollLeft / this.Bar.mapNode.scrollWidth
    const right = 1 - (left + this.ZOOM_AT_BAR)

    this.Bar.caretNode.style.left = `${left * 100}%`
    this.Bar.caretNode.style.right = `${right * 100}%`

    this.Bar.caretNodeLeft.style.left = `${left * 100}%`
    this.Bar.caretNodeRight.style.right = `${right * 100}%`
  }

  /**
   * viewport description
   */
  getCurrentLeftAndRight() {
    const left = this.innerNode.scrollLeft / this.innerNode.scrollWidth,
          right = 1 - this.ZOOM_AT_BAR - left

    return { left, right }
  }

  /**
   * zoom towards mouse pointer, TODO: throttle this
   */
  zoomByScroll = e => {
    let mousePosAtOuterNode = this.outerNode.scrollLeft + e.pageX - this.outerNode.getBoundingClientRect().left
    let zoomTowardPoint = mousePosAtOuterNode / this.outerNode.scrollWidth
    this.zoomBy(e.deltaY * 0.005, zoomTowardPoint)
  }

  /**
   * if browser invoked scroll event or horizontal wheel, update caret pos
   * if vertical + meta key, zoomFn
   */
  wheel = e => {
    (e.deltaX || !e.composed) && this.positionCaret()
    !e.deltaX && e.deltaY && e.metaKey && this.zoomByScroll(e)
  }

  /**
   * positive or negative float to zoom by
   * center - pan that zoom 0 to 1
   */
  zoomBy(factor, center = 0.5) {
    let {left, right} = this.getCurrentLeftAndRight()
    factor = this.ZOOM_AT_BAR * factor

    left += factor * center
    right += factor * (1 - center)

    this.setViewport({left, right})
  }

  /**
   * state is maintained only at dom node properties
   * component shall render just once, ever
   */
  render(props) {
    return <div class="HorizontalScroll" onMousedown={ this.onSelectStart.bind(this) }>
      <div ref={n => this.outerNode = n} class="HorizontalScroll-outer">
        <div onWheel={this.wheel} onScroll={this.wheel} ref={n => this.innerNode = n} class="HorizontalScroll-inner">
          <div class="HorizontalScroll-zoom" ref={n => this.zoomNode = n} style={{ display: 'flex' }}>
            <div class="Select" ref={n => this.selectNode = n} />
            { props.children }
          </div>
        </div>
      </div>
    </div>
  }
}
