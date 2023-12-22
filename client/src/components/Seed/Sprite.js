import React, {Component} from 'react'
import Palettes from '../Utility/Palettes';
const palettes = Palettes();
const spriteBuffers = [];

class Sprite extends Component {
  constructor(props){
    super(props);
    this.state = {
      sprite: 0
    }
    this.setOptionsP = this.setOptionsP.bind(this);
    this.setOptionsS = this.setOptionsS.bind(this);
    this.setSprite = this.setSprite.bind(this);
    this.setSpriteImage = this.setSpriteImage.bind(this);

    this.props.sprites.forEach((sprite,i) => {
      spriteBuffers.push(i);
      fetch(`/img/${sprite.name}.gif`)
      .then(res =>{
        res.arrayBuffer()
        .then(buffer => {
          spriteBuffers[i] = buffer;
          if (this.props.sprites.length === spriteBuffers.length){
            this.forceUpdate();
          }
        })
      })
    });
  }

  setSprite(e,i){
    e.preventDefault();
    e.target.value = i;
    this.props.setSprite(e, "sprite");
    this.setState({
      sprite: i
    })
  }

  setOptionsP(){
    return ['Green', 'Blue', 'Red', 'Gold', 'Blue (Inverted)', 'Red (Inverted)'].map((color,i)=> (<option key={color} value={i}>{color}</option>))
  }

  setOptionsS(){
    /*
    *   Each sprite has the following properties:
    *     name - string representing the filename
    *     defaultPalette: Number respresenting the default palette index used by the sprite
    *     display - string representing name displayed on site
    *     separatePatches - Boolean representing if there are animation patches in addition to graphics patches and will be game specific
    */
    return this.props.sprites.map((sprite, i) =>{
      return (
        <a key={sprite.name} value={sprite.name} className="dropdown-item" href='/' onClick={e=> this.setSprite(e,i)}>
          <img src={`/img/${sprite.name}.gif`} alt={`${sprite.display}-Sprite`} height="32" className="mr-4"/>
          <span className="font-weight-bold">{sprite.display}</span>
        </a>
      )
    })
  }

  setSpriteImage(){
    if (spriteBuffers.length === this.props.sprites.length) {
      const gifArray = new Uint8Array(spriteBuffers[this.state.sprite])
      palettes[this.props.selectedPalette].forEach((val,i)=>{
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

  componentDidUpdate(prevProps, prevState, snapshot){
    if (this.state.sprite !== prevState.sprite){
      const e = {target: {value: this.props.sprites[this.state.sprite].defaultPalette}};
      this.props.setSprite(e, 'palette')
    }
  }

  render(){
    const paletteOptions = this.setOptionsP();
    const spriteOptions = this.setOptionsS();
    // const spriteLink = this.props.sprites[this.state.sprite].name;
    let mainImg = this.setSpriteImage();

    return (
      <div className="mt-4 ml-2 media">
        <div className="h-100">
          {mainImg}
        </div>
        <div className="media-body mr-2">
          <h4>Link Sprite Selection</h4>
          <div className="dropdown">
            <button className="btn btn-primary btn-block dropdown-toggle" type="button" id="spriteDropdown" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              {this.props.sprites[this.state.sprite].display}
            </button>
            <div className="dropdown-menu" aria-labelledby="spriteDropdown">
              {spriteOptions}
            </div>
          </div>
          <h4 className="mt-4">Sprite Palette Selection</h4>
          <div className="input-group">
            <select className="custom-select" name="paletteIndex" id="paletteIndex" value={this.props.selectedPalette} onChange={e=>this.props.setSprite(e, "palette")}>
              {paletteOptions}
            </select>
          </div>
        </div>      
      </div>
    )
  }
}

export default Sprite;
