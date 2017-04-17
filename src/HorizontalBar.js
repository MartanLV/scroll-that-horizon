import { NO_OP } from 'inferno';
import Component from 'inferno-component';
import './HorizontalScroll.css';

export default class HorizontalBar extends Component {
  Scroll  /* Ref Scroll component */

  /**
   * dev
   */
  constructor(props) {
    super(props)
    window.Bar = this
  }

  /**
   * links with View via callback, if Bar is mounted later than view
   */
  componentDidMount() {
    this._linkWithView && this._linkWithView()
    this._mounted = true
  }

  onDrag = e => {
    let deltaPixel = e.pageX - this.dragStartPixel,
        deftaPixelAtView = deltaPixel * this.Scroll.ZOOM_AT_VIEW,
        deltaViewRatio = deftaPixelAtView / this.Scroll.innerNode.scrollWidth,
        left = this.dragStartLeft + deltaViewRatio,
        right = this.dragStartRight - deltaViewRatio

    this.Scroll.setViewport({ left, right })
  }

  onResizeLeft = e => {
    let deltaPixel = e.pageX - this.dragStartPixel,
        deftaPixelAtView = deltaPixel * this.Scroll.ZOOM_AT_VIEW,
        deltaViewRatio = deftaPixelAtView / this.Scroll.innerNode.scrollWidth,
        left = this.dragStartLeft + deltaViewRatio

    this.Scroll.setViewport({ left, right: this.dragStartRight })
  }

  onResizeRight = e => {
    let deltaPixel = e.pageX - this.dragStartPixel,
        deftaPixelAtView = deltaPixel * this.Scroll.ZOOM_AT_VIEW,
        deltaViewRatio = deftaPixelAtView / this.Scroll.innerNode.scrollWidth,
        right = this.dragStartRight - deltaViewRatio

    this.Scroll.setViewport({ left: this.dragStartLeft, right })
  }

  linkDragEvent(evName) {
    return e => {
      let {left, right} = this.Scroll.getCurrentLeftAndRight()

      this.dragStartLeft = left
      this.dragStartRight = right

      this.dragStartPixel = e.pageX

      document.addEventListener('mousemove', this[evName])
      this[evName + 'End'] = _ => {
        document.removeEventListener('mousemove', this[evName])
        document.removeEventListener('mouseup', this[evName + 'End'])
      }
      document.addEventListener('mouseup', this[evName + 'End'])
    }
  }

  render(props) {
    return <div class="HorizontalBar">

      <div
        class="HorizontalBar-map"
        ref={n => this.mapNode = n}
      >{ props.children }</div>

      <div
        onMousedown={this.linkDragEvent('onResizeLeft')}
        ref={n => this.caretNodeLeft = n}
        style={{
          cursor: 'ew-resize',
          width: 3,
        }} class="HorizontalBar-caret-left">{ props.resizeLeft }</div>
      <div
        onMousedown={this.linkDragEvent('onDrag')}
        class="HorizontalBar-caret"
        ref={n => this.caretNode = n}
      >{ props.caret ? this.zoom === undefined ? props.caret : { NO_OP } : 'asd' }</div>

      <div
        onMousedown={this.linkDragEvent('onResizeRight')}
        ref={n => this.caretNodeRight = n}
        style={{
          opacity: .4,
          cursor: 'ew-resize',
          right: `${this.right * 100}%`,
          width: 3,
        }} class="HorizontalBar-caret-right">{ props.resizeRight }</div>
    </div>
  }
}
