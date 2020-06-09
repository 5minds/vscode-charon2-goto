import AbstractDefinitionProvider from './AbstractDefinitionProvider';

const REGEX_FIND_COMMAND_CALLS = /(\.isCommandEnabled\(|.executeCommand\(|[\{\s]cmd\(|[\"\'a-zA-Z]\:\s+)((\')([^\']+)(\')|(\")([^\"]+)(\"))/;
const REGEX_FIND_COMMAND_NAME_SINGLE_QUOTE_MATCH_INDEX = 4;
const REGEX_FIND_COMMAND_NAME_DOUBLE_QUOTE_MATCH_INDEX = 7;

const REGEX_COMPLETE_COMMAND_CALLS = /(\.isCommandEnabled\(|.executeCommand\(|[\{\s]cmd\(|[\"\']?command[\"\']?[\:\=]\s?)((\')([^\']*)|(\")([^\"]*))/;
const REGEX_COMPLETE_COMMAND_NAME_SINGLE_QUOTE_MATCH_INDEX = 4;
const REGEX_COMPLETE_COMMAND_NAME_DOUBLE_QUOTE_MATCH_INDEX = 7;

export default class CommandDefinitionProvider extends AbstractDefinitionProvider {
  constructor() {
    super(
      REGEX_FIND_COMMAND_CALLS,
      REGEX_FIND_COMMAND_NAME_SINGLE_QUOTE_MATCH_INDEX,
      REGEX_FIND_COMMAND_NAME_DOUBLE_QUOTE_MATCH_INDEX,
      REGEX_COMPLETE_COMMAND_CALLS,
      REGEX_COMPLETE_COMMAND_NAME_SINGLE_QUOTE_MATCH_INDEX,
      REGEX_COMPLETE_COMMAND_NAME_DOUBLE_QUOTE_MATCH_INDEX
    );
  }
}
