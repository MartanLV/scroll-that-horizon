import Inferno from 'inferno'
import Component from 'inferno-component'
import HorizontalScroll from './HorizontalScroll'
import HorizontalBar from './HorizontalBar'

const Caret = _ => <div style={{
  cursor:'pointer',
  width:'100%',
  height:'100%',
  background:'green',
  opacity:.5,
  borderRadius:7
}}></div>

class Example extends Component {
  zoomIn() {
    this.scroll3.zoomBy(0.2)
  }
  zoomReset() {
    this.scroll3.zoomBy(-Infinity)
  }
  zoomOut() {
    this.scroll3.zoomBy(- 0.2)
  }
  render() {
    return <div style={{border: '1px solid', padding: 30}}>
      <h4>Fixed width view and bar</h4>
      <button onClick={this.zoomIn.bind(this)}>+</button><button onClick={this.zoomOut.bind(this)}>-</button><button onClick={this.zoomReset.bind(this)}>@</button>
      <h6>Bar below view</h6>
      <HorizontalScroll ref={s => this.scroll3 = s} bar={b => this.bar3} wheelZoom selectZoom>
          { this.genRandomContent('responsive') }
      </HorizontalScroll>
      <div style={{height:15,background:'#eee',borderRadius:7, marginTop:20}}>
        <HorizontalBar ref={b => this.bar3 = b} scroll={s => this.scroll3} caret={<Caret/>} resizeLeft resizeRight />
      </div>
      {/*
        <hr />
        <HorizontalScroll ref={s => this.scroll = s} bar={b => this.bar} wheelZoom selectZoom>
            { this.genRandomContent('responsive') }
        </HorizontalScroll>
        <div style={{width: 50 + '%',height:15,background:'#eee',marginLeft:15 + '%',borderRadius:7, marginTop:20}}>
          <HorizontalBar ref={b => this.bar = b} scroll={s => this.scroll} caret={<Caret/>} resizeLeft resizeRight>
          </HorizontalBar>
        </div>
        <hr />
        <div style={{width: 100 + '%',height:15,background:'#eee',borderRadius:7, marginBottom:20}}>
          <HorizontalBar ref={b => this.bar2 = b} scroll={s => this.scroll2} caret={<Caret/>} resizeLeft resizeRight>
          </HorizontalBar>
        </div>
        <div style={{width: 50 + '%'}}>
          <HorizontalScroll ref={s => this.scroll2 = s} bar={b => this.bar2} wheelZoom>
              { this.genRandomContent('responsive') }
          </HorizontalScroll>
        </div>
      */}
    </div>
  }

  genRandomContent(responsive) {
    let i = 0;
    const style = _ => {
      const c = Math.random();
      return {
        height: 80,
        fontFamily: 'monospace',
        background: `#${c.toString(16).substr(-6)}`,
        color: `#${(1 - c).toString(16).substr(-6)}`,
        userSelect: 'none',
        minWidth:20
      }
    }
    const style2 = responsive ? {flex: 1} : {display: 'inline'}
    return [...Array(10)].map(_ => <div style={{...style(), ...style2}}>{++i}</div>)
  }
}

// require('inferno-devtools')
Inferno.render(<Example />, document.getElementById('app'));
