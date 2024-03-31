import YAML from 'yaml';
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

    // Load sprite config data
    fetch(`/sprite-config.yaml`).then(res => {
      res.text().then(buffer => {
        this.sprites = YAML.parse(buffer);

        // Grab images for all sprites
        for (let [id,sprite] of Object.entries(this.sprites)) {
          fetch(`/img/${id}.gif`).then(res => {
            res.arrayBuffer().then(buffer => {
              spriteBuffers[id] = buffer;
              if (this.sprites.length === spriteBuffers.length){
                // Update after all sprites are loaded
                this.forceUpdate();
              }
            })
          })
        };
      })
    });
  }

  setOptionsP(){
    return ['Green', 'Blue', 'Red', 'Gold', 'Blue (alt)', 'Red (alt)'].map((color,i)=> (<option key={color} value={i}>{color}</option>))
  }

  setOptionsS(){
    if (this.sprites === undefined)
      return <></>

    return Object.entries(this.sprites).map(([id, sprite]) => {
      return (
        <a key={id} value={id} className="dropdown-item" href='#'
           onClick={e => this.props.setSprite(id, this.sprites[id].defaultPalette)}>
          <img src={`/img/${id}.gif`} alt={`${sprite.display}-Sprite`} height="32" className="mr-4"/>
          <span className="font-weight-bold">{sprite.display}</span>
        </a>
      )
    })
  }

  setSpriteImage(){
    if (this.sprites === undefined || spriteBuffers.length !== this.sprites.length)
      return <></>

    const gifArray = new Uint8Array(spriteBuffers[this.props.selectedSprite])
    palettes[this.props.paletteIndex].forEach((val,i)=>{
      gifArray[i+13] = val;
    })
    const blob = new Blob([gifArray], {type: 'image/gif'})
    const baseURL = window.URL;
    const imgURL = baseURL.createObjectURL(blob)
    return (<img src={imgURL}  alt="Link-Sprite" className="mr-3 mt-5 d-inline align-middle" id="link-sprite"/>)
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
              {this.sprites ? this.sprites[this.props.selectedSprite].display : "Loading..."}
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
