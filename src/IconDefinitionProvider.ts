import AbstractDefinitionProvider from './AbstractDefinitionProvider';

const REGEX_FIND_ICON_CALLS = /(<Icon\ \s+id=|\s+icon\:\s+)((\')([^\']+)(\')|(\")([^\"]+)(\"))/;
const REGEX_ICON_NAME_SINGLE_QUOTE_MATCH_INDEX = 4;
const REGEX_ICON_NAME_DOUBLE_QUOTE_MATCH_INDEX = 7;

export default class IconDefinitionProvider extends AbstractDefinitionProvider {
  constructor() {
    super(REGEX_FIND_ICON_CALLS, REGEX_ICON_NAME_SINGLE_QUOTE_MATCH_INDEX, REGEX_ICON_NAME_DOUBLE_QUOTE_MATCH_INDEX);
  }
}
