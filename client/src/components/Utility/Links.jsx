// TODO: Make this generic by not hardcoding the version
export function ngLink(text, link) {
  if (link[0] === '/')
    link = link.substring(1);
  return <a href={"https://github.com/Stewmath/oracles-randomizer-ng/blob/ng-1.0.0/" + link}>
    {text}
  </a>
}
