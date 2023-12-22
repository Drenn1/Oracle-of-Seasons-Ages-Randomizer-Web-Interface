import React, {Component} from 'react';
import {checkSum} from '../Utility/Storage';

class FileSelect extends Component{
  constructor(){
    super();
    this.state = {
      failing: false,
    }
    this.fileInput = React.createRef();
    this.game = 'Seasons';
    this.handleFile = this.handleFile.bind(this);
    this.inputDisplay = this.inputDisplay.bind(this);
  }

  handleFile(){
    const passed = checkSum(this.fileInput.current.files[0], this.props.game, this.props.checkGame);
    if (!passed) {
      this.setState({
        failing: true
      })
    }
  }

  inputDisplay(text, cName) {
    if (this.props.valid) {
      const validClass = ['border', 'border-success', 'alert-success', 'h-100', 'pt-1', 'text-center'];
      return(
        <div className={validClass.join(' ')}>Oracle of {this.props.game} Rom Loaded</div>
      )
    } else {
      const inputClass = ['custom-file'];
      if (this.props.classes){
        this.props.classes.forEach(classname=>{inputClass.push(classname)})
      }
      return (
        <div className="custom-file">
          <input type="file" name="file" id="file" className="custom-file-input" ref={this.fileInput} onChange={this.handleFile} />
          <label htmlFor="file" className={cName.join(' ')}>{text}</label>
        </div>
      )
    }
  }

  render() {
    // Should only display error message on hash not matching. Should disappear on game change.
    const shouldDisplayError = this.state.failing && this.game === this.props.game;
    const text = shouldDisplayError ? `Not a valid Oracle of ${this.props.game} rom`: `Select Oracle of ${this.props.game} Rom (English)`;
    const cName = ['custom-file-label'];

    if (shouldDisplayError){
      cName.push('bg-danger', 'text-light')
    }

    const input = this.inputDisplay(text, cName);

    this.game = this.props.game;
    return (
      <div className="col-md">
        {input}
      </div>
    )
  }
}

export default FileSelect;
