// The <NgLink> component links to a file in a particular version of
// oracles-randomizer-ng. Only works for tagged versions, otherwise it just
// links to the master branch.
function NgLink(props) {
  var version = props.version;
  var link = props.link;
  const text = props.text;
  if (!version)
    version = '...';

  if (link[0] === '/')
    link = link.substring(1);

  // Check if it's tagged
  if (version.startsWith("ng")) {
    return <a href={"https://github.com/Stewmath/oracles-randomizer-ng/blob/"
                    + version + "/" + link}>
             {text}
           </a>
  }
  else {
    // Not a tagged release, this probably won't go into production so just link
    // to the latest commit
    return <a href={"https://github.com/Stewmath/oracles-randomizer-ng/blob/"
                    + "master/" + link}>
             {text}
           </a>
  }
}

export default NgLink;
