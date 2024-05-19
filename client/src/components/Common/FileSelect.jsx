import React, {useState} from 'react';

import {checkSum} from '../Utility/Storage';

function FileSelect(props) {
  const [failing, setFailing] = useState(false);

  const fileInput = React.createRef();
  var game = 'Seasons';

  function handleFile(){
    const passed = checkSum(fileInput.current.files[0], props.game, props.checkGame);
    if (!passed) {
      setFailing(true);
    }
  }

  function inputDisplay(text, cName) {
    if (props.valid) {
      const validClass = ['border', 'border-success', 'alert-success', 'h-100', 'pt-1', 'text-center'];
      return(
        <div className={validClass.join(' ')}>Oracle of {props.game} Rom Loaded</div>
      )
    } else {
      const inputClass = ['custom-file'];
      if (props.classes){
        props.classes.forEach(classname=>{inputClass.push(classname)})
      }
      return (
        <div className="custom-file">
          <input type="file" name="file" id="file" className="custom-file-input" ref={fileInput} onChange={handleFile} />
          <label htmlFor="file" className={cName.join(' ')}>{text}</label>
        </div>
      )
    }
  }

  // Should only display error message on hash not matching. Should disappear on game change.
  const shouldDisplayError = failing && game === props.game;
  const text = shouldDisplayError
        ? `Not a valid Oracle of ${props.game} rom`
        : `Select Oracle of ${props.game} Rom (English)`;
  const cName = ['custom-file-label'];

  if (shouldDisplayError) {
    cName.push('bg-danger', 'text-light')
  }

  const input = inputDisplay(text, cName);

  game = props.game;
  return (
    <div className="col-md">
      {input}
    </div>
  )
}

export default FileSelect;
