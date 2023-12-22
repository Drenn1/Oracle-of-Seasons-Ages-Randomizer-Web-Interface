import React, { Component } from 'react';
import toTitleCase from '../Utility/Titlecase';

class Log extends Component {
  constructor(props){
    super(props);
    this.state = {
      selectedLocation: "",
      selectedSubLocation: "",
      selectedCategory: "",
      locations: {},
      items: {},
      companion: "Ricky",
    }
    this.locationClick = this.locationClick.bind(this);
    this.itemSelect = this.itemSelect.bind(this);
    this.displayItemName = this.displayItemName.bind(this);
  }

  locationClick(e, key, val){
    e.preventDefault();
    this.setState({
      [key]: val
    })
  }

  displayItemName(item){
    // If from generated seed, log will be provide a string
    // If plando, will be an object that contains object with name and id
    let returnItem;
    if (typeof(item) === 'string'){
      returnItem = toTitleCase(item);
    } else {
      returnItem = toTitleCase(item.name);
    }
    return returnItem === "Flute" ? `${this.state.companion}'s Flute` : returnItem;
  }

  displayPlaythrough(tableClass){
    const spheres =  this.state.locations.playthrough.map((sphere, i)=>{
      const itemList = sphere.map(item => {
        const key = Object.keys(item)[0];
        const itemName = item[key];
        return (
          <tr key={key} id={key}>
            <td className='w-50'>{this.displayItemName(key)}</td>
            <td className='w-50'>{this.displayItemName(itemName)}</td>
          </tr>
        )
      })
      return (
        <div key={`${i}`}>
          <h5>Sphere {i}</h5>
          <table className={tableClass.join(' ')}>
            <thead>
              <tr>
                <th>Location</th>
                <th>Item</th>
              </tr>
            </thead>
            <tbody>
              {itemList}
            </tbody>
          </table>
        </div>
      )
    })

    return spheres;
  }

  itemSelect(e,obj){
    e.preventDefault();
    const {selectedLocation, selectedSubLocation} = this.state;
    const newLocations = {
      ...this.state.locations
    }
    const newItems = {
      ...this.state.items
    }
    if (selectedLocation === '' || selectedSubLocation === ''){
      return
    }
    // If replacing an already placed item, need to add this item back to item pool
    if (newLocations[selectedLocation][selectedSubLocation] !== ''){
      newItems.items[newLocations[selectedLocation][selectedSubLocation].index].placed = false;
    }    
    newLocations[selectedLocation][selectedSubLocation] = obj;
    if (this.state.selectedLocation !== "Seed Trees") {
      newItems.items[obj.index].placed = true;
    }

    this.setState({
      locations: newLocations,
      items: newItems,
      })
  }

  componentWillMount(){
    if (['ooa', 'oos'].includes(this.props.game)){
      const locations = require(`./${this.props.game.toUpperCase()}/Locations.json`);
      const items = require(`./${this.props.game.toUpperCase()}/Items.json`);
      if (this.props.mode ===  'seed'){        
        locations.keys.unshift('playthrough');
        Object.keys(this.props.spoiler).forEach(key => {
          console.log(key);
          locations[key] = this.props.spoiler[key];
          if (['portals', 'dungeons', 'seasons'].includes(key)){
              locations.keys.push(key);
          }
        })
      }
      this.setState({
        selectedLocation: locations.keys[0],
        locations: locations,       
        items: items 
      });
    } else {
      this.props.history.push('/randomize')
    }
  }

  render() {
    const {mode} = this.props;
    const tableClass = ['table', 'table-striped', 'table-sm']
  
    const locationList = this.state.locations.keys.map(key=>{
      const cName = key === this.state.selectedLocation ? 'btn btn-outline-primary p-4' : 'p-4';
      return <a href="/" className={cName} id={key} key={key} onClick={e => {this.locationClick(e, 'selectedLocation', key);this.locationClick(e, 'selectedSubLocation', '')}}>{this.displayItemName(key)}</a>
    })

    let itemList;
    if (this.state.selectedLocation !== 'playthrough'){
      itemList = Object.keys(this.state.locations[this.state.selectedLocation]).map(key => {
        let item = this.state.locations[this.state.selectedLocation][key];
        if (item.length < 1) {
          item = "<Not Set>"
        };
        const cNameRow = key === this.state.selectedSubLocation ? 'table-info' : '';
        return (
          <tr key={key} id={key} onClick={e => this.locationClick(e, 'selectedSubLocation', key)} className={cNameRow}>
            <td className="w-50">{this.displayItemName(key)}</td>
            <td className="w-50">{this.displayItemName(item)}</td>
          </tr>
        )
      })
    }

    let itemTable;
    itemTable = (
      <table className={tableClass.join(' ')}>
        <thead>
          <tr>
            <th>Location</th>
            <th>Item</th>
          </tr>
        </thead>
        <tbody>
          {itemList}
        </tbody>
      </table>
    )
    if (this.state.selectedLocation === 'playthrough'){
      itemTable = this.displayPlaythrough(tableClass);
    }

    if (mode === 'plan'){
      tableClass.push('col-9');
      let {selectedCategory} = this.state
      // New copy to avoid changing component's state
      let categoryArray = this.state.items.keys.map(key=>key);
      if  (this.state.items.specials.includes(this.state.selectedLocation)){
        categoryArray.unshift('Dungeon Items')
       } else if (this.state.selectedLocation === "Seed Trees") {
         categoryArray = ["Seeds"];
         selectedCategory = "Seeds";
       }


      const itemsToPlace = categoryArray.map((category,i) => {
        const filterkey = category === 'Dungeon Items' ? this.state.selectedLocation : category;
        const categoryItems = this.state.items.items.filter( item => item.category === filterkey)
        const itemSelects = categoryItems
          .filter(item => !item.placed)
          .map(item =>
            <option key={`${item.name}-${item.index}`} onClick={e=>this.itemSelect(e, item)}>{this.displayItemName(item)}</option>)
        return (
          <div key={category} className="form-group">
            <h5 className="btn btn-block btn-info" onClick={e=>this.locationClick(e, 'selectedCategory', category)}>{category}</h5>
            <select  id={category} className='form-control' multiple={selectedCategory === category} size="7" hidden={selectedCategory !== category}>
              {itemSelects}
            </select>
          </div>
        )
      })

      const companions = ["Ricky", "Dimitri", "Moosh"].map(companion=> {
        const companionClass = ["btn"];
        companionClass.push(companion === this.state.companion ? 'btn-info' : 'btn-secondary');
        return (
          <button className={companionClass.join(' ')} onClick={e=>this.locationClick(e,'companion', companion)}>{companion}</button>
        )
      })

      itemTable = (
        <div className="row">
          <div className="col-3">
            <h6 className="text-center">Animal Region</h6>
            <div className="btn-group w-100 mb-4" role="group">
              {companions}
            </div>
            {itemsToPlace}
          </div>
        </div>
      )
    }

    return (
      <div className="card">
        <div className="card-header d-flex flex-wrap">
          {locationList}
        </div>
        <div className="card-body">
        {itemTable}
        </div>
      </div>
    )
  }
}

export default Log;
