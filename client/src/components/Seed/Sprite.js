import React, {Component} from 'react'
import Palettes from '../Utility/Palettes';
const palettes = Palettes();
const spriteBuffers = {};

class Sprite extends Component {
  constructor(props){
    super(props);
    this.setOptionsP = this.setOptionsP.bind(this);
    this.setOptionsS = this.setOptionsS.bind(this);
    this.setSpriteImage = this.setSpriteImage.bind(this);

    Object.entries(this.props.sprites).map(([id,sprite]) => {
      fetch(`/img/${id}.gif`)
      .then(res =>{
        res.arrayBuffer()
        .then(buffer => {
          spriteBuffers[id] = buffer;
          if (this.props.sprites.length === spriteBuffers.length){
            this.forceUpdate();
          }
        })
      })
    });
  }

  setOptionsP(){
    return ['Green', 'Blue', 'Red', 'Gold', 'Blue (alt)', 'Red (alt)'].map((color,i)=> (<option key={color} value={i}>{color}</option>))
  }

  setOptionsS(){
    /*
    *   Each sprite has the following properties:
    *     name - string representing the filename
    *     defaultPalette: Number respresenting the default palette index used by the sprite
    *     display - string representing name displayed on site
    *     separatePatches - Boolean representing if there are animation patches in addition to graphics patches and will be game specific
    */
    return Object.entries(this.props.sprites).map(([id, sprite]) => {
      return (
        <a key={id} value={id} className="dropdown-item" href='#' onClick={e => this.props.setSprite(id)}>
          <img src={`/img/${id}.gif`} alt={`${sprite.display}-Sprite`} height="32" className="mr-4"/>
          <span className="font-weight-bold">{sprite.display}</span>
        </a>
      )
    })
  }

  setSpriteImage(){
    if (spriteBuffers.length === this.props.sprites.length) {
      const gifArray = new Uint8Array(spriteBuffers[this.props.selectedSprite])
      palettes[this.props.paletteIndex].forEach((val,i)=>{
        gifArray[i+13] = val;
      })    
      const blob = new Blob([gifArray], {type: 'image/gif'})
      const baseURL = window.URL;
      const imgURL = baseURL.createObjectURL(blob)
      return (<img src={imgURL}  alt="Link-Sprite" className="mr-3 mt-5 d-inline align-middle" id="link-sprite"/>)
    } else {
      return (<div></div>)
    }
  }

  render(){
    const paletteOptions = this.setOptionsP();
    const spriteOptions = this.setOptionsS();
    let mainImg = this.setSpriteImage();

    return (
      <div className="mt-4 ml-2 media">
        <div className="h-100">
          {mainImg}
        </div>
        <div className="media-body mr-2">
          <h4>Link Sprite Selection</h4>
          <div className="dropdown">
            <button className="btn btn-primary btn-block dropdown-toggle" type="button" id="spriteDropdown"
                    data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {this.props.sprites[this.props.selectedSprite].display}
            </button>
            <div className="dropdown-menu" aria-labelledby="spriteDropdown">
              {spriteOptions}
            </div>
          </div>
          <h4 className="mt-4">Sprite Palette Selection</h4>
          <div className="input-group">
            <select className="custom-select" name="paletteIndex" id="paletteIndex"
                    value={this.props.paletteIndex}
                    onChange={e=>this.props.setPalette(parseInt(e.target.value))}>
              {paletteOptions}
            </select>
          </div>
        </div>      
      </div>
    )
  }
}

export default Sprite;
