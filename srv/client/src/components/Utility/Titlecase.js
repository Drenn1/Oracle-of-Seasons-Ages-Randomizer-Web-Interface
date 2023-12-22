export default function toTitleCase(txt) {
  let nonalpha = false;
  const regex = /[0-9a-zA-Z']/g;
  return txt.split('')
    .map( (letter,i) => {
      let cap = i === 0 || nonalpha;
      nonalpha = letter.match(regex) === null;
      return cap ? letter.toUpperCase() : letter.toLowerCase()
    })
    .join('')
}