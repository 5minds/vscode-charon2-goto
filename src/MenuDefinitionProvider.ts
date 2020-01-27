import AbstractDefinitionProvider from './AbstractDefinitionProvider';

const REGEX_FIND_MENU_CALLS = /(\s+menuId=|\s+menu\:\s+)((\')([^\']+)(\')|(\")([^\"]+)(\"))/;
const REGEX_MENU_NAME_SINGLE_QUOTE_MATCH_INDEX = 4;
const REGEX_MENU_NAME_DOUBLE_QUOTE_MATCH_INDEX = 7;

export default class MenuDefinitionProvider extends AbstractDefinitionProvider {
  constructor() {
    super(REGEX_FIND_MENU_CALLS, REGEX_MENU_NAME_SINGLE_QUOTE_MATCH_INDEX, REGEX_MENU_NAME_DOUBLE_QUOTE_MATCH_INDEX);
  }
}
